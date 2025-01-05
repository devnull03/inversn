import { MODE, PROD_LOCATION_ID, SANDBOX_LOCATION_ID } from "$env/static/private";
import { ordersApi } from "$lib/server/clients.server";
import type { CartItem } from "$lib/models";
import type { OrderLineItem } from "square";


const buildLineItems = (items: CartItem[]): OrderLineItem[] => {
	let lineItems: OrderLineItem[] = [];
	for (let item of items) {
		lineItems.push({
			quantity: item.quantity?.toString() || '1',
			catalogObjectId: item.variationId,
		})
	}
	return lineItems
}

export const createCart = async (initCartItems: CartItem[]) => {
	try {
		const idempotencyKey = crypto.randomUUID()
		const lineItems = buildLineItems(initCartItems);
		const response = await ordersApi.createOrder({
			order: {
				locationId: MODE === 'prod' ? PROD_LOCATION_ID : SANDBOX_LOCATION_ID,
				state: 'DRAFT',
				source: {
					name: 'web',
				},
				lineItems
			},
			idempotencyKey
		});
		return {
			orderId: response.result.order?.id,
			orderVersion: response.result.order?.version,
			order: response.result.order,
			idempotencyKey,
		}
	} catch (error) {
		console.log(error);
	}
}

export const addToCart = async (orderId: string, orderVersion: number, newCartItems: CartItem[]) => {
	try {
		const idempotencyKey = crypto.randomUUID()
		const lineItems = buildLineItems(newCartItems);
		const response = await ordersApi.updateOrder(orderId, {
			order: {
				locationId: MODE === 'prod' ? PROD_LOCATION_ID : SANDBOX_LOCATION_ID,
				lineItems,
				version: orderVersion,
			},
			idempotencyKey
		});
		return {
			orderId: response.result.order?.id,
			orderVersion: response.result.order?.version,
			order: response.result.order,
			idempotencyKey,
		}
	} catch (error) {
		console.log(error);
	}
}

export const createSquareOrder = async (orderId: string, orderVersion: number) => {
	try {
		const idempotencyKey = crypto.randomUUID()
		const response = await ordersApi.updateOrder(orderId, {
			order: {
				locationId: MODE === 'prod' ? PROD_LOCATION_ID : SANDBOX_LOCATION_ID,
				version: orderVersion,
				state: 'OPEN',
			},
			idempotencyKey
		});
		return {
			orderId: response.result.order?.id,
			orderVersion: response.result.order?.version,
			order: response.result.order,
			idempotencyKey,
		}
	} catch (error) {
		console.log(error);
	}
}
