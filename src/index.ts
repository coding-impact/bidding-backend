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
	passwordHash: string,
	salt: string,
	isAdmin: boolean
}
`bidding_<epoch>_<index>`: {
	name: string,
	bidding: number,
	verificationCode: string,
}


setting: {
	epoch: number,
	text: string,
	enable: boolean
}

# API

POST /api/bid
- body:
	{name: string, bidding: number}
- resposne:
	Payload.success({index: index, verificationCode: string})

POST /api/login
- body: 
	{username: string, password: string}
- response:
	setCookie: token


從 金額最高的開始
	叫編號，來認領交易，並確認驗證碼一致

GET /api/admin/setting


*/

import { Payload } from "./model";
import { handleBid } from "./route/bidding";
import { handleLogin } from "./route/login";
import { setSetting } from "./utils";
// import { Env } from "./utils";

async function handleRequest(request: Request, pathname: string, searchParams: URLSearchParams, body: any, env: Env): Promise<Response> {
	// 	const origin = request.headers.get('Origin');
	//   if (origin === 'http://localhost' || origin === 'https://example.com') {
	//     response = new Response(response.body, response);
	//     response.headers.set('Access-Control-Allow-Origin', origin);
	//   }

	//   return response;
	const { method } = request;
	if (method == 'OPTIONS') {
		return new Response(null, { status: 204 })
	}
	if (pathname == '/api/bidding') {
		return await handleBid(searchParams, body, env);

	}
	else if (pathname == '/api/login') {
		return await handleLogin(searchParams, body, env);
	}
	return Payload.error({ message: '未知的路徑' })

}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// let value = await env.DB.put('test', JSON.stringify({}));
		// await env.DB.put('setting', JSON.stringify({"epoch": 0, "text": "當競標時間結束時，出價最高者將可得到點數。", "enable": false}));
		// await setSetting(env, 'enable', true)


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



		// return Payload.success({ message: '成孤獲得', data: pathname })
		let res = await handleRequest(request, pathname, searchParams, body, env);
		const origin = request.headers.get('Origin');
		if (origin === 'http://localhost:3000' || origin === 'https://bidding.kulimi.workers.dev') {
			console.log(origin)
			res.headers.set('Access-Control-Allow-Headers', 'Authorization')
			res.headers.set('Vary', 'Origin')
			res.headers.set('Access-Control-Allow-Credentials', 'true');
			res.headers.set('Access-Control-Allow-Origin', origin);
			res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
			res.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
		}

		return res;
	},
} satisfies ExportedHandler<Env>;
