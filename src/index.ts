/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

/*

# db

`user_<username>`: {
	username: string,
	passwordHash: string

}
`bidding_<epoch>_<index>`: {
	name: string,
	bidding: number,
	verificationCode: string,
}

# API

POST /api/bid
- body:
	{name: string, bidding: number}
- resposne:
	Payload.success({index: index, verificationCode: string})

POST /api/admin/login
- body: 
	{username: string, password: string}
- response:
	setCookie: token


從 金額最高的開始
	叫編號，來認領交易，並確認驗證碼一致


*/

import { Payload } from "./model";




export default {
	async fetch(request, env, ctx): Promise<Response> {
		// let value = await env.DB.put('test', JSON.stringify({}));
		// await env.DB.put('tes2', JSON.stringify({ '1fdf': 213 }));
		const url = new URL(request.url);
		const { pathname, searchParams } = url;
		console.log(pathname)
		console.log(searchParams)
		let body = undefined
		try {
			body = await request.json();
		} catch (error) {
			

		}
		console.log(body)



		return Payload.success({ message: '成孤獲得', data: pathname })
	},
} satisfies ExportedHandler<Env>;
