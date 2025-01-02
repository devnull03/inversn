import { getItem } from "$lib/server/catalog.server";
import { categoryItemsCache } from "$lib/stores.svelte";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async ({ params }) => {

	let catalogItemId = params.id;

	let res = await getItem(catalogItemId);

	if (!res) return error(404, 'Not found');

	return {
		product: res.object,
		productImages: res.relatedObjects?.filter((o) => o.type === 'IMAGE'),
		productTax: res.relatedObjects?.find((o) => o.type === 'TAX'),
	}

}

