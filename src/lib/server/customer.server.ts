import type { FormData } from "$lib/components/form";
import { customersApi } from "$lib/server/clients.server";


export const getCustomer = async (customerId: string) => {

	try {
		const response = await customersApi.retrieveCustomer(customerId);
		return {
			customerId: response.result.customer?.id,
			customer: response.result.customer,
		};
	} catch (error) {
		console.log(error);
		return { error };
	}

}

export const createCustomer = async (formData: FormData) => {
	try {
		const idempotencyKey = crypto.randomUUID()
		const response = await customersApi.createCustomer({
			idempotencyKey,
			givenName: formData.firstName,
			familyName: formData.lastName,
			emailAddress: formData.email,
			address: {
				addressLine1: formData.address1,
				addressLine2: formData.address2,
				locality: formData.city,
				administrativeDistrictLevel1: formData.state,
				postalCode: formData.postalCode,
				country: 'IN',
			},
			phoneNumber: `${formData.phoneCountryCode} ${formData.phone}`,
		});

		console.log(response.result);
		return {
			customerId: response.result.customer?.id,
			customer: response.result.customer,
			idempotencyKey,
		}
	} catch (error) {
		console.log(error);
		return { error };
	}
}

export const updateCustomer = async (customerId: string, formData: FormData) => {
	// TODO: Implement update customer
}
