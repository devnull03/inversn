import type { LayoutServerLoad } from './$types';
import { getCategoriesAndImages, getCategoryItems } from "$lib/server/catalog.server";
import { categoriesCache, imageCache } from "$lib/stores.svelte";
import type { CatalogObject, SearchCatalogItemsResponse } from 'square';


export const load: LayoutServerLoad = async () => {

	const landingPageCategoryName = "Home";

	const { categories, images } = await getCategoriesAndImages();

	let landingPageCategoryId = categories.find(category => category.categoryData?.name === landingPageCategoryName)?.id;
	let res: SearchCatalogItemsResponse = {};
	if (landingPageCategoryId) {
		res = await getCategoryItems(landingPageCategoryId);
	}

	return {
		categories,
		images,
		landingPageItems: res.items || []
	}
};