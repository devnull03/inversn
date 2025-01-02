import type { LayoutServerLoad } from './$types';
import { getCategoriesAndImages, getCategoryItems } from "$lib/server/catalog.server";
import { categoriesCache, imageCache } from "$lib/stores.svelte";
import type { CatalogObject } from 'square';


export const load: LayoutServerLoad = async () => {

	const landingPageCategoryName = "Home";

	let { categories, images } = await getCategoriesAndImages();
	let landingPageCategoryId = categories.find(category => category.categoryData?.name === landingPageCategoryName)?.id;
	let landingPageItems: CatalogObject[] = [];
	if (landingPageCategoryId) {
		let res = await getCategoryItems(landingPageCategoryId);
		landingPageItems = res.items || [];
	}

	return {
		categories,
		images,
		landingPageItems
	}
};