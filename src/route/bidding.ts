import { Payload } from "../model";
import { getSetting, generateVerificationCode, setSetting } from '../utils'


export async function handleBid(searchParams: URLSearchParams, body: any, env: Env): Promise<Response> {

    if (!body) {
        return Payload.error({ message: '必須要有負載' })

    }
    if (!body.name) {
        return Payload.error({ message: '姓名欄位為必填' })
    }

    if (typeof body.name != 'string') {
        return Payload.error({ message: '姓名必須為字串' })
    }

    if (body.name.length < 1 || body.name.length > 30) {
        return Payload.error({ message: '姓名的長度不符規定' })

    }

    if (!body.bidding) {
        return Payload.error({ message: '金額為必填' })
    }
    if (typeof body.bidding != 'number') {
        return Payload.error({ message: '金額必須是數字' })
    }

    if (body.name.length < 1 || body.name.length > 30) {
        return Payload.error({ message: '姓名的長度不符規定' })
    }

    if (!(await getSetting(env, 'enable'))) {
        return Payload.error({ message: '目前不是下注時間' })
    }

    const epoch = await getSetting(env, 'epoch')
    const index: number = await getSetting(env, 'index')

    const verificationCode = generateVerificationCode()

    await env.DB.put(`bidding_${epoch}_${index}`, JSON.stringify({
        name: body.name,
        bidding: body.bidding,
        verificationCode: verificationCode,
        index: index
    }))
    await setSetting(env, 'index', index + 1);


    return Payload.success({
        message: `成功下標！您的編號是 ${index}，驗證碼是 ${verificationCode}`, data: {
            index: index,
            verificationCode: verificationCode
        }
    })
}

export async function handleGetText(searchParams: URLSearchParams, body: any, env: Env): Promise<Response> {
    const text = await getSetting(env, 'text');
    return Payload.success({ message: "成功獲得目前內文", data: text })
}