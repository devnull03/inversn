import { MODE, PROD_PAYU_KEY, PROD_PAYU_SALT, SANDBOX_PAYU_KEY, SANDBOX_PAYU_SALT } from '$env/static/private';
import axios, { toFormData } from 'axios';
import { paymentsApi } from '$lib/server/clients.server';
import { createHash } from 'crypto';
import type { Order } from 'square';
import type { FormData } from '$lib/components/form';


const EMAIL_REGEX = /^(?=.{6,254}$)[A-Za-z0-9_\-\.]{1,64}\@[A-Za-z0-9_\-\.]+\.[A-Za-z]{2,}$/
const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/

const validateParams = (params: any) => {
	Object.keys(params).forEach(k => {
		if (typeof params[k] !== 'string') {
			throw new TypeError(`TypeError: Param "${k}" required of type String`);
		}
	});
	const { txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5 } = params;

	if (!EMAIL_REGEX.test(email)) {
		throw new Error("ArgumentError: Invalid Email");
	}
	if (!AMOUNT_REGEX.test(amount)) {
		throw new Error("ArgumentError: amount should contain digits with upto 2 decimal places");
	}
	if (txnid.length > 25) {
		throw new Error("ArgumentError: txnid length should be less than equal to 25");
	}
	if (productinfo.length > 100) {
		throw new Error("ArgumentError: productinfo length should be less than equal to 100");
	}
	if (firstname.length > 60) {
		throw new Error("ArgumentError: firstname length should be less than equal to 60");
	}
	if (email.length > 50) {
		throw new Error("ArgumentError: email length should be less than equal to 50");
	}
	[udf1, udf2, udf3, udf4, udf5].forEach(udf => {
		if (udf.length > 255) {
			throw new Error("ArgumentError: udf length should be less than equal to 255");
		}
	});
}

const generateHash = ({
	key,
	salt,
	txnid,
	amount,
	productinfo,
	firstname,
	email,
	udf1 = '',
	udf2 = '',
	udf3 = '',
	udf4 = '',
	udf5 = '',
}: {
	key: string,
	salt: string,
	txnid: string,
	amount: string,
	productinfo: string,
	firstname: string,
	email: string,
	udf1?: string,
	udf2?: string,
	udf3?: string,
	udf4?: string,
	udf5?: string,

}) => {
	const cryp = createHash('sha512');
	const text = key + '|' + txnid + '|' + amount + '|' + productinfo + '|' + firstname + '|' + email + '|' + udf1 + '|' + udf2 + '|' + udf3 + '|' + udf4 + '|' + udf5 + '||||||' + salt;
	cryp.update(text);
	return cryp.digest('hex');
}

/* Response received from Payment Gateway at this page.
It is absolutely mandatory that the hash (or checksum) is computed again after you receive response from PayU and compare it with request and post back parameters. This will protect you from any tampering by the user and help in ensuring a safe and secure transaction experience. It is mandate that you secure your integration with PayU by implementing Verify webservice and Webhook/callback as a secondary confirmation of transaction response.

Hash string without Additional Charges -
hash = sha512(SALT|status||||||udf5|||||email|firstname|productinfo|amount|txnid|key)

With additional charges - 
hash = sha512(additionalCharges|SALT|status||||||udf5|||||email|firstname|productinfo|amount|txnid|key)

*/

const validateHash = (hash: string, {
	key,
	salt,
	txnid,
	amount,
	productinfo,
	firstname,
	email,
	udf1 = '',
	udf2 = '',
	udf3 = '',
	udf4 = '',
	udf5 = '',
	status,
	additionalCharges,
}: {
	key: string,
	salt: string,
	txnid: string,
	amount: string,
	productinfo: string,
	firstname: string,
	email: string,
	udf1?: string,
	udf2?: string,
	udf3?: string,
	udf4?: string,
	udf5?: string,
	status: string,
	additionalCharges?: string,
}) => {
	validateParams({ key, salt, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5 });
	if (typeof status !== 'string') {
		throw new TypeError('TypeError: Param "status" required of type String');
	}
	const keyString = key + '|' + txnid + '|' + amount + '|' + productinfo + '|' + firstname + '|' + email + '|' + udf1 + '|' + udf2 + '|' + udf3 + '|' + udf4 + '|' + udf5 + '|||||';
	const keyArray = keyString.split('|');
	const reverseKeyArray = keyArray.reverse();
	let reverseKeyString = salt + '|' + status + '|' + reverseKeyArray.join('|');
	if (additionalCharges) {
		reverseKeyString = additionalCharges + '|' + reverseKeyString
	}
	const cryp = createHash('sha512');
	cryp.update(reverseKeyString);
	const calchash = cryp.digest('hex');
	return calchash === hash;
}



export const createSquarePayment = async (order: Order, paymentType: "PayU" | "COD", formData: FormData) => {
	try {
		let customerData = {

			shippingAddress: {
				addressLine1: formData.address1,
				addressLine2: formData.address2,
				locality: formData.city,
				administrativeDistrictLevel1: formData.state,
				postalCode: formData.postalCode,
				country: 'IN',
			},
		}

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
			},
			...customerData
		});

		return response.result;
	} catch (error) {
		console.log(error);
	}
}

export const buildPaymentRequest = (order: Order, formData: FormData, originUrl: string) => {
	try {
		let rawData = {
			txnid: crypto.randomUUID(), // TODO
			amount: (Number(order.netAmountDueMoney?.amount) / 100).toString(),
			productinfo: order.lineItems?.map(item => item.name).join(', ') as string,
			firstname: formData.firstName as string,
			lastname: formData.lastName as string,
			email: formData.email as string,
			phone: formData.phone as string,
			surl: `${originUrl}/checkout/${order.id}/success`,
			furl: `${originUrl}/checkout/${order.id}/fail`,
			udf1: order.id as string, // square order id
		}

		let addressData;
		if (formData.billingAddressSame)
			addressData = {
				address1: formData.address1,
				address2: formData.address2,
				city: formData.city,
				state: formData.state,
				country: 'IN',
				postalCode: formData.postalCode,
			}
		else addressData = {
			address1: formData.billingAddress1,
			address2: formData.billingAddress2,
			city: formData.billingCity,
			state: formData.billingState,
			country: 'IN',
			postalCode: formData.billingPostalCode,
		}

		const creds = {
			key: MODE === 'prod' ? PROD_PAYU_KEY : SANDBOX_PAYU_KEY,
			salt: MODE === 'prod' ? PROD_PAYU_SALT : SANDBOX_PAYU_SALT,
		}

		const hash = generateHash({ ...creds, ...rawData });
		const encodedParams = new URLSearchParams(Object.entries({ key: creds.key, ...rawData, ...addressData, hash }));
		const url = MODE === 'prod' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment'
		const options = {
			method: 'POST',
			url,
			headers: {
				accept: 'text/json',
				'content-type': 'application/x-www-form-urlencoded',
				'mode': 'no-cors',
			},
			data: encodedParams,
			redirect: 'manual'
		};

		// const response = await axios.request(options);
		return { options, rawData };
	} catch (error) {
		console.error(error);
		return { error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export const verifyPaymentResponse = (response: any, rawData: any) => {
	const creds = {
		key: MODE === 'prod' ? PROD_PAYU_KEY : SANDBOX_PAYU_KEY,
		salt: MODE === 'prod' ? PROD_PAYU_SALT : SANDBOX_PAYU_SALT,
	}

	const parsedResponse = new URLSearchParams(response.data);

	const reverseHash = parsedResponse.get('hash');
	const txnStatus = parsedResponse.get('status');

	if (txnStatus !== 'success') return { error: "Transaction failed" };
	if (!reverseHash || !txnStatus) return { error: "Invalid response" };
	const isValidHash = validateHash(reverseHash, {
		...creds,
		...rawData,
		status: txnStatus,
	})

	if (!isValidHash) return { error: "Invalid hash" };

	return { status: txnStatus, ...parsedResponse }
}

export const verifyPayment = async (paymentData: any) => {

}

