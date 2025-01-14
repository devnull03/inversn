import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { verifyPayment, verifyPaymentResponse } from "$lib/server/payment.server";
import { getOrder } from "$lib/server/orders.server";
import { orderCustomAttributesApi } from "$lib/server/clients.server";

export const load: PageServerLoad = async (event) => {
	const loadRequestContentType = event.request.headers.get('content-type');
	if (loadRequestContentType !== 'application/x-www-form-urlencoded') {
		redirect(307, '/');
	}
}

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData();

		const requestData_hash = data.get('hash') as string;
		const requestData_status = data.get('status') as string;
		const requestData_orderId = data.get('udf1') as string;

		if (!requestData_hash || !requestData_status || !requestData_orderId) {
			return fail(400, {
				message: 'Invalid transaction data | hash, status, order id missing',
			});
		}

		const orderResponse = await getOrder(requestData_orderId);

		if (!orderResponse) {
			return fail(400, {
				message: 'Invalid order id | order not found',
			});
		}

		const response = await orderCustomAttributesApi.retrieveOrderCustomAttribute(orderResponse.id as string, 'txnid');

		if (response.result.errors) {
			return fail(400, {
				message: response.result.errors,
			});
		}

		let parsedtxndata = (response.result.customAttribute?.value as string).split('|');

		let paymentData = {
			txnid: parsedtxndata[0],
			amount: (Number(orderResponse.netAmountDueMoney?.amount) / 100).toFixed(2).toString(),
			productinfo: orderResponse.lineItems?.map((item) => item.name).join(', '),
			firstname: parsedtxndata[1],
			email: parsedtxndata[2],
			udf1: orderResponse.id,
		};

	
		console.debug('paymentData', paymentData, '\nrequestData', data);
		if (paymentData.txnid !== data.get('txnid') || paymentData.amount !== data.get('amount') || paymentData.udf1 !== data.get('udf1') || paymentData.email !== data.get('email')) {
			return fail(400, {
				message: `Invalid transaction data | data mismatch: ${paymentData.txnid} !== ${data.get('txnid')} (${paymentData.txnid !== data.get('txnid')}) , ${paymentData.amount} !== ${data.get('amount')} (${paymentData.amount !== data.get('amount')}) , ${paymentData.udf1} !== ${data.get('udf1')} (${paymentData.udf1 !== data.get('udf1')}) , ${paymentData.email} !== ${data.get('email')} (${paymentData.email !== data.get('email')})`,
			});
		}

		const responseVerification = verifyPaymentResponse({ hash: requestData_hash, status: requestData_status }, paymentData);
		console.debug('responseVerification', responseVerification);	
		if (responseVerification.status !== 'verified') {
			return fail(400, {
				message: responseVerification.error || 'Invalid transaction data | hash mismatch',
			});
		}


		const transactionVerification = await verifyPayment({ ...paymentData, mihpayid: data.get('mihpayid') as string });
		if (transactionVerification.status !== 'verified') {
			return fail(400, {
				message: transactionVerification.error || 'Invalid transaction data',
			});
		}

		return {
			status: 200,
			body: {
				message: 'Transaction successful',
				transactionData: Object.fromEntries(data.entries()),
				order: orderResponse,
			},
		};

	},
};
