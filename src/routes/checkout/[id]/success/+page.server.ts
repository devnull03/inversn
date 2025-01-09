import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	console.log(event, event.request);
}
