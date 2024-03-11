export default {
    async scheduled(event, env, ctx) {
        ctx.waitUntil(handleEvent(event, env, ctx))
    },
  }
  
const serverURL = 'https://from-birthday-reminder.com';
const deviceKey = '[KEY]';
const title = '倒计时';

async function handleEvent(event, env, ctx) {
    const currentDate = new Date();

    // 指定目标日期, 0对应1月, 11对应12月, 注意UTC时间和UTC+8时间的时差
    const targetDate = new Date(currentDate.getFullYear(), 11, 19)
    // 计算剩余天数
    const daysRemaining = Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24));

    const requestBody = {
        body: `倒计时${daysRemaining}天`,
        title: title,
        badge: 0,
        category: 'myNotificationCategory',
        isArchive: '0',
    }

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(requestBody),
    }

    const url = `${serverURL}/${deviceKey}`

    return await env.APNs.fetch(url, options)
}
  