import { catalogApi } from "./clients.server";
import type { SearchCatalogObjectsRequest } from "square";
import { getOrder } from "./orders.server";
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
		let OrderLineItemsIds = orderResponse?.lineItems?.map((lineItem) => lineItem.catalogObjectId as string)

		const [landingPageItemsResponse, OrderLineItemsResponse] = await Promise.all([
			landingPageCategoryId ? getCategoryItems(landingPageCategoryId) : undefined,
			orderId && OrderLineItemsIds ? catalogApi.batchRetrieveCatalogObjects({
				objectIds: OrderLineItemsIds,
				includeRelatedObjects: true,
			}) : undefined,
		]);

		let populatedLineItems = orderResponse?.lineItems?.map((lineItem) => {
			let catalogObject = OrderLineItemsResponse?.result?.objects?.find((object) => object.id === lineItem.catalogObjectId);
			return {
				...lineItem,
				catalogObject,
			}
		})

		return {
			orderObject: orderResponse,
			// orderLineItems: OrderLineItemsResponse?.result,
			orderLineItems: populatedLineItems,
			orderLineItemsRelatedObjects: OrderLineItemsResponse?.result.relatedObjects,
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
