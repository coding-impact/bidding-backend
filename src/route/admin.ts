import { Payload } from "../model";
import { getRawSetting, getSetting, list } from "../utils";

export async function handleSetting(method: string, searchParams: URLSearchParams, body: any, env: Env): Promise<Response> {
    if (method == 'GET'){
        return Payload.success({message: '成功獲得目前設定', data: await getRawSetting(env)})
    }
    else if (method == 'POST') {
        const oldSetting = await getRawSetting(env)
        for (let i = 0; i < Object.keys(body).length; i++) {
            const key = Object.keys(body)[i];
            console.log(key)
            oldSetting[key] = body[key]   
        }
        console.log(oldSetting)
        await env.DB.put('setting', JSON.stringify(oldSetting))
        return Payload.success({message: '成功修改目前設定', data: oldSetting})

    }
    return Payload.error({message: '未知的方法'})
}

export async function handleListBid(method: string, searchParams: URLSearchParams, body: any, env: Env): Promise<Response> {
    const epoch = await getSetting(env, 'epoch')

    return Payload.success({ message: "成功獲取下標列表", data: await list(env, `bidding_${epoch}_`) })
}
