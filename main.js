export default {
    async fetch(request, env, ctx) {
        return await handleRequest(request, env, ctx)
    }
}

// 这里决定是否允许新建设备
const isAllowNewDevice = false
// 是否允许查询设备数量
const isAllowQueryNums = false

async function handleRequest(request, env, ctx) {
    const { searchParams, pathname } = new URL(request.url)
    const handler = new Handler(env)

    switch (pathname) {
        case "/register": {
            return handler.register(searchParams)
        }
        case "/ping": {
            return handler.ping(searchParams)
        }
        case "/healthz": {
            return handler.healthz(searchParams)
        }
        case "/info": {
            return handler.info(searchParams)
        }
        default: {
            const pathParts = pathname.split('/')

            if(pathParts[1]){
                const contentType = request.headers.get('content-type')
                let requestBody = {}

                try {
                    if (contentType && contentType.includes('application/json')) {
                        requestBody = await request.json()
                    }else if (contentType && contentType.includes('application/x-www-form-urlencoded')){
                        const formData = await request.formData()
                        formData.forEach((value, key) => {requestBody[key] = value})
                    }else{
                        const {searchParams} = new URL(request.url)
                        searchParams.forEach((value, key) => {requestBody[key] = value})

                        if (pathParts.length === 3) {
                            requestBody.body = pathParts[2]
                        } else {
                            requestBody.title = pathParts[2]
                            requestBody.body = pathParts[3]
                        }
                    }
                } catch (err) {
                    return new Response(JSON.stringify({
                        'code': 400,
                        'message': `request bind failed: ${err}`,
                        'timestamp': util.getTimestamp(),
                    }), { status: 400 })
                }

                if(pathname != '/push'){
                    requestBody.device_key = pathParts[1]
                }

                return handler.push(requestBody)
            }

            return new Response(JSON.stringify({
                'code': 404,
                'message': `Cannot ${request.method} ${pathname}`,
                'timestamp': util.getTimestamp()
            }), { status: 404 })
        }
    }
}

/**
 * Class Handler
 */
class Handler {
    constructor(env) {
        this.version = "v2.0.1"
        this.build = "2024-02-06 17:49:15"
        this.arch = "js"
        this.commit = "c1b17d6d0adc7dd5beeea4144bb74dc32671e92d"

        const db = new Database(env)

        this.register = async (parameters) => {

            const param_devicetoken = parameters.get('devicetoken')
            let param_key = parameters.get('key')

            if (!param_devicetoken) {
                return new Response(JSON.stringify({
                    'message': 'device token is empty',
                    'code': 400,
                    'timestamp': util.getTimestamp(),
                }), { status: 400 })
            }

            if (!param_key) {
                if (isAllowNewDevice) {
                    param_key = util.newShortUUID()
                    await db.saveDeviceTokenByKey(param_key, param_devicetoken)
                } else {
                    return new Response(JSON.stringify({
                        'message': "device registration failed: register disabled",
                        'code': 500,
                    }), { status: 500 })
                }
            }

            const deviceToken = await db.deviceTokenByKey(param_key)
            if (await deviceToken != param_devicetoken) {
                if (isAllowNewDevice) {
                    param_key = util.newShortUUID()
                    await db.saveDeviceTokenByKey(param_key, param_devicetoken)
                } else {
                    return new Response(JSON.stringify({
                        'message': "device registration failed: register disabled",
                        'code': 500,
                    }), { status: 500 })
                }
            }

            return new Response(JSON.stringify({
                'message': 'success',
                'code': 200,
                'timestamp': util.getTimestamp(),
                'data': {
                    'key': param_key,
                    'device_key': param_key,
                    'device_token': param_devicetoken,
                },
            }), { status: 200 })
        }

        this.ping = async (parameters) => {
            return new Response(JSON.stringify({
                'message': 'pong',
                'code': 200,
                'timestamp': util.getTimestamp(),
            }), { status: 200 })
        }

        this.healthz = async (parameters) => {
            return new Response("ok")
        }

        this.info = async (parameters) => {
            if (isAllowQueryNums) {
                this.devices = await db.countAll()
            }

            return new Response(JSON.stringify({
                'version': this.version,
                'build': this.build,
                'arch': this.arch,
                'commit': this.commit,
                'devices': this.devices,
            }), { status: 200 })
        }

        this.push = async (parameters) => {
            // return new Response(JSON.stringify(parameters))
            const deviceToken = await db.deviceTokenByKey(parameters.device_key)

            if (!deviceToken) {
                return new Response(JSON.stringify({
                    'code': 400,
                    'message': `failed to get device token: failed to get [${parameters.device_key}] device token from database`,
                    'timestamp': util.getTimestamp(),
                }), { status: 400 })
            }

            let title = parameters.title || undefined
            if(title){
                title = decodeURIComponent(title)
            }
            const body = decodeURIComponent(parameters.body || "NoContent")

            let sound = parameters.sound || '1107'
            if (!sound.endsWith('.caf')) {
                sound += '.caf'
            }
            const category = parameters.category || 'myNotificationCategory'
            const group = parameters.group || 'Default'

            const isArchive = parameters.isArchive || undefined
            const icon = parameters.icon || undefined
            const url = parameters.url || undefined
            const level = parameters.level || undefined
            const copy = parameters.copy || undefined
            const badge = parameters.badge || 0
            const autoCopy = parameters.autoCopy || undefined
            
            let ciphertext = parameters.ciphertext || undefined

            let aps = {
                'aps': {
                    'alert': {
                        'action': undefined,
                        'action-loc-key': undefined,
                        'body': body,
                        'launch-image': undefined,
                        'loc-args': undefined,
                        'loc-key': undefined,
                        'title': title,
                        'subtitle': undefined,
                        'title-loc-args': undefined,
                        'title-loc-key': undefined,
                        'summary-arg': undefined,
                        'summary-arg-count': undefined,
                    },
                    'badge': 0,
                    'category': category,
                    'content-available': undefined,
                    'interruption-level': undefined,
                    'mutable-content': 1,
                    'relevance-score': undefined,
                    'sound': {
                        'critical': 0,
                        'name': sound,
                        'volume': 1.0,
                    },
                    'thread-id': group,
                    'url-args': undefined,
                },
                // ExtParams
                'isarchive': isArchive,
                'icon': icon,
                'ciphertext': ciphertext,
                'level': level,
                'url': url,
                'copy': copy,
                'badge': badge,
                'autocopy': autoCopy,
            }
            // return new Response(JSON.stringify(aps))

            const apns = new APNs(env)

            const response = await apns.push(deviceToken, aps)

            if (response.status === 200) {
                return new Response(JSON.stringify({
                    'message': 'success',
                    'code': 200,
                    'timestamp': util.getTimestamp(),
                }), { status: 200 })
            } else {
                return new Response(JSON.stringify({
                    // 'message': `push failed: ${Object.values(JSON.parse(await response.text()))[0]}`,
                    'message': `push failed: ${JSON.parse(await response.text()).reason}`,
                    'code': response.status,
                    'timestamp': util.getTimestamp(),
                }), { status: response.status })
            }
        }
    }
}

/**
 * Class APNs
 */
class APNs {
    constructor(env) {
        const kvStorage = env.database

        // Private Function
        const generateAuthToken = async () => {
            const TOKEN_KEY = `
            -----BEGIN PRIVATE KEY-----
            MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg4vtC3g5L5HgKGJ2+
            T1eA0tOivREvEAY2g+juRXJkYL2gCgYIKoZIzj0DAQehRANCAASmOs3JkSyoGEWZ
            sUGxFs/4pw1rIlSV2IC19M8u3G5kq36upOwyFWj9Gi3Ejc9d3sC7+SHRqXrEAJow
            8/7tRpV+
            -----END PRIVATE KEY-----
            `

            // Parse private key
            const privateKeyPEM = TOKEN_KEY.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----END PRIVATE KEY-----', '').replace(/\s/g, '')

            // Decode private key
            const privateKeyArrayBuffer = util.base64ToArrayBuffer(privateKeyPEM)
            const privateKey = await crypto.subtle.importKey('pkcs8', privateKeyArrayBuffer, { name: 'ECDSA', namedCurve: 'P-256', }, false, ['sign'])

            const TEAM_ID = '5U8LBRXG3A'
            const AUTH_KEY_ID = 'LH4T9V5U4R'

            // Generate the JWT token
            const JWT_ISSUE_TIME = util.getTimestamp()
            const JWT_HEADER = btoa(JSON.stringify({ alg: 'ES256', kid: AUTH_KEY_ID })).replace('+', '-').replace('/', '_').replace(/=+$/, '')
            const JWT_CLAIMS = btoa(JSON.stringify({ iss: TEAM_ID, iat: JWT_ISSUE_TIME })).replace('+', '-').replace('/', '_').replace(/=+$/, '')
            const JWT_HEADER_CLAIMS = JWT_HEADER + '.' + JWT_CLAIMS
            // Sign
            const jwtArray = new TextEncoder().encode(JWT_HEADER_CLAIMS)
            const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, jwtArray)
            const signatureArray = new Uint8Array(signature)
            const JWT_SIGNED_HEADER_CLAIMS = btoa(String.fromCharCode(...signatureArray)).replace('+', '-').replace('/', '_').replace(/=+$/, '')
            const AUTHENTICATION_TOKEN = JWT_HEADER_CLAIMS + '.' + JWT_SIGNED_HEADER_CLAIMS

            return AUTHENTICATION_TOKEN
        }

        const getAuthToken = async () => {
            let authToken = await kvStorage.get('_authToken_')
            if (authToken) {
                return await authToken
            }
            authToken = await generateAuthToken()
            await kvStorage.put('_authToken_', authToken, { expirationTtl: 3000 })
            return authToken
        }

        this.push = async (deviceToken, aps) => {
            const TOPIC = 'me.fin.bark'
            const APNS_HOST_NAME = 'api.push.apple.com'
            const AUTHENTICATION_TOKEN = await getAuthToken()
            const pushData = JSON.stringify(aps)

            const response = await fetch(`https://${APNS_HOST_NAME}/3/device/${deviceToken}`, {
                method: 'POST',
                headers: {
                    'apns-topic': TOPIC,
                    'apns-push-type': 'alert',
                    'authorization': `bearer ${AUTHENTICATION_TOKEN}`,
                    'content-type': 'application/json',
                },
                body: pushData,
            })

            return response
        }

    }
}

/**
 * Class Database
 */
class Database {
    constructor(env) {
        // Make database private
        const kvStorage = env.database

        this.countAll = async () => {
            const count = (await kvStorage.list()).keys.length
            return count
        }

        this.deviceTokenByKey = async (key) => {
            const deviceToken = await kvStorage.get(key)
            return deviceToken
        }

        this.saveDeviceTokenByKey = async (key, token) => {
            const deviceToken = await kvStorage.put(key, token)
            return await deviceToken
        }
    }
}

/**
 * Class Util
 */
class Util {
    constructor() {
        this.getTimestamp = () => {
            return Math.floor(Date.now() / 1000)
        }

        this.base64ToArrayBuffer = (base64) => {
            const binaryString = atob(base64)
            const length = binaryString.length
            const buffer = new Uint8Array(length)
            for (let i = 0; i < length; i++) {
                buffer[i] = binaryString.charCodeAt(i)
            }
            return buffer
        }

        this.newShortUUID = () => {
            const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            const length = 22 //Length of UUID
            let customUUID = ''
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length)
                customUUID += characters[randomIndex]
            }
            return customUUID
        }
    }
}

const util = new Util()