

type payloadOption = { message?: string, data?: any }


export class Payload {
	type: 'success' | 'error' = 'error';
	message: string | undefined = undefined;
	data: any = undefined;


	constructor(type: 'success' | 'error', message?: string, data?: any) {
		this.type = type;
		this.message = message;
		this.data = data;
	}
	static success(option: payloadOption) {
		let payload = new Payload('success', option.message, option.data);
		return Response.json(payload);

	}
	static error(option: payloadOption) {
		let payload = new Payload('error', option.message, option.data);
		return Response.json(payload);
	}
}
