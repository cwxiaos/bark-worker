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
        case "/push": {
            let requestBody
            try{
                requestBody = await request.json()
            }catch(err){
                return util.responseAccessDenied()
            }
            if (util.requestBodyCheck(requestBody)) {
                return handler.push(undefined, requestBody)
            }

            return util.responseAccessDenied()
        }
        default: {
            const pathParts = pathname.split('/')

            // Check whether the URL is invalid
            if (util.pathPartsCheck(pathParts)) {
                return handler.push(pathParts, searchParams)
            }
            
            return util.responseAccessDenied()
        }
    }
}

/**
 * Class Handler
 */
class Handler {
    constructor(env) {
        this.version = "v2.0.0"
        this.build = "Oct 26 2023"
        this.arch = "js"
        this.commit = "1"

        const db = new Database(env)

        this.register = async (parameters) => {

            const param_devicetoken = parameters.get('devicetoken')
            let param_key = parameters.get('key')

            let Response_Register = {}

            if (!param_devicetoken) {
                Response_Register = {
                    'message': 'device token is empty',
                    'code': 400,
                    'timestamp': util.getTimestamp(),
                }

                return new Response(JSON.stringify(Response_Register), { status: Response_Register.code })
            }

            if (!param_key) {
                if (isAllowNewDevice) {
                    param_key = util.newShortUUID()
                    await db.saveDeviceTokenByKey(param_key, param_devicetoken)
                } else {
                    Response_Register = {
                        'message': "device registration failed: register disabled",
                        'code': 500,
                    }

                    return new Response(JSON.stringify(Response_Register), { status: Response_Register.code })
                }
            }

            const deviceToken = await db.deviceTokenByKey(param_key)
            if (await deviceToken != param_devicetoken) {
                if (isAllowNewDevice) {
                    param_key = util.newShortUUID()
                    await db.saveDeviceTokenByKey(param_key, param_devicetoken)
                } else {
                    Response_Register = {
                        'message': "device registration failed: register disabled",
                        'code': 500,
                    }

                    return new Response(JSON.stringify(Response_Register), { status: Response_Register.code })
                }
            }

            Response_Register = {
                'message': 'success',
                'code': 200,
                'timestamp': util.getTimestamp(),
                'data': {
                    'key': param_key,
                    'device_key': param_key,
                    'device_token': param_devicetoken,
                },
            }

            return new Response(JSON.stringify(Response_Register), { status: Response_Register.code })
        }

        this.ping = async (parameters) => {
            const Response_ping = {
                'message': 'pong',
                'code': 200,
                'timestamp': util.getTimestamp(),
            }

            return new Response(JSON.stringify(Response_ping), { status: Response_ping.code })
        }

        this.healthz = async (parameters) => {
            return new Response("ok")
        }

        this.info = async (parameters) => {
            if (isAllowQueryNums) {
                this.devices = await db.countAll()
            }

            const Response_info = {
                'version': this.version,
                'build': this.build,
                'arch': this.arch,
                'commit': this.commit,
                'devices': this.devices,
            }

            return new Response(JSON.stringify(Response_info), { status: 200 })
        }

        this.push = async (pathParts, parameters) => {
            let deviceToken

            if (pathParts) {
                deviceToken = await db.deviceTokenByKey(pathParts[1])
            } else {
                deviceToken = await db.deviceTokenByKey(parameters.device_key)
            }

            if (!deviceToken) {
                const Response_Access_Denied = {
                    'message': 'Access Denied: Invalid Key',
                    'code': 500,
                    'timestamp': util.getTimestamp(),
                }
                return new Response(JSON.stringify(Response_Access_Denied), { status: Response_Access_Denied.code })
            }

            let title
            let message

            let requestBody = {}

            if (pathParts) {
                if (pathParts.length === 3) {
                    // Message only
                    message = decodeURIComponent(pathParts[2])
                }

                if (pathParts.length === 4) {
                    // We have a title now
                    title = decodeURIComponent(pathParts[2])
                    message = decodeURIComponent(pathParts[3])
                }

                parameters.forEach((value, key) => { requestBody[key] = value })
            }else{
                requestBody = parameters

                title = requestBody.title || undefined
                message = requestBody.body || undefined
            }

            let sound = requestBody.sound || '1107'
            if (!sound.endsWith('.caf')) {
                sound += '.caf'
            }
            const category = requestBody.category || undefined
            const group = requestBody.group || 'myNotificationCategory'

            const isArchive = requestBody.isArchive || undefined
            const icon = requestBody.icon || undefined
            const url = requestBody.url || undefined
            const level = requestBody.level || undefined
            const copy = requestBody.copy || undefined
            const badge = requestBody.badge || 0
            const autoCopy = requestBody.autoCopy || undefined
            const ciphertext = requestBody.ciphertext || undefined


            let aps = {
                'aps': {
                    'alert': {
                        'action': undefined,
                        'action-loc-key': undefined,
                        'body': message,
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
                    'badge': badge,
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
                'autocopy': autoCopy,
            }

            // return new Response(JSON.stringify(aps))

            const apns = new APNs(env)

            const response = await apns.push(deviceToken, aps)

            let Response_Push = {}

            if (response.status === 200) {
                Response_Push = {
                    'message': 'success',
                    'code': 200,
                    'timestamp': util.getTimestamp(),
                }
            } else {
                Response_Push = {
                    'message': 'push failed: ' + Object.values(JSON.parse(await response.text()))[0],
                    'code': response.status,
                    'timestamp': util.getTimestamp(),
                }
            }

            return new Response(JSON.stringify(Response_Push), { status: Response_Push.code })
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

        this.pathPartsCheck = (pathParts) => {
            return (pathParts[1].length === 22) && ((pathParts.length === 3 && pathParts[2]) || (pathParts.length === 4 && pathParts[2] && pathParts[3]))
        }

        this.requestBodyCheck = (requestBody) => {
            return (requestBody.device_key.length === 22)
        }

        this.responseAccessDenied = () => {
            const Response_Invalid_Access = {
                'message': 'Access Denied',
                'code': 500,
                'timestamp': util.getTimestamp(),
            }
            return new Response(JSON.stringify(Response_Invalid_Access), { status: Response_Invalid_Access.code });
        }
    }
}

const util = new Util()