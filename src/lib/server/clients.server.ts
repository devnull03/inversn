import axios from "axios";
import { Client, Environment } from "square";
import { DELHIVERY_API_KEY, MODE, PROD_ACCESS_TOKEN, SANDBOX_ACCESS_TOKEN } from "$env/static/private";

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

export const delhiveryAPI = axios.create({
	baseURL: `https://${MODE === 'prod' ? 'track' : 'staging-express'}.delhivery.com`,
	headers: {
		"Content-Type": "application/json",
		"Authorization": `Token ${DELHIVERY_API_KEY}`
	}
})


