import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { addToCart, createCart, deleteFromCart, updateCartItemQuantity } from "$lib/server/orders.server";


export const actions: Actions = {
	add: async ({ request, cookies }) => {
		const data = await request.formData()
		const variationId = data.get('variationId') as string;
		const buyNow = data.get('buyNow') as string;

		const orderId = cookies.get('orderId');
		const orderVersion = cookies.get('orderVersion');

		if (!variationId) return fail(400, { variationId, missing: true });

		let res;
		if (orderId) {
			if (!orderVersion) return fail(400, { orderVersion, missing: true });
			let parsedOrderVersion: number;
			try {
				parsedOrderVersion = Number.parseInt(orderVersion as string)
			} catch (e) {
				return error(400, 'Invalid orderVersion');
			}
			res = await addToCart(orderId, parsedOrderVersion, [{ variationId, quantity: 1 }]);
		} else {
			res = await createCart([{ variationId, quantity: 1 }]);
		}
		if (res?.orderId)
			cookies.set('orderId', res.orderId, { path: '/' });
		if (res?.orderVersion)
			cookies.set('orderVersion', res.orderVersion.toString(), { path: '/' });


		if (buyNow === "true") {
			redirect(303, `/checkout`);
		}

		return {
			variationId,
			...res,
		}
	},
	delete: async ({ request, cookies }) => {
		const data = await request.formData()
		const lineItemUid = data.get('lineItemUid') as string;
		const orderId = cookies.get('orderId');
		const orderVersion = cookies.get('orderVersion');

		if (!orderId) return fail(400, { orderId, missing: true });
		if (!orderVersion) return fail(400, { orderVersion, missing: true });;
		if (!lineItemUid) return fail(400, { lineItemUid, missing: true });;

		let parsedOrderVersion: number;
		try {
			parsedOrderVersion = Number.parseInt(orderVersion as string)
		} catch (e) {
			return fail(400, { orderVersion, invalid: true });
		}
		const res = await deleteFromCart(orderId, parsedOrderVersion, lineItemUid);

		if (res?.orderId)
			cookies.set('orderId', res.orderId, { path: '/' });
		if (res?.orderVersion)
			cookies.set('orderVersion', res.orderVersion.toString(), { path: '/' });

		return {
			variationId: lineItemUid,
			...res,
		}
	},
	update: async ({ request, cookies }) => {
		const data = await request.formData()
		const lineItemUid = data.get('lineItemUid') as string;
		const quantity = data.get('quantity') as string;
		// const variationId = data.get('variationId') as string;

		const orderId = cookies.get('orderId');
		const orderVersion = cookies.get('orderVersion');

		console.log("updating quantity of", lineItemUid, "to", quantity);
		

		if (!orderId) return fail(400, { orderId, missing: true });
		if (!orderVersion) return fail(400, { orderVersion, missing: true });;
		if (!lineItemUid) return fail(400, { lineItemUid, missing: true });;
		if (!quantity) return fail(400, { quantity, missing: true });;
		// if (!variationId) return fail(400, { variationId, missing: true });

		let parsedOrderVersion: number;
		try {
			parsedOrderVersion = Number.parseInt(orderVersion as string)
		} catch (e) {
			return fail(400, { orderVersion, invalid: true });
		}
		const res = await updateCartItemQuantity(orderId, parsedOrderVersion, lineItemUid, Number.parseInt(quantity));

		if (res?.orderId)
			cookies.set('orderId', res.orderId, { path: '/' });
		if (res?.orderVersion)
			cookies.set('orderVersion', res.orderVersion.toString(), { path: '/' });

		return {
			variationId: lineItemUid,
			...res,
		}
	}
}

