import { getItem } from "$lib/server/catalog.server";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
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
	default: async ({ request, cookies }) => {
		// TODO: reduce duplication with cart/+page.server.ts
		const data = await request.formData()
		const variationId = data.get('variationId') as string;
		const buyNow = data.get('buyNow') as string;

		const orderId = cookies.get('orderId');
		const orderVersion = cookies.get('orderVersion');

		if (!variationId) return fail(400, { variationId, missing: true });
		let parsedOrderVersion: number;
		try {
			parsedOrderVersion = Number.parseInt(orderVersion as string)
		} catch (e) {
			return error(400, 'Invalid orderVersion');
		}

		let res;
		if (orderId) {
			if (!orderVersion) return fail(400, { orderVersion, missing: true });
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
			from: 'product',
			...res,
		}
	},
}