import type { Actions, PageServerLoad } from "./$types.js";
import { superValidate } from "sveltekit-superforms";
import { formSchema } from "$lib/components/form/schema.js";
import { zod } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";
import { createCustomer, getCustomer } from "$lib/server/customer.server";
import { createSquareOrder } from "$lib/server/orders.server";
import type { Customer, Order } from "square";
import { initiatePayment } from "$lib/server/payment.server";



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

		let orderDetails;
		try {
			if (event.params.id !== event.cookies.get("orderId")) {
				throw new Error("invalid order");
			}
			orderDetails = {
				orderId: event.params.id,
				orderVersion: Number.parseInt(event.cookies.get("orderVersion") as string),
			}
		} catch (error) {
			console.error(error);
			return fail(500, {
				form, message: "invalid cookies", error
			});
		}

		// Steps:
		// Create a customer
		let customer;

		if (event.cookies.get("customerId"))
			customer = await getCustomer(event.cookies.get("customerId") as string);
		else customer = await createCustomer(form.data);

		if (customer.error) {
			return fail(500, {
				form, message: "error creating customer", error: customer.error
			});
		}
		customer?.customerId && event.cookies.set("customerId", customer.customerId, { path: "/" });

		console.log("Created Customer");

		// change order state to OPEN
		const openOrder = await createSquareOrder(orderDetails, customer.customer as Customer, form.data);
		console.log("Created Order");

		// initiate PayU payment
		const payment = await initiatePayment(openOrder?.order as Order, form.data, event.url.origin);
		console.log("Initiated Payment");

		// SUCCESS
		// create a external payment in square
		// do delhivery stuff.... i need to check exactly how

		// FAIL
		// prompt to try again



		return {
			form,
		};
	},
};

