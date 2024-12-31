import { MODE, PROD_ACCESS_TOKEN, SANDBOX_ACCESS_TOKEN } from "$env/static/private";
import { Client, Environment } from "square";


const config = {
	accessToken: MODE !== "prod" ? SANDBOX_ACCESS_TOKEN : PROD_ACCESS_TOKEN,
	environment: MODE !== "prod" ? Environment.Sandbox : Environment.Production,
	userAgentDetail: "online_store_inversn"
}

export const {
	catalogApi,
	ordersApi,
	orderCustomAttributesApi,
	paymentsApi,
	customersApi,
} = new Client(config);
