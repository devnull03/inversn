import { redirect, type Load } from "@sveltejs/kit";


export const load: Load = async ({ params }) => {
	redirect(303, `/`);
}

