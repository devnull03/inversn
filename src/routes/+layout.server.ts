import type { LayoutServerLoad } from './$types';
import { getInitObjects } from "$lib/server/catalog.server";
import { error } from '@sveltejs/kit';


export const load: LayoutServerLoad = async ({ cookies }) => {

	const orderId = cookies.get('orderId');
	const customerId = cookies.get('customerId');

	const initObjects = await getInitObjects(orderId, customerId);

	if (initObjects.error) {
		console.error(initObjects.error);
		error(500, 'Internal Server Error');
	}

	cookies.set('customerId', initObjects.customerObject?.id || '', { path: '/' });
	cookies.set('orderId', initObjects.orderObject?.id || '', { path: '/' });
	cookies.set('orderVersion', initObjects.orderObject?.version?.toString() || '', { path: '/' });

	return {
		categories: initObjects.categories,
		landingPageItems: initObjects.landingPage,
		orderData: {
			orderId: cookies.get('orderId'),
			orderVersion: cookies.get('orderVersion'),
			orderObject: initObjects.orderObject,
			orderLineItems: initObjects.orderLineItems
		},
		customerData: {
			customerId: cookies.get('customerId'),
			customerObject: initObjects.customerObject
		}
	}
};
