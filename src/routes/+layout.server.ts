import type { LayoutServerLoad } from './$types';
import { getCategoriesAndImages, getCategoryItems } from "$lib/server/catalog.server";
import { categoriesCache, imageCache } from "$lib/stores.svelte";
import type { CatalogObject } from 'square';


export const load: LayoutServerLoad = async () => {

	let { categories, images } = await getCategoriesAndImages();
	let items;

	// just for testing
	items = await Promise.all(
		categories.map(
			(category: CatalogObject) => getCategoryItems(category.id)
		)
	);

	return {
		categories,
		items,
		images
	}
};