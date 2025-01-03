import { getItem } from "$lib/server/catalog.server";
import { categoryItemsCache } from "$lib/stores.svelte";
import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { createInitCustomer } from "$lib/server/customer.server";
import { addToCart, createCart } from "$lib/server/orders.server";


export const load: PageServerLoad = async ({ params }) => {

	let catalogItemId = params.id;

	const res = await getItem(catalogItemId);

	if (!res) return error(404, 'Not found');

	return {
		product: res.object,
		productImages: res.relatedObjects?.filter((o) => o.type === 'IMAGE'),
		productTax: res.relatedObjects?.find((o) => o.type === 'TAX'),
	}

}

export const actions: Actions = {
	default: async (event) => {
		const data = await event.request.formData()
		const variationId = data.get('variationId') as string;
		const orderId = data.get('orderId') as string;
		const orderVersion = data.get('orderVersion');
		const buyNow = data.get('buyNow') as string;

		if (!variationId) return error(400, 'Missing variationId');

		// console.log(`variationId: ${variationId}, orderId: ${orderId}, buyNow: ${buyNow}`);

		let res;
		if (orderId) {
			if (!orderVersion) return error(400, 'Missing orderVersion');
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

		if (buyNow === "true") {
			redirect(303, `/checkout`);
		}

		return {
			variationId,
			...res,
		}
	}
}
