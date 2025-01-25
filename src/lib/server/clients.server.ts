import axios from "axios";
import { Client, Environment } from "square";
import { CATALOG_MODE, DELHIVERY_API_KEY, MODE, PROD_ACCESS_TOKEN, RESEND_API_KEY, SANDBOX_ACCESS_TOKEN } from "$env/static/private";
import { Resend } from "resend";

const config = {
	accessToken: CATALOG_MODE !== "prod" ? SANDBOX_ACCESS_TOKEN : PROD_ACCESS_TOKEN,
	environment: CATALOG_MODE !== "prod" ? Environment.Sandbox : Environment.Production,
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

export const resend = new Resend(RESEND_API_KEY);

