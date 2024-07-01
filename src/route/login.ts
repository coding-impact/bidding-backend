import { Payload } from "../model";
// import {Env} from '../utils'

export async function handleLogin(searchParams: URLSearchParams, body: any, env: Env): Promise<Response>{
    return Payload.error({})
}