import type { LayoutServerLoad } from './$types';
import { getInitObjects } from "$lib/server/catalog.server";
import { error, redirect } from '@sveltejs/kit';
import { MODE } from '$env/static/private';
import { dev } from '$app/environment';


export const load: LayoutServerLoad = async ({ cookies, url }) => {

	//? COMING SOON
	if (MODE === 'prod') {
		if (url.pathname !== '/coming-soon')
			redirect(307, '/coming-soon');
		return {}
	};

	const orderId = cookies.get('orderId');
	const customerId = cookies.get('customerId');

	console.log("cookies: ", orderId, " | ", customerId);


	const initObjects: any = await getInitObjects(orderId, customerId);

	if (initObjects.error) {
		console.error(initObjects.error);
		error(500, 'Internal Server Error');
	}

	// console.log("initObjects.customerObject: ", initObjects.customerObject);

	initObjects.customerObject?.id && cookies.set('customerId', initObjects.customerObject?.id || '', { path: '/' });
	cookies.set('orderId', initObjects.orderObject?.id || '', { path: '/' });
	cookies.set('orderVersion', initObjects.orderObject?.version?.toString() || '', { path: '/' });

	return {
		categories: initObjects.categories,
		landingPageItems: initObjects.landingPage,
		orderData: {
			orderId: cookies.get('orderId'),
			orderVersion: cookies.get('orderVersion'),
			orderObject: initObjects.orderObject,
			orderLineItems: initObjects.orderLineItems,
			orderLineItemsRelatedObjects: initObjects.orderLineItemsRelatedObjects
		},
		customerData: {
			customerId: cookies.get('customerId'),
			customerObject: initObjects.customerObject
		}
	}
};
