import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const loadRequestContentType = event.request.headers.get('content-type');
	if (loadRequestContentType !== 'application/x-www-form-urlencoded') {
		redirect(307, '/');
	}
}

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();

		return {
			...Object.fromEntries(data.entries()),
		}
	}
}