export default {
    // 使用右侧面板Schedule - Triger Scheduled Event 调试
    async scheduled(event, env, ctx) {
        ctx.waitUntil(handleEvent(event, env, ctx))
    },
}

const serverURL = 'https://from-birthday-reminder.com/[KEY]'
const title = '生日提醒'

// 填入农历日期和事件
const eventList = [
    [[9, 12], "Event Test"],
    [[10, 27], "Event Test"],
]

async function handleEvent(event, env, ctx) {
    const date = new Date()
    const lunarDate = toCnDate(date)

    // console.log(`[INFO] ${date.toLocaleString()}: Current Lunar Date: ${JSON.stringify(lunarDate)}`)

    const matchingEvent = eventList.find(([eventDate]) => {
        const [eventMonth, eventDay] = eventDate
        return (lunarDate.month === eventMonth && lunarDate.day === eventDay)
    })

    if(matchingEvent){
        // console.log(`[INFO] ${date.toLocaleString()}: Event Match Success.`)

        // 使用Bark-Server
        // return await fetch(`${serverURL}/${title}/${matchingEvent[1]}`)

        // 如果使用Bark-Worker, 同一帐号同一域名下Worker间相互调用使用Worker Binding, 否则会报错, 这里可以随便填个域名, 但path要遵循规范
        return await env.APNs.fetch(`${serverURL}/${title}/${matchingEvent[1]}`)
    }

    // console.log(`[INFO] ${date.toLocaleString()}: Event Match Failed.`)
}
  
function toCnDate(date) {
    const cnDateString = date.toLocaleString('zh-u-ca-chinese', { dateStyle: 'short' })
    const [lunarYear, lunarMonth, lunarDay] = cnDateString.split('/').map(Number)

    return {
        year: lunarYear,
        month: lunarMonth,
        day: lunarDay
    }
}
