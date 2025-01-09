import { CATALOG_MODE, PROD_LOCATION_ID, SANDBOX_LOCATION_ID } from "$env/static/private";
import { catalogApi, ordersApi } from "$lib/server/clients.server";
import type { CartItem } from "$lib/models";
import type { Customer, OrderLineItem } from "square";
import type { FormData } from "$lib/components/form";


export const getOrder = async (orderId: string) => {
	try {
		const response = await ordersApi.retrieveOrder(orderId);
		return response.result.order;
	} catch (error) {
		console.log(error);
		return undefined;
	}
}

export const populateLineItems = async (lineItems: OrderLineItem[]) => {
	try {
		let OrderLineItemsIds = lineItems?.map((lineItem) => lineItem.catalogObjectId as string)

		const OrderLineItemsResponse = await catalogApi.batchRetrieveCatalogObjects({
			objectIds: OrderLineItemsIds,
			includeRelatedObjects: true,
		})

		let populatedLineItems = lineItems?.map((lineItem) => {
			let catalogObject = OrderLineItemsResponse?.result?.objects?.find((object) => object.id === lineItem.catalogObjectId);
			let images = OrderLineItemsResponse?.result?.relatedObjects?.find((object) => catalogObject?.itemVariationData?.imageIds?.includes(object.id));
			return {
				...lineItem,
				catalogObject,
				images,
			}
		})

		return {
			populatedLineItems,
			relatedObjects: OrderLineItemsResponse?.result.relatedObjects,
		};

	} catch (error) {
		console.log(error);
		return undefined;
	}
}

const buildLineItems = (items: { variationId: string, quantity: number }[]): OrderLineItem[] => {
	//? Redundant function, but keeping in case we need to add more fields to the line item

	let lineItems: OrderLineItem[] = [];
	for (let item of items) {
		lineItems.push({
			quantity: item.quantity?.toString() || '1',
			catalogObjectId: item.variationId,
		})
	}
	return lineItems
}

export const createCart = async (initCartItems: { variationId: string, quantity: number }[]) => {
	try {
		const idempotencyKey = crypto.randomUUID()
		const lineItems = buildLineItems(initCartItems);
		const response = await ordersApi.createOrder({
			order: {
				locationId: CATALOG_MODE === 'prod' ? PROD_LOCATION_ID : SANDBOX_LOCATION_ID,
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
			lineItem: response.result.order?.lineItems?.find((lineItem) => lineItem.catalogObjectId === initCartItems[0].variationId),
			idempotencyKey,
		}
	} catch (error) {
		console.log(error);
	}
}

export const addToCart = async (orderId: string, orderVersion: number, newCartItems: { variationId: string, quantity: number }[]) => {
	try {
		const idempotencyKey = crypto.randomUUID()
		const lineItems = buildLineItems(newCartItems);
		const response = await ordersApi.updateOrder(orderId, {
			order: {
				locationId: CATALOG_MODE === 'prod' ? PROD_LOCATION_ID : SANDBOX_LOCATION_ID,
				lineItems,
				version: orderVersion,
			},
			idempotencyKey
		});
		return {
			orderId: response.result.order?.id,
			orderVersion: response.result.order?.version,
			order: response.result.order,
			lineItem: response.result.order?.lineItems?.find((lineItem) => lineItem.catalogObjectId === newCartItems[0].variationId),
			idempotencyKey,
		}
	} catch (error) {
		console.log(error);
	}
}

export const deleteFromCart = async (orderId: string, orderVersion: number, cartItemUid: string) => {
	try {
		const idempotencyKey = crypto.randomUUID()
		const response = await ordersApi.updateOrder(orderId, {
			order: {
				locationId: CATALOG_MODE === 'prod' ? PROD_LOCATION_ID : SANDBOX_LOCATION_ID,
				version: orderVersion,
			},
			fieldsToClear: [`line_items[${cartItemUid}]`],
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

export const updateCartItemQuantity = async (orderId: string, orderVersion: number, cartItemUid: string, quantity: number) => {
	try {
		const idempotencyKey = crypto.randomUUID()
		const response = await ordersApi.updateOrder(orderId, {
			order: {
				locationId: CATALOG_MODE === 'prod' ? PROD_LOCATION_ID : SANDBOX_LOCATION_ID,
				version: orderVersion,
				lineItems: [{
					uid: cartItemUid,
					quantity: quantity.toString(),
				}]
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

export const createSquareOrder = async (orderDetails: { orderId: string, orderVersion: number }, customer: Customer, formData: FormData) => {
	try {
		const idempotencyKey = crypto.randomUUID()
		const response = await ordersApi.updateOrder(orderDetails.orderId, {
			order: {
				locationId: CATALOG_MODE === 'prod' ? PROD_LOCATION_ID : SANDBOX_LOCATION_ID,
				version: orderDetails.orderVersion,
				state: 'OPEN',
				customerId: customer.id,
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
