import { MODE, PROD_LOCATION_ID, SANDBOX_LOCATION_ID } from "$env/static/private";
import { ordersApi } from "$lib/server/squareClient.server";
import { PaymentHandler } from "./HdfcPaymentHandler.server";


export const createCart = async () => {

	try {
		const idempotencyKey = crypto.randomUUID()
		const response = await ordersApi.createOrder({
			order: {
				locationId: MODE === 'prod' ? PROD_LOCATION_ID : SANDBOX_LOCATION_ID,
				state: 'DRAFT',

				lineItems: [
					{
						quantity: '2',
						catalogObjectId: '{ITEM_VARIATION_ID}',
						modifiers: [
							{
								catalogObjectId: '{MODIFIER_ID}',
								quantity: '1'
							}
						]
					}
				],
			},
			idempotencyKey
		});

		console.log(response.result);
	} catch (error) {
		console.log(error);
	}

}

export const createSquareOrder = async (orderID: string) => {  }
