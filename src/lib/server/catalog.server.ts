import { toast } from "svelte-sonner";
import { catalogApi } from "./squareClient.server";
import { categoriesCache, categoryItemsCache, imageCache } from "$lib/stores.svelte";
import type { CatalogCategory, CatalogImage, CatalogObject, CatalogObjectCategory } from "square";

const FETCH_LIMIT = 100;

export const getCategoriesAndImages = async (categoryCursor?: string, imageCursor?: string) => {
	try {

		type CatalogSearchParams = { objectTypes: string[], limit: number, cursor?: string }

		let categoryCatalogSearchParams: CatalogSearchParams = {
			objectTypes: ["CATEGORY"],
			limit: FETCH_LIMIT,
		}
		if (categoryCursor) categoryCatalogSearchParams.cursor = categoryCursor;

		let imageCatalogSearchParams: CatalogSearchParams = {
			objectTypes: ["IMAGE"],
			limit: FETCH_LIMIT,
		}
		if (imageCursor) imageCatalogSearchParams.cursor = imageCursor;

		const [categoryResponse, imageResponse] = await Promise.all([catalogApi.searchCatalogObjects(categoryCatalogSearchParams), catalogApi.searchCatalogObjects(imageCatalogSearchParams)]);

		// categoriesCache.set((categoryResponse.result.objects || []));
		// imageCache.set((imageResponse.result.objects || []));

		return {
			categories: categoryResponse.result.objects || [],
			categoryCursor: categoryResponse.result.cursor,

			images: imageResponse.result.objects || [],
			imageCursor: imageResponse.result.cursor,
		}

	} catch (error: any) {
		toast.error(`${error.category}: Failed to fetch categories`);
		console.error(error);
		return { categoryCursor: undefined, imageCursor: undefined, categories: [], images: [] };
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

		return response.result;

	} catch (error: any) {
		toast.error(`${error.category}: Failed to fetch category items`);
		console.error(error);
		return {};
	}
}
