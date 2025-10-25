export default {
    async fetch(request, env, ctx) {
        return await handleRequest(request, env, ctx)
    }
}

async function handleRequest(request, env, ctx) {
    const allowNewDevice = env.ALLOW_NEW_DEVICE !== undefined ? (env.ALLOW_NEW_DEVICE === 'false' ? false : Boolean(env.ALLOW_NEW_DEVICE)) : true
    const allowQueryNums = env.ALLOW_QUERY_NUMS !== undefined ? (env.ALLOW_QUERY_NUMS === 'false' ? false : Boolean(env.ALLOW_QUERY_NUMS)) : true
    const rootPath = env.ROOT_PATH || '/'
    const basicAuth = env.BASIC_AUTH

    const {searchParams, pathname} = new URL(request.url)
    const handler = new Handler(env, { allowNewDevice, allowQueryNums })
    const realPathname = pathname.replace((new RegExp('^' + rootPath.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))), '/')

    switch (realPathname) {
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
            if (!util.validateBasicAuth(request, basicAuth)) {
                return new Response('Unauthorized', {
                    status: 401,
                    headers: {
                        'content-type': 'text/plain',
                        'WWW-Authenticate': 'Basic',
                    }
                })
            }
            return handler.info(searchParams)
        }
        default: {
            const pathParts = realPathname.split('/')

            if (pathParts[1]) {
                if (!util.validateBasicAuth(request, basicAuth)) {
                    return new Response('Unauthorized', {
                        status: 401,
                        headers: {
                            'content-type': 'text/plain',
                            'WWW-Authenticate': 'Basic',
                        }
                    })
                }

                const contentType = request.headers.get('content-type')
                let requestBody = {}

                try {
                    if (contentType && contentType.includes('application/json')) {
                        requestBody = await request.json()
                    }else if (contentType && contentType.includes('application/x-www-form-urlencoded')){
                        const formData = await request.formData()
                        formData.forEach((value, key) => {requestBody[key] = value})
                    }else{
                        searchParams.forEach((value, key) => {requestBody[key] = value})

                        if (pathParts.length === 3) {
                            requestBody.body = pathParts[2]
                        } else if (pathParts.length === 4) {
                            requestBody.title = pathParts[2]
                            requestBody.body = pathParts[3]
                        } else if (pathParts.length === 5) {
                            requestBody.title = pathParts[2]
                            requestBody.subtitle = pathParts[3]
                            requestBody.body = pathParts[4]
                        } else if (pathParts.length > 5) {
                            return new Response(JSON.stringify({
                                'code': 404,
                                'message': `Cannot ${request.method} ${realPathname}`,
                                'timestamp': util.getTimestamp(),
                            }), {
                                status: 404,
                                headers: {
                                    'content-type': 'application/json',
                                }
                            })
                        }
                    }

                    if (requestBody.device_keys && typeof requestBody.device_keys === 'string') {
                        if (requestBody.device_keys.startsWith('[') || requestBody.device_keys.endsWith(']')) {
                            requestBody.device_keys = JSON.parse(requestBody.device_keys)
                        } else {
                            requestBody.device_keys = (decodeURIComponent(requestBody.device_keys).trim()).split(',').map(item => item.replace(/"/g, '').trim())
                        }

                        if (typeof requestBody.device_keys === 'string') {
                            requestBody.device_keys = [requestBody.device_keys]
                        }
                    }
                } catch (error) {
                    return new Response(JSON.stringify({
                        'code': 400,
                        'message': `request bind failed: ${error}`,
                        'timestamp': util.getTimestamp(),
                    }), {
                        status: 400,
                        headers: {
                            'content-type': 'application/json',
                        }
                    })
                }

                if (requestBody.device_keys && requestBody.device_keys.length > 0) {
                    return new Response(JSON.stringify({
                        'code': 200,
                        'message': 'success',
                        'data': await Promise.all(requestBody.device_keys.map(async (device_key) => {
                            if (!device_key) {
                                return {
                                    code: 400,
                                    message: 'device key is empty',
                                    device_key: device_key,
                                }
                            }

                            const response = await handler.push({...requestBody, device_key})
                            const responseBody = await response.json()
                            return {
                                code: response.status,
                                message: responseBody.message,
                                device_key: device_key,
                            }
                        })),
                        'timestamp': util.getTimestamp(),
                    }), {
                        status: 200,
                        headers: {
                            'content-type': 'application/json',
                        }
                    })
                }

                if (realPathname != '/push') {
                    requestBody.device_key = pathParts[1]
                }

                if (!requestBody.device_key) {
                    return new Response(JSON.stringify({
                        'code': 400,
                        'message': 'device key is empty',
                        'timestamp': util.getTimestamp(),
                    }), {
                        status: 400,
                        headers: {
                            'content-type': 'application/json',
                        }
                    })
                }

                return handler.push(requestBody)
            }

            return new Response(JSON.stringify({
                'code': 404,
                'message': `Cannot ${request.method} ${realPathname}`,
                'timestamp': util.getTimestamp(),
            }), {
                status: 404,
                headers: {
                    'content-type': 'application/json',
                }
            })
        }
    }
}

class Handler {
    constructor(env, options) {
        this.version = "v2.2.6"
        this.build = "2025-10-25 21:09:29"
        this.arch = "js"
        this.commit = "a5d5365ad2dc362858b39044f05da9e10d3538cf"
        this.allowNewDevice = options.allowNewDevice
        this.allowQueryNums = options.allowQueryNums
        const db = new Database(env)

        this.register = async (parameters) => {
            const deviceToken = parameters.get('devicetoken')
            let key = parameters.get('key')

            if (!deviceToken) {
                return new Response(JSON.stringify({
                    'code': 400,
                    'message': 'device token is empty',
                    'timestamp': util.getTimestamp(),
                }), {
                    status: 400,
                    headers: {
                        'content-type': 'application/json',
                    }
                })
            }

            if (deviceToken.length > 128) {
                return new Response(JSON.stringify({
                    'code': 400,
                    'message': 'device token is invalid',
                    'timestamp': util.getTimestamp(),
                }), {
                    status: 400,
                    headers: {
                        'content-type': 'application/json',
                    }
                })
            }

            if (!(key && await db.deviceTokenByKey(key))){
                if (this.allowNewDevice) {
                    key = await util.newShortUUID()
                } else {
                    return new Response(JSON.stringify({
                        'code': 500,
                        'message': 'device registration failed: register disabled',
                    }), {
                        status: 500,
                        headers: {
                            'content-type': 'application/json',
                        }
                    })
                }
            }

            await db.saveDeviceTokenByKey(key, deviceToken)

            return new Response(JSON.stringify({
                'code': 200,
                'message': 'success',
                'timestamp': util.getTimestamp(),
                'data': {
                    'key': key,
                    'device_key': key,
                    'device_token': deviceToken,
                },
            }), {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                }
            })
        }

        this.ping = async (parameters) => {
            return new Response(JSON.stringify({
                'code': 200,
                'message': 'pong',
                'timestamp': util.getTimestamp(),
            }), {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                }
            })
        }

        this.healthz = async (parameters) => {
            return new Response("ok", {
                status: 200,
                headers: {
                    'content-type': 'text/plain',
                }
            })
        }

        this.info = async (parameters) => {
            if (this.allowQueryNums) {
                this.devices = await db.countAll()
            }

            return new Response(JSON.stringify({
                'version': this.version,
                'build': this.build,
                'arch': this.arch,
                'commit': this.commit,
                'devices': this.devices,
            }), {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                }
            })
        }

        this.push = async (parameters) => {
            const deviceToken = await db.deviceTokenByKey(parameters.device_key)

            if (deviceToken === undefined) {
                return new Response(JSON.stringify({
                    'code': 400,
                    'message': `failed to get device token: failed to get [${parameters.device_key}] device token from database`,
                    'timestamp': util.getTimestamp(),
                }), {
                    status: 400,
                    headers: {
                        'content-type': 'application/json',
                    }
                })
            }

            if (!deviceToken) {
                return new Response(JSON.stringify({
                    'code': 400,
                    'message': 'device token invalid',
                    'timestamp': util.getTimestamp(),
                }), {
                    status: 400,
                    headers: {
                        'content-type': 'application/json',
                    }
                })
            }

            if (deviceToken.length > 128) {
                await db.deleteDeviceByKey(parameters.device_key)

                return new Response(JSON.stringify({
                    'code': 400,
                    'message': 'invalid device token, has been removed',
                    'timestamp': util.getTimestamp(),
                }), {
                    status: 400,
                    headers: {
                        'content-type': 'application/json',
                    }
                })
            }

            let title = parameters.title || undefined
            let subtitle = parameters.subtitle || undefined
            let body = parameters.body || undefined

            try {
                if (title) {
                    title = decodeURIComponent(title.replaceAll("\\+","%20"))
                }
                
                if (subtitle) {
                    subtitle = decodeURIComponent(subtitle.replaceAll("\\+","%20"))
                }
                
                if (body) {
                    body = decodeURIComponent(body.replaceAll("\\+","%20"))
                }
            } catch (error) {
                return new Response(JSON.stringify({
                    'code': 500,
                    'meaasge': `url path parse failed: ${error}`,
                    'timestamp': util.getTimestamp(),
                }), {
                    status: 500,
                    headers: {
                        'content-type': 'application/json',
                    }
                })
            }

            let sound = parameters.sound || undefined
            if (sound) {
                if (!sound.endsWith('.caf')) {
                    sound += '.caf'
                }
            } else {
                sound = '1107'
            }

            const group = parameters.group || undefined
            
            const call = parameters.call || undefined
            const isArchive = parameters.isArchive || undefined
            const icon = parameters.icon || undefined
            const ciphertext = parameters.ciphertext || undefined
            const level = parameters.level || undefined
            const volume = parameters.volume || undefined
            const url = parameters.url || undefined
            const image = parameters.image || undefined
            const copy = parameters.copy || undefined
            const badge = parameters.badge || undefined
            const autoCopy = parameters.autoCopy || undefined
            const action = parameters.action || undefined
            const iv = parameters.iv || undefined
            const id = parameters.id || undefined
            const _delete = parameters.delete || undefined

            // https://developer.apple.com/documentation/usernotifications/generating-a-remote-notification
            const aps = {
                'aps': (_delete) ? {
                    'content-available': 1,
                    'mutable-content': 1,
                } : {
                    'alert': {
                        'title': title,
                        'subtitle': subtitle,
                        'body': (!title && !subtitle && !body) ? 'Empty Message' : body,
                        'launch-image': undefined,
                        'title-loc-key': undefined,
                        'title-loc-args': undefined,
                        'subtitle-loc-key': undefined,
                        'subtitle-loc-args': undefined,
                        'loc-key': undefined,
                        'loc-args': undefined,
                    },
                    'badge': undefined,
                    'sound': sound,
                    'thread-id': group,
                    'category': 'myNotificationCategory',
                    'content-available': undefined,
                    'mutable-content': 1,
                    'target-content-id': undefined,
                    'interruption-level': undefined,
                    'relevance-score': undefined,
                    'filter-criteria': undefined,
                    'stale-date': undefined,
                    'content-state': undefined,
                    'timestamp': undefined,
                    'event': undefined,
                    'dimissal-date': undefined,
                    'attributes-type': undefined,
                    'attributes': undefined,
                },
                // ExtParams
                'group': group,
                'call': call,
                'isarchive': isArchive,
                'icon': icon,
                'ciphertext': ciphertext,
                'level': level,
                'volume': volume,
                'url': url,
                'copy': copy,
                'badge': badge,
                'autocopy': autoCopy,
                'action': action,
                'iv': iv,
                'image': image,
                'id': id,
                'delete': _delete,
            }

            const headers = {
                'apns-topic': undefined,
                'apns-id': undefined,
                'apns-collapse-id': id,
                'apns-priority': undefined,
                'apns-expiration': undefined,
                'apns-push-type': (_delete) ? 'background' : 'alert',
            }

            const apns = new APNs(db)
            const response = await apns.push(deviceToken, headers, aps)

            if (response.status === 200) {
                return new Response(JSON.stringify({
                    'code': 200,
                    'message': 'success',
                    'timestamp': util.getTimestamp(),
                }), {
                    status: 200,
                    headers: {
                        'content-type': 'application/json',
                    }
                })
            } else {
                let message
                const responseText = await response.text()
                
                try {
                    message = JSON.parse(responseText).reason
                } catch (err) {
                    message = responseText
                }

                if ((response.status === 410) || ((response.status === 400) && (message.includes('BadDeviceToken')))) {
                    await db.saveDeviceTokenByKey(parameters.device_key, '')
                }

                return new Response(JSON.stringify({
                    'code': response.status,
                    'message': `push failed: ${message}`,
                    'timestamp': util.getTimestamp(),
                }), {
                    status: response.status,
                    headers: {
                        'content-type': 'application/json',
                    }
                })
            }
        }
    }
}

class APNs {
    constructor(db) {
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
            let authToken = await db.authorizationToken()

            if (authToken) {
                return await authToken
            }

            authToken = await generateAuthToken()
            await db.saveAuthorizationToken(authToken, util.getTimestamp())

            return authToken
        }

        this.push = async (deviceToken, headers, aps) => {
            const TOPIC = 'me.fin.bark'
            const APNS_HOST_NAME = 'api.push.apple.com'
            const AUTHENTICATION_TOKEN = await getAuthToken()

            return await fetch(`https://${APNS_HOST_NAME}/3/device/${deviceToken}`, {
                method: 'POST',
                headers: JSON.parse(JSON.stringify({
                    'apns-topic': headers['apns-topic'] || TOPIC,
                    'apns-id': headers['apns-id'] || undefined,
                    'apns-collapse-id': headers['apns-collapse-id'] || undefined,
                    'apns-priority': (headers['apns-priority'] > 0) ? headers['apns-priority'] : undefined,
                    'apns-expiration': util.getTimestamp() + 86400,
                    'apns-push-type': headers['apns-push-type'] || 'alert',
                    'authorization': `bearer ${AUTHENTICATION_TOKEN}`,
                    'content-type': 'application/json',
                })),
                body: JSON.stringify(aps),
            })
        }
    }
}

class Database {
    constructor(env) {
        // Make database private
        const kvStorage = env.database

        this.countAll = async () => {
            const count = (await kvStorage.list()).keys.length
            return count
        }

        this.deviceTokenByKey = async (key) => {
            const device_key = (key || '').replace(/[^a-zA-Z0-9]/g, '') || '_PLACE_HOLDER_'
            const deviceToken = await kvStorage.get(device_key)
            return deviceToken
        }

        this.saveDeviceTokenByKey = async (key, token) => {
            const device_token = (token || '').replace(/[^a-z0-9]/g, '') || ''
            const deviceToken = await kvStorage.put(key, device_token)
            return await deviceToken
        }

        this.deleteDeviceByKey = async (key) => {
            const device_key = (key || '').replace(/[^a-zA-Z0-9]/g, '') || '_PLACE_HOLDER_'
            const deviceToken = await kvStorage.delete(device_key)
            return await deviceToken
        }

        this.saveAuthorizationToken = async (token) => {
            const authToken = await kvStorage.put('_authToken_', token, { expirationTtl: 3000 })
            return await authToken
        }

        this.authorizationToken = async () => {
            return await kvStorage.get('_authToken_')
        }
    }
}

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

        this.newShortUUID = async () => {
            const uuid = crypto.randomUUID()
            const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uuid))
            const hashArray = Array.from(new Uint8Array(hashBuffer))

            return btoa(String.fromCharCode(...hashArray)).replace(/[^a-zA-Z0-9]|[lIO01]/g, '').slice(0, 22)
        }

        const constantTimeCompare = (a, b) => {
            if (typeof a !== 'string' || typeof b !== 'string') { return false }
            if (a.length !== b.length) { return false }
            let result = 0
            for (let i = 0; i < a.length; i++) {
                result |= a.charCodeAt(i) ^ b.charCodeAt(i)
            }
            return result === 0
        }

        this.validateBasicAuth = (request, basicAuth) => {
            if (basicAuth) {
                const authHeader = request.headers.get('Authorization')
                if (typeof authHeader !== 'string' || !authHeader.startsWith('Basic ')) { return false }
                const received = authHeader.slice(6) // Remove 'Basic ' prefix
                const expected = btoa(`${basicAuth}`)
                return constantTimeCompare(received, expected)
            }
            return true
        }
    }
}

const util = new Util()