import axios from "axios";
import { Client, Environment } from "square";
// import { Payu } from "payu-sdk";
import { MODE, PROD_ACCESS_TOKEN, PROD_PAYU_KEY, PROD_PAYU_SALT, SANDBOX_ACCESS_TOKEN, SANDBOX_PAYU_KEY, SANDBOX_PAYU_SALT } from "$env/static/private";

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
		"Authorization": `Token ${process.env.DELHIVERY_API_KEY}`
	}
})

export const payu = require('payu-sdk')({
	key: MODE === 'prod' ? PROD_PAYU_KEY : SANDBOX_PAYU_KEY,
	salt: MODE === 'prod' ? PROD_PAYU_SALT : SANDBOX_PAYU_SALT,
});
