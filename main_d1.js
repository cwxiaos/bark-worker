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
                        searchParams.forEach((value, key) => {requestBody[key] = value})

                        if (pathParts.length === 3) {
                            requestBody.body = pathParts[2]
                        } else if (pathParts.length === 4) {
                            requestBody.title = pathParts[2]
                            requestBody.body = pathParts[3]
                        } else if (pathParts.length === 5){
                            requestBody.category = pathParts[2]
                            requestBody.title = pathParts[3]
                            requestBody.body = pathParts[4]
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

                if(!requestBody.device_key){
                    return new Response(JSON.stringify({
                        'code': 400,
                        'message': 'device key is empty',
                        'timestamp': util.getTimestamp(),
                    }), { status: 400 })
                }

                return handler.push(requestBody)
            }

            return new Response(JSON.stringify({
                'code': 404,
                'message': `Cannot ${request.method} ${pathname}`,
                'timestamp': util.getTimestamp(),
            }), { status: 404 })
        }
    }
}

/**
 * Class Handler
 */
class Handler {
    constructor(env) {
        this.version = "v2.1.0"
        this.build = "2024-02-24 13:14:47"
        this.arch = "js"
        this.commit = "d157d32c353aa381b18236a455b2421f188bd5a6"

        const db = new Database(env)

        this.register = async (parameters) => {
            const deviceToken = parameters.get('devicetoken')
            let key = parameters.get('key')

            if (!deviceToken) {
                return new Response(JSON.stringify({
                    'message': 'device token is empty',
                    'code': 400,
                    'timestamp': util.getTimestamp(),
                }), { status: 400 })
            }

            if (!(key && await db.deviceTokenByKey(key))){
                if (isAllowNewDevice) {
                    key = util.newShortUUID()
                } else {
                    return new Response(JSON.stringify({
                        'message': "device registration failed: register disabled",
                        'code': 500,
                    }), { status: 500 })
                }
            }

            await db.saveDeviceTokenByKey(key, deviceToken)

            return new Response(JSON.stringify({
                'message': 'success',
                'code': 200,
                'timestamp': util.getTimestamp(),
                'data': {
                    'key': key,
                    'device_key': key,
                    'device_token': deviceToken,
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
            const ciphertext = parameters.ciphertext || undefined

            const aps = {
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

            const apns = new APNs(db)

            const response = await apns.push(deviceToken, aps)

            if (response.status === 200) {
                return new Response(JSON.stringify({
                    'message': 'success',
                    'code': 200,
                    'timestamp': util.getTimestamp(),
                }), { status: 200 })
            } else {
                return new Response(JSON.stringify({
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

        this.push = async (deviceToken, aps) => {
            const TOPIC = 'me.fin.bark'
            const APNS_HOST_NAME = 'api.push.apple.com'
            const AUTHENTICATION_TOKEN = await getAuthToken()
            const pushData = JSON.stringify(aps)

            return await fetch(`https://${APNS_HOST_NAME}/3/device/${deviceToken}`, {
                method: 'POST',
                headers: {
                    'apns-topic': TOPIC,
                    'apns-push-type': 'alert',
                    'authorization': `bearer ${AUTHENTICATION_TOKEN}`,
                    'content-type': 'application/json',
                },
                body: pushData,
            })
        }
    }
}

/**
 * Class Database
 */
class Database {
    constructor(env) {
        const db = env.database

        db.exec('CREATE TABLE IF NOT EXISTS `devices` (`id` INTEGER PRIMARY KEY, `key` VARCHAR(255) NOT NULL, `token` VARCHAR(255) NOT NULL, UNIQUE (`key`))')
        db.exec('CREATE TABLE IF NOT EXISTS `authorization` (`id` INTEGER PRIMARY KEY, `token` VARCHAR(255) NOT NULL, `time` VARCHAR(255) NOT NULL)')

        this.countAll = async () => {
            const query = 'SELECT COUNT(*) as rowCount FROM `devices`'
            const result = await db.prepare(query).run()
            return (result.results[0] || {"rowCount": 0}).rowCount
        }

        this.deviceTokenByKey = async (key) => {
            const device_key = (key || '').replace(/[^a-zA-Z0-9]/g, '') || "_PLACE_HOLDER_"
            const query = 'SELECT `token` FROM `devices` WHERE `key` = ?'
            const result = await db.prepare(query).bind(device_key).run()
            return (result.results[0] || {}).token
        }

        this.saveDeviceTokenByKey = async (key, token) => {
            const query = 'INSERT OR REPLACE INTO `devices` (`key`, `token`) VALUES (?, ?)'
            const result = await db.prepare(query).bind(key, token).run()
            return result
        }

        this.saveAuthorizationToken = async (token) => {
            const query = 'INSERT OR REPLACE INTO `authorization` (`id`, `token`, `time`) VALUES (1, ?, ?)'
            const result = await db.prepare(query).bind(token, util.getTimestamp()).run()
            return result
        }

        this.authorizationToken = async () => {
            const query = 'SELECT `token`, `time` FROM `authorization` WHERE `id` = 1'
            const result = await db.prepare(query).run()
            
            if (result.results.length > 0) {
                const tokenTime = parseInt(result.results[0].time)
                const timeDifference = util.getTimestamp() - tokenTime
                
                if(timeDifference <= 3000) {
                    return result.results[0].token
                }
            }

            return undefined
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
            const length = 22
            const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            const randomValues = crypto.getRandomValues(new Uint8Array(length))

            let customUUID = ''
            
            for (let i = 0; i < length; i++) {
                customUUID += characters[61 & randomValues[i]]
            }
            return customUUID
        }
    }
}

const util = new Util()