import type { LayoutServerLoad } from './$types';
import { getCategories, getCategoryItems } from "$lib/server/catalog.server";
import { categoriesCache } from "$lib/stores.svelte";


export const load: LayoutServerLoad = async () => {

	let categories = await getCategories();
	let items;
	// just for testing
	if ('objects' in categories && categories.objects) {
		items = await Promise.all(
			categories.objects.map(
				(category) => getCategoryItems(category.id)
			)
		);
	}

	return {
		categories,
		items
	}

};