import { catalogApi } from "./clients.server";
import type { SearchCatalogObjectsRequest } from "square";
import { getOrder, populateLineItems } from "./orders.server";
import { getCustomer } from "./customer.server";

const FETCH_LIMIT = 100;

export const getInitObjects = async (orderId: string | undefined, customerId: string | undefined) => {
	try {
		const landingPageCategoryName = "Home";
		let categoryCatalogSearchParams: SearchCatalogObjectsRequest = {
			objectTypes: ["CATEGORY"],
			limit: FETCH_LIMIT,
		}

		const [categoryResponse, orderResponse, customerResponse] = await Promise.all([
			catalogApi.searchCatalogObjects(categoryCatalogSearchParams),
			orderId ? getOrder(orderId) : undefined,
			customerId ? getCustomer(customerId) : undefined,
		]);

		if (categoryResponse.result.errors) throw categoryResponse.result.errors;

		let landingPageCategoryId = categoryResponse.result?.objects?.find(category => category.categoryData?.name === landingPageCategoryName)?.id;

		const [landingPageItemsResponse, popluateResponse] = await Promise.all([
			landingPageCategoryId ? getCategoryItems(landingPageCategoryId) : undefined,
			orderResponse?.lineItems?.length ? populateLineItems(orderResponse?.lineItems || []) : undefined,
		]);

		return {
			orderObject: orderResponse,
			orderLineItems: popluateResponse?.populatedLineItems,
			orderLineItemsRelatedObjects: popluateResponse?.relatedObjects,
			customerObject: customerResponse,

			categories: categoryResponse.result.objects || [],
			landingPage: landingPageItemsResponse,
		}

	} catch (error: any) {
		console.error(error);
		return { error };
	}

}

export const getCategoryItems = async (categoryId: string, cursor?: string) => {
	try {

		let catalogSearchParams: SearchCatalogObjectsRequest = {
			objectTypes: ["ITEM"],
			includeRelatedObjects: true,
			query: {
				exactQuery: {
					attributeName: 'categories',
					attributeValue: categoryId,
				}
			},
			limit: FETCH_LIMIT,
		}
		if (cursor) catalogSearchParams.cursor = cursor;

		const response = await catalogApi.searchCatalogObjects(catalogSearchParams);

		return response.result;

	} catch (error: any) {
		console.error(error);
		return {};
	}
}

export const getItem = async (itemId: string) => {
	try {
		const response = await catalogApi.retrieveCatalogObject(itemId, true);
		return response.result;

	} catch (error: any) {
		console.error(error);
		return {};
	}
}
