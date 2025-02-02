import { superValidate } from "sveltekit-superforms";
import type { Actions, PageServerLoad } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import { formSchema } from "./schema";
import { fail } from "@sveltejs/kit";
import { createEmailSignup } from "$lib/server/emails.server";


export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(formSchema)),
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		const res = await createEmailSignup(form.data.email);

		if (res.error) {
			return fail(500, {
				form,
				res
			});
		}

		return {
			form,
			res
		};
	},
};


