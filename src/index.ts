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
	isAdmin: boolean,
	token: string
}
`bidding_<epoch>_<index>`: {
	name: string,
	bidding: number,
	verificationCode: string,
	index: index
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


GET /api/setting

POST /api/setting

GET /api/listBid

GET /api/text

從 金額最高的開始
	叫編號，來認領交易，並確認驗證碼一致



*/

import { Payload } from "./model";
import { handleListBid, handleSetting } from "./route/admin";
import { handleBid, handleGetText } from "./route/bidding";
import { handleLogin } from "./route/login";
import { generateToken, getSetting, hashPassword, setSetting } from "./utils";
// import { Env } from "./utils";

async function addUser(env: Env, name: string, password: string, isAdmin: boolean = false) {
	const { salt, hash } = hashPassword(password);
	await env.DB.put(`user_${name}`, JSON.stringify({
		username: name,
		passwordHash: hash,
		salt: salt,
		isAdmin: isAdmin,
		token: generateToken()
	}))
}

function parseCookies(cookieHeader: string | null): { [key: string]: string } {
	const cookies: { [key: string]: string } = {};
	if (cookieHeader) {
		cookieHeader.split(';').forEach(cookie => {
			const [name, ...rest] = cookie.trim().split('=');
			cookies[name] = decodeURIComponent(rest.join('='));
		});
	}
	return cookies;
}

async function isAdmin(request: Request, env: Env) {
	const cookie = request.headers.get('Cookie');
	const token = parseCookies(cookie)['token'];
	const username = parseCookies(cookie)['username'];
	if (!(token && token.length != 0 && username && username.length != 0)) {
		return Payload.error({ message: "需要登入才能存取此資訊" })

	}
	const userString = await env.DB.get(`user_${username}`)
	if (userString == null) {
		return Payload.error({ message: "不合法的登入資訊" })
	}

	const user = JSON.parse(userString);
	if (user.token != token) {
		return Payload.error({ message: "不合法的登入資訊" })

	}
	if (!user.isAdmin) {

		return Payload.error({ message: "只有管理員才能存取此資訊" })

	}
	return true



}

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
		return await handleBid(searchParams, body, env)

	}
	else if (pathname == '/api/login') {
		return await handleLogin(searchParams, body, env)
	}
	else if (pathname == '/api/text') {
		return await handleGetText(searchParams, body, env)
	}
	else if (pathname == '/api/setting') {
		const res = await isAdmin(request, env)
		if (res) {
			return await handleSetting(method, searchParams, body, env)
		}
		else {
			return res
		}
	}
	else if (pathname == '/api/listBid') {
		const res = await isAdmin(request, env)
		if (res) {
			return await handleListBid(method, searchParams, body, env)
		}
		else {
			return res
		}
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
