import { MODE, PROD_PAYU_KEY, PROD_PAYU_SALT, SANDBOX_PAYU_KEY, SANDBOX_PAYU_SALT } from '$env/static/private';
import axios from 'axios';
import { paymentsApi } from '$lib/server/clients.server';
import type { Order } from 'square';


export const createSquarePayment = async (order: Order, paymentType: "PayU" | "COD") => {
	try {
		const idempotencyKey = crypto.randomUUID();
		const response = await paymentsApi.createPayment({
			sourceId: 'EXTERNAL',
			idempotencyKey,
			amountMoney: {
				amount: order.totalMoney?.amount,
				currency: order.totalMoney?.currency
			},
			orderId: order.id,
			externalDetails: {
				type: 'OTHER',
				source: paymentType
			}
		});

		return response.result;
	} catch (error) {
		console.log(error);
	}
}

export const initiatePayment = async (order: Order, ) => {
	try {
		let rawData = {
			txnid: '', // TODO
			amount: '',
			productinfo: '',
			firstname: '',
			lastname: '',
			email: '',
			phone: '',
			surl: '', // TODO
			furl: '', // TODO
			address1: '',
			address2: '',
			city: '',
			state: '',
			country: '',
			zipcode: '',
			udf1: '', // square order id
		}

		const payu = require('payu-sdk')({
			key: MODE === 'prod' ? PROD_PAYU_KEY : SANDBOX_PAYU_KEY,
			salt: MODE === 'prod' ? PROD_PAYU_SALT : SANDBOX_PAYU_SALT,
		});

		const hash = payu.hasher.generateHash(rawData)
		const encodedParams = new URLSearchParams({ key: MODE === 'prod' ? PROD_PAYU_KEY : SANDBOX_PAYU_KEY, ...rawData, hash });
		const url = MODE === 'prod' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment'
		const options = {
			method: 'POST',
			url,
			headers: { accept: 'text/plain', 'content-type': 'application/x-www-form-urlencoded' },
			data: encodedParams
		};

		const response = await axios.request(options);
		const parsedResponse = new URLSearchParams(response.data);

		const reverseHash = parsedResponse.get('hash');
		const txnStatus = parsedResponse.get('status');

		if (txnStatus !== 'success') throw new Error('Transaction failed');
		if (!reverseHash || !txnStatus) throw new Error('Invalid response');

		const isValidHash = payu.hasher.validateHash(reverseHash, {
			status: txnStatus,
		})

		if (!isValidHash) throw new Error('Invalid hash');

	} catch (error) {
		console.error(error);
		return { error };
	}
}

export const verifyPayment = async (paymentData: any) => {

}

