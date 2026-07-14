import assert from 'node:assert/strict'
import test from 'node:test'

import worker from '../main.js'

class FakeD1Database {
    exec() {}

    prepare(query) {
        return {
            bind: (...bindings) => ({
                run: async () => this.run(query, bindings),
            }),
            run: async () => this.run(query, []),
        }
    }

    async run(query) {
        if (query.includes('SELECT `token` FROM `devices`')) {
            return { results: [{ token: 'test-device-token' }] }
        }

        if (query.includes('SELECT `token`, `time` FROM `authorization`')) {
            return {
                results: [{
                    token: 'test-authorization-token',
                    time: String(Math.floor(Date.now() / 1000)),
                }],
            }
        }

        return { results: [] }
    }
}

function createWorkerContext() {
    const pending = []

    return {
        context: {
            waitUntil(promise) {
                pending.push(promise)
            },
        },
        async settle() {
            await Promise.all(pending)
        },
    }
}

async function push(payload) {
    const apnsRequests = []
    const originalFetch = globalThis.fetch

    globalThis.fetch = async (url, init) => {
        apnsRequests.push({ url, init })
        return new Response(null, { status: 200 })
    }

    try {
        const { context, settle } = createWorkerContext()
        const response = await worker.fetch(new Request('https://worker.example/push', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
        }), {
            database: new FakeD1Database(),
            ALLOW_NEW_DEVICE: 'false',
            ALLOW_QUERY_NUMS: 'false',
            ROOT_PATH: '/',
        }, context)

        await settle()

        assert.equal(response.status, 200)
        assert.equal(apnsRequests.length, 1)

        return JSON.parse(apnsRequests[0].init.body)
    } finally {
        globalThis.fetch = originalFetch
    }
}

test('GET /ping remains compatible with the client health check', async () => {
    const { context, settle } = createWorkerContext()
    const response = await worker.fetch(new Request('https://worker.example/ping'), {
        database: new FakeD1Database(),
        ALLOW_NEW_DEVICE: 'false',
        ALLOW_QUERY_NUMS: 'false',
        ROOT_PATH: '/',
    }, context)

    await settle()

    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.code, 200)
    assert.equal(body.message, 'pong')
    assert.equal(typeof body.timestamp, 'number')
})

test('POST /push preserves the current client contract in the APNs payload', async () => {
    const payload = await push({
        device_key: 'test-device-key',
        title: 'Build complete',
        body: 'All checks passed',
        group: 'Codex',
        sound: 'bell',
        icon: 'https://example.com/icon.png',
        url: 'https://example.com/result',
        copy: 'result-id',
        level: 'active',
        badge: 1,
    })

    assert.deepEqual(payload.aps.alert, {
        title: 'Build complete',
        body: 'All checks passed',
    })
    assert.equal(payload.aps.sound, 'bell.caf')
    assert.equal(payload.aps['thread-id'], 'Codex')
    assert.equal(payload.group, 'Codex')
    assert.equal(payload.icon, 'https://example.com/icon.png')
    assert.equal(payload.url, 'https://example.com/result')
    assert.equal(payload.copy, 'result-id')
    assert.equal(payload.level, 'active')
    assert.equal(payload.badge, '1')
})

test('POST /push preserves badge=0 as a string so Bark can clear the badge', async () => {
    const payload = await push({
        device_key: 'test-device-key',
        title: 'Badge cleared',
        body: 'No unread notifications',
        group: 'Codex',
        badge: 0,
    })

    assert.equal(payload.badge, '0')
})

test('POST /push forwards every supported interruption level', async (t) => {
    for (const level of ['passive', 'active', 'timeSensitive', 'critical']) {
        await t.test(level, async () => {
            const payload = await push({
                device_key: 'test-device-key',
                title: `Level: ${level}`,
                body: 'Compatibility check',
                group: 'Codex',
                level,
            })

            assert.equal(payload.level, level)
        })
    }
})
