import { customersApi } from "$lib/server/clients.server";


export const getCustomer = async (customerId: string) => {

	try {
		const response = await customersApi.retrieveCustomer(customerId);
		return response.result.customer;
	} catch (error) {
		console.log(error);
		return undefined;
	}

}

export const createInitCustomer = async (name: string) => {

	try {
		const idempotencyKey = crypto.randomUUID()
		const response = await customersApi.createCustomer({
			givenName: name,
			idempotencyKey,
		});

		console.log(response.result);
		return {
			customerId: response.result.customer?.id,
			customer: response.result.customer,
			idempotencyKey,
		}
	} catch (error) {
		console.log(error);
		return { customerId: "", customer: null, idempotencyKey: "", error: error };
	}

}

