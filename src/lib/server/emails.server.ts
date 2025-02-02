import { RESEND_API_KEY, RESEND_AUDIENCE_ID } from "$env/static/private";
import { Resend } from "resend";

const resend = new Resend(RESEND_API_KEY);

export const createEmailSignup = async (email: string) => {
	try {
		const res = await resend.contacts.create({
			email: email,
			unsubscribed: false,
			audienceId: RESEND_AUDIENCE_ID,
		});
		return res;
	} catch (error) {
		console.error(error);
		return { error };
	}

}

