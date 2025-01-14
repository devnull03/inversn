import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createSquarePaymentRecord, verifyPayment, verifyPaymentResponse } from "$lib/server/payment.server";
import { getOrder } from "$lib/server/orders.server";
import { orderCustomAttributesApi } from "$lib/server/clients.server";
import { getCustomer } from "$lib/server/customer.server";
import type { Order } from "square";

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
		const requestData_customerId = data.get('udf2') as string;
		if (!requestData_hash || !requestData_status || !requestData_orderId || !requestData_customerId) {
			return fail(400, {
				message: 'Invalid transaction data | hash, status, order id, customer id missing',
			});
		}
		const orderResponse = await getOrder(requestData_orderId);
		if (!orderResponse) {
			return fail(400, {
				message: 'Invalid order id | order not found',
			});
		}
		if (orderResponse.customerId !== requestData_customerId) {
			return fail(400, {
				message: 'Invalid customer id | customer id mismatch with order',
			});
		}
		const customerResponse = await getCustomer(requestData_customerId);
		if (!customerResponse) {
			return fail(400, {
				message: 'Invalid customer id | customer not found',
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
			phone: parsedtxndata[3],
			udf1: orderResponse.id,
			udf2: customerResponse.customer?.id,
		};

		console.debug('paymentData', paymentData);
		if (paymentData.txnid !== data.get('txnid') || paymentData.amount !== data.get('amount') || paymentData.udf1 !== data.get('udf1') || paymentData.udf2 !== data.get('udf2') || paymentData.email !== data.get('email')) {
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

		// Create square record
		const shippingAddress = customerResponse.customer?.address || {};
		const billingAddress = {
			billingAddress1: data.get('address1') as string,
			billingAddress2: data.get('address2') as string,
			billingCity: data.get('city') as string,
			billingState: data.get('state') as string,
			billingPostalCode: data.get('zipcode') as string,
			billingCountry: data.get('country') as string,
			billingPhone: data.get('phone') as string,
			billingPhoneCountryCode: "+91",
		};
		const paymentRecordData = {
			email: customerResponse.customer?.emailAddress as string,
			firstName: shippingAddress.firstName,
			lastName: shippingAddress.lastName,
			country: shippingAddress.country,
			address1: shippingAddress.addressLine1,
			address2: shippingAddress.addressLine2,
			city: shippingAddress.locality,
			state: shippingAddress.administrativeDistrictLevel1,
			postalCode: shippingAddress.postalCode,
			phoneCountryCode: '+91',
			phone: customerResponse.customer?.phoneNumber as string,
			discountCode: data.get('discountCode') as string,
			...billingAddress
		};
		const squarePaymentRecordResponse = await createSquarePaymentRecord(orderResponse as Order, "PayU", paymentRecordData, customerResponse.customer?.id as string, data.get('txnid') as string, data.get('mihpayid') as string);

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
