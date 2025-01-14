import { MODE, PROD_PAYU_KEY, PROD_PAYU_SALT, SANDBOX_PAYU_KEY, SANDBOX_PAYU_SALT } from '$env/static/private';
import axios, { toFormData } from 'axios';
import { paymentsApi } from '$lib/server/clients.server';
import { createHash, verify } from 'crypto';
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

const generateVerifyHash = ({
	key,
	salt,
	var1,
	command,
}: {
	key: string,
	salt: string,
	var1: string,
	command: string,
}) => {
	const cryp = createHash('sha512');
	const text = key + '|' + command + '|' + var1 + '|' + salt;
	cryp.update(text);
	return cryp.digest('hex');
}

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
	/* Response received from Payment Gateway at this page.
	It is absolutely mandatory that the hash (or checksum) is computed again after you receive response from PayU and compare it with request and post back parameters. This will protect you from any tampering by the user and help in ensuring a safe and secure transaction experience. It is mandate that you secure your integration with PayU by implementing Verify webservice and Webhook/callback as a secondary confirmation of transaction response.
	
	Hash string without Additional Charges -
	hash = sha512(SALT|status||||||udf5|||||email|firstname|productinfo|amount|txnid|key)
	
	With additional charges - 
	hash = sha512(additionalCharges|SALT|status||||||udf5|||||email|firstname|productinfo|amount|txnid|key)
	
	*/
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

function generate_txnid() {
	return ('10000000-1000-4000-8000').replace(/[018]/g, c => (
		Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)
	);
}

export const createSquarePaymentRecord = async (order: Order, paymentType: "PayU" | "COD", formData: FormData) => {
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
		const txnid = generate_txnid();
		// console.log("Txnid", txnid, "length: ", txnid.length);
		
		let rawData = {
			txnid: txnid,
			amount: (Number(order.netAmountDueMoney?.amount) / 100).toFixed(2).toString(),
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

		// console.log("Raw Data", rawData);	
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

export const verifyPaymentResponse = (responseData: { hash: string, status: string }, rawData: any) => {
	const creds = {
		key: MODE === 'prod' ? PROD_PAYU_KEY : SANDBOX_PAYU_KEY,
		salt: MODE === 'prod' ? PROD_PAYU_SALT : SANDBOX_PAYU_SALT,
	}

	const reverseHash = responseData.hash;
	const txnStatus = responseData.status;

	if (txnStatus !== 'success') return { status: "failed", error: "Transaction failed" };
	if (!reverseHash || !txnStatus) return { status: "failed", error: "Invalid response" };

	const isValidHash = validateHash(reverseHash, {
		...creds,
		...rawData,
		status: txnStatus,
	})

	if (!isValidHash) return { status: "failed", error: "Invalid hash" };
	return { status: "verified" }
}

export const verifyPayment = async (paymentData: any) => {

	try {

		const verifyData = {
			key: MODE === 'prod' ? PROD_PAYU_KEY : SANDBOX_PAYU_KEY, command: 'verify_payment', var1: paymentData.txnid,
		}
		const verifyOptions = {
			method: 'POST',
			url: MODE === 'prod' ? 'https://info.payu.in/merchant/postservice?form=2' : 'https://test.payu.in/merchant/postservice?form=2',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			data: new URLSearchParams({
				...verifyData,
				hash: generateVerifyHash({ ...verifyData, salt: MODE === 'prod' ? PROD_PAYU_SALT : SANDBOX_PAYU_SALT })
			}),
		}

		const checkData = {
			key: MODE === 'prod' ? PROD_PAYU_KEY : SANDBOX_PAYU_KEY, command: 'check_payment', var1: paymentData.mihpayid,
		}
		const checkOptions = {
			method: 'POST',
			url: MODE === 'prod' ? 'https://info.payu.in/merchant/postservice?form=2' : 'https://test.payu.in/merchant/postservice?form=2',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			data: new URLSearchParams({
				...checkData,
				hash: generateVerifyHash({ ...checkData, salt: MODE === 'prod' ? PROD_PAYU_SALT : SANDBOX_PAYU_SALT })
			}),
		}

		const [verifyResponse, checkResponse] = await Promise.all([axios.request(verifyOptions), axios.request(checkOptions)]);

		if (verifyResponse.data.status !== 1 || checkResponse.data.status !== 1) {
			return { error: "Invalid transaction" };
		}

		const {
			mihpayid: verifyRes_mihpayid,
			txnid: verifyRes_txnid,
			amt: verifyRes_amount,
			productinfo: verifyRes_productinfo,
			firstname: verifyRes_firstname,
		} = verifyResponse.data.transaction_details[verifyData.var1];

		const {
			mihpayid: checkRes_mihpayid,
			txnid: checkRes_txnid,
			amt: checkRes_amount,
			productinfo: checkRes_productinfo,
			firstname: checkRes_firstname,
		} = checkResponse.data.transaction_details;

		console.debug('------------------------------------------------------------------')
		console.debug('paymentData', paymentData, '\n');
		console.debug('verifyResponse', verifyResponse.data, '\n');
		console.debug('checkResponse', checkResponse.data, '\n');
		console.debug('------------------------------------------------------------------')

		if (
			paymentData.txnid !== verifyRes_txnid ||
			paymentData.txnid !== checkRes_txnid ||
			// paymentData.mihpayid !== verifyRes_mihpayid ||
			// paymentData.mihpayid !== checkRes_mihpayid ||
			paymentData.amount !== verifyRes_amount ||
			paymentData.amount !== checkRes_amount ||
			paymentData.productinfo !== verifyRes_productinfo ||
			paymentData.productinfo !== checkRes_productinfo ||
			paymentData.firstname !== verifyRes_firstname ||
			paymentData.firstname !== checkRes_firstname
		) {
			const mismatchedFields = [];
			if (paymentData.txnid !== verifyRes_txnid || paymentData.txnid !== checkRes_txnid) mismatchedFields.push(`txnid (expected: ${paymentData.txnid}, verify: ${verifyRes_txnid}, check: ${checkRes_txnid})`);
			if (paymentData.mihpayid !== verifyRes_mihpayid || paymentData.mihpayid !== checkRes_mihpayid) mismatchedFields.push(`mihpayid (expected: ${paymentData.mihpayid}, verify: ${verifyRes_mihpayid}, check: ${checkRes_mihpayid})`);
			if (paymentData.amount !== verifyRes_amount || paymentData.amount !== checkRes_amount) mismatchedFields.push(`amount (expected: ${paymentData.amount}, verify: ${verifyRes_amount}, check: ${checkRes_amount})`);
			if (paymentData.productinfo !== verifyRes_productinfo || paymentData.productinfo !== checkRes_productinfo) mismatchedFields.push(`productinfo (expected: ${paymentData.productinfo}, verify: ${verifyRes_productinfo}, check: ${checkRes_productinfo})`);
			if (paymentData.firstname !== verifyRes_firstname || paymentData.firstname !== checkRes_firstname) mismatchedFields.push(`firstname (expected: ${paymentData.firstname}, verify: ${verifyRes_firstname}, check: ${checkRes_firstname})`);

			return { error: `Transaction details mismatch in fields: ${mismatchedFields.join(', ')}` };
		}

		return { status: "verified" };

	} catch (error) {
		console.log(error);
		return { error };
	}

}

