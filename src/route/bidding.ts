import { Payload } from "../model";
import {  getSetting } from '../utils'

export async function handleBid(searchParams: URLSearchParams, body: any, env: Env): Promise<Response> {

    if (!body) {
        return Payload.error({message: '必須要有負載'})

    }
    if(!body.name) {
        return Payload.error({message: '姓名欄位為必填'})
    }

    if(typeof body.name != 'string') {
        return Payload.error({message: '姓名必須為字串'})
    }
    
    if (body.name.length < 1 || body.name.length > 30) {
        return Payload.error({message: '姓名的長度不符規定'})

    }

    if(!body.bidding){
        return Payload.error({message: '金額為必填'})
    }
    if(typeof body.bidding != 'number') {
        return Payload.error({message: '金額必須是數字'})
    }
    
    if (body.name.length < 1 || body.name.length > 30) {
        return Payload.error({message: '姓名的長度不符規定'})
    }

    if (!(await getSetting(env, 'enable'))) {
        return Payload.error({message: '目前不是下注時間'})

    }

    return Payload.error({})
}