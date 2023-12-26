export default {
    async fetch(request, env, ctx) {
        return await handleRequest(request, env, ctx)
    },
    // 使用Worker Cron 调用的是scheduled. fetch不会被调用, fetch用于调试
    async scheduled(event, env, ctx) {
        ctx.waitUntil(handleEvent(event, env, ctx))
    },
}

// 填入农历日期和事件
const eventList = [
    [[9, 12], "Event Test"],
    [[10, 27], "Event Test"],
]

async function handleRequest(request, env, ctx) {
    await handleEvent(request, env, ctx)
    return new Response("ok")
}

async function handleEvent(event, env, ctx) {
    const date = new Date()
    const lunarDate = toCnDate(date)

    // console.log("[INFO]" + date + ":" + "Current Lunar Date: " + JSON.stringify(lunarDate))

    const matchingEvent = eventList.find(([eventDate]) => {
        const [eventMonth, eventDay] = eventDate;
        return (lunarDate.month === eventMonth && lunarDate.day === eventDay);
    });

    if (matchingEvent) {
        // 填入Bark-Server地址
        // return await fetch("https://from-birthday-reminder.com/[KEY]/" + "生日提醒" + "/" + matchingEvent[1])

        // 如果使用Bark-Wroker, 同一帐号同一域名下Wroker间相互调用使用Worker Binding, 否则会报错, 这里可以随便填个域名, 但path要遵循规范
        return await env.APNs.fetch("https://from-birthday-reminder.com/[KEY]/" + "生日提醒" + "/" + matchingEvent[1])
    }
}

function toCnDate(date) {
    const cnDateString = date.toLocaleString('zh-u-ca-chinese', { dateStyle: 'short' })
    const match = cnDateString.match(/(\d+)/g);
    const [lunarYear, lunarMonth, lunarDay] = match.map(Number);

    return {
        year: lunarYear,
        month: lunarMonth,
        day: lunarDay
    };
}
