import { Payload } from "../model";
import { generateToken, verifyPassword } from "../utils";
// import {Env} from '../utils'

export async function handleLogin(searchParams: URLSearchParams, body: any, env: Env): Promise<Response>{
    if (!body) {
        return Payload.error({ message: '必須要有負載' })

    }
    if (!body.username) {
        return Payload.error({ message: '使用者名稱欄位為必填' })
    }

    if (typeof body.username != 'string') {
        return Payload.error({ message: '使用者名稱必須為字串' })
    }

    if (body.username.length < 1 || body.username.length > 30) {
        return Payload.error({ message: '使用者名稱的長度不符規定' })

    }
 
    if (!body.password) {
        return Payload.error({ message: '密碼欄位為必填' })
    }

    if (typeof body.password != 'string') {
        return Payload.error({ message: '密碼必須為字串' })
    }

    if (body.password.length < 1 || body.password.length > 30) {
        return Payload.error({ message: '密碼的長度不符規定' })
    }

    const rawUserString = await env.DB.get(`user_${body.username}`)
    if (rawUserString == null) {
        return Payload.error({ message: '帳號或是密碼錯誤' })
    }
    const user = JSON.parse(rawUserString)
    if (!verifyPassword(body.password, user.salt, user.passwordHash)){
        return Payload.error({ message: '帳號或是密碼錯誤' })
    }


    const res = Payload.success({message: "登入成功"})
    const token = user.token;
    res.headers.append('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`)
    res.headers.append('Set-Cookie', `username=${body.username}; HttpOnly; Secure; SameSite=Strict; Path=/`)
    return res;
}