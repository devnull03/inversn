import { APIException, PaymentHandler } from "./HdfcPaymentHandler.server";


export const initiatePayment = async (orderId: string, amount: number) => {
	// const orderId = `order_${Date.now()}`;
	// const amount = 1 + crypto.randomInt(100);
	// const returnUrl = `${req.protocol}://${req.hostname}:${port}/handlePaymentResponse`;
	const returnUrl = "";
	const paymentHandler = PaymentHandler.getInstance();
	try {
		const orderSessionResp = await paymentHandler.orderSession({
			order_id: orderId,
			amount,
			currency: "INR",
			return_url: returnUrl,
			// [MERCHANT_TODO]:- please handle customer_id, it's an optional field but we suggest to use it.
			customer_id: "sample-customer-id",
			// please note you don't have to give payment_page_client_id here, it's mandatory but
			// PaymentHandler will read it from config.json file

			// payment_page_client_id: paymentHandler.getPaymentPageClientId()
		});
		// return res.redirect(orderSessionResp.payment_links.web);
	} catch (error) {
		// [MERCHANT_TODO]:- please handle errors
		if (error instanceof APIException) {
			// return res.send("PaymentHandler threw some error");
		}
		// [MERCHANT_TODO]:- please handle errors
		// return res.send("Something went wrong");
	}

}


