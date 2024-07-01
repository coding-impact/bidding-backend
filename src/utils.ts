


async function getRawSetting(env: Env) {
	let settingString = '{"epoch": 0, "text": "當競標時間結束時，出價最高者將可得到點數。", "enable": false}'
	const settingValue = await env.DB.get('setting')
	if (settingValue != null) {
		settingString = settingValue
	}
	return JSON.parse(settingString);
}

export async function getSetting(env: Env, key: string) {
	const setting = await getRawSetting(env);
	console.log(setting)
	return setting[key]
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
