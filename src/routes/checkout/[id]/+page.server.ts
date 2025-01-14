import type { Actions, PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { formSchema } from "$lib/components/form/schema";
import { zod } from "sveltekit-superforms/adapters";
import { fail } from "@sveltejs/kit";
import { createCustomer, getCustomer } from "$lib/server/customer.server";
import { createSquareOrder } from "$lib/server/orders.server";
import type { Customer, Order } from "square";
import { buildPaymentRequest } from "$lib/server/payment.server";
import axios from "axios";
import { orderCustomAttributesApi } from "$lib/server/clients.server";



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

		// console.log("Customer", customer);


		if (customer.error) {
			return fail(500, {
				form, message: "error creating customer", error: customer.error
			});
		}
		customer?.customerId && event.cookies.set("customerId", customer.customerId, { path: "/" });

		console.log("Created Customer");

		// change order state to OPEN
		const openOrder = await createSquareOrder(orderDetails, customer.customer as Customer, form.data);

		if (openOrder.error) {
			return fail(500, {
				form, message: "error creating order", error: openOrder.error
			});
		}

		if (openOrder && openOrder.orderId && openOrder.orderVersion) {
			console.log("setting order cookies");

			event.cookies.set("orderId", openOrder.orderId as string, { path: "/" });
			event.cookies.set("orderVersion", openOrder.orderVersion.toString() as string, { path: "/" });
		}
		console.log("Created Order");

		// build PayU payment request to send to client
		const { options: paymentReqOptions, rawData: paymentData, error: paymentError } = buildPaymentRequest(openOrder?.order as Order, form.data, event.url.origin);

		if (paymentError || !paymentReqOptions) {
			return fail(500, {
				form, message: "error building payment request", error: paymentError
			});
		}

		const paymentRes = await axios.request(paymentReqOptions)

		try {
			const orderCustomAttributeIdempotencyKey = crypto.randomUUID();
			const response = await orderCustomAttributesApi.upsertOrderCustomAttribute(openOrder?.orderId as string,
				'txnid',
				{
					customAttribute: {
						key: 'txnid',
						value: `${paymentData.txnid}|${paymentData.firstname}|${paymentData.email}`,
					},
					idempotencyKey: orderCustomAttributeIdempotencyKey,
				});
		} catch (error) {
			console.log(error);
		}

		// SUCCESS
		// create a external payment in square
		// do delhivery stuff.... i need to check exactly how

		// FAIL
		// prompt to try again

		return {
			form,
			customer,
			order: openOrder,
			redirectUrl: paymentRes.request.res.responseUrl,
		};
	},
};

