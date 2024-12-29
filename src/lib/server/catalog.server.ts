import { toast } from "svelte-sonner";
import { catalogApi } from "./squareClient.server";
import { categoriesCache, categoryItemsCache } from "$lib/stores.svelte";

const FETCH_LIMIT = 50;

export const getCategories = async (cursor?: string) => {
	try {

		type CatalogSearchParams = { objectTypes: string[], limit: number, cursor?: string }
		let catalogSearchParams: CatalogSearchParams = {
			objectTypes: ["CATEGORY"],
			limit: FETCH_LIMIT,
		}
		if (cursor) catalogSearchParams.cursor = cursor;

		const response = await catalogApi.searchCatalogObjects(catalogSearchParams);

		categoriesCache.update((categories) => {
			let categoriesIds = categories.map(category => category.id);
			for (const category of response.result.objects ?? []) {
				if (!categoriesIds.includes(category.id))
					categories.push(category);
			}
			return categories;
		});

		return response.result;

	} catch (error: any) {
		toast.error(`${error.category}: Failed to fetch categories`);
		console.error(error);
		return [];
	}
}

export const getCategoryItems = async (categoryId: string, cursor?: string) => {
	try {

		type CatalogSearchParams = { categoryIds: string[], limit: number, cursor?: string }
		let catalogSearchParams: CatalogSearchParams = {
			categoryIds: [categoryId],
			limit: FETCH_LIMIT,
		}
		if (cursor) catalogSearchParams.cursor = cursor;

		const response = await catalogApi.searchCatalogItems(catalogSearchParams);

		categoryItemsCache.update((categoryItems) => {
			let categoryItemsIds = categoryItems[categoryId] ?? [];

			return categoryItems;
		});

		return response.result;

	} catch (error: any) {
		toast.error(`${error.category}: Failed to fetch category items`);
		console.error(error);
		return {};
	}
}
