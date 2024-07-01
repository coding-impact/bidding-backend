
import { pbkdf2Sync, randomBytes } from 'node:crypto';

export function verifyPassword(password: string, salt: string, hash: string): boolean {
	const hashToVerify = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
	return hash === hashToVerify;
  }

export function hashPassword(password: string): { salt: string, hash: string } {
	const salt = randomBytes(16).toString('hex'); // Generate a random salt
	const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex'); // Hash the password
	return { salt, hash };
  }

export function generateToken() {
	const array = new Uint8Array(128);
	crypto.getRandomValues(array);
	const hexCode = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

	return hexCode.toUpperCase();
}

export function generateVerificationCode() {
	const array = new Uint8Array(3);
	crypto.getRandomValues(array);
	const hexCode = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

	return hexCode.toUpperCase();
}

const defaultSetting: any = { "epoch": 0, "text": "當競標時間結束時，出價最高者將可得到點數。", "enable": false, "index": 0 }

async function getRawSetting(env: Env) {
	const settingValue = await env.DB.get('setting')
	if (settingValue != null) {

		return JSON.parse(settingValue);
	}
	return defaultSetting
}

export async function getSetting(env: Env, key: string) {
	const setting = await getRawSetting(env);
	console.log(setting)
	if (Object.keys(setting).includes(key)) {

		return setting[key]
	}
	else {
		return defaultSetting[key]
	}
}

export async function setSetting(env: Env, key: string, value: any) {
	const setting = await getRawSetting(env)
	setting[key] = value
	await env.DB.put('setting', JSON.stringify(setting))
}


export async function list(env: Env, prefix: string): Promise<any[]> {
	const return_list: any[] = []
	const keys_list: string[] = []
	let cursor = null;
	while (true) {
		const res: any = await env.DB.list({ prefix: prefix, cursor: cursor });
		console.log(JSON.stringify(res))
		for (let i = 0; i < res.keys.length; i++) {
			const element = res.keys[i];
			keys_list.push(element.name)
		}

		if (res.list_complete) {
			break;
		}
		cursor = res.cursor;

	}
	console.log(JSON.stringify(keys_list))

	for (let i = 0; i < keys_list.length; i++) {
		const element = keys_list[i];
		console.log(element)
		const object = await env.DB.get(element);
		console.log('recv')
		console.log(JSON.stringify(object))
		if (object != null) {
			return_list.push(JSON.parse(object))
		}
	}



	return return_list;
}
