import { delhiveryAPI } from "$lib/server/clients.server";

export const checkPincodeServiceability = async (pincode: string) => {
	let url = `/c/api/pin-codes/json/`
	let response = await delhiveryAPI.get(url, {
		params: {
			filter_codes: pincode
		}
	})
}

export type ShipmentCostParams = {
	md: string, // Mode of payment
	cgm: number, // Weight in grams
	o_pin: string, // Origin pincode
	d_pin: string, // Destination pincode
	ss: "Delivered" | "RTO" | "DTO", // Status of shipment
	pt: "Pre-paid" | "COD",
}
export const calculateShippingCost = async () => {
	let url = "https://track.delhivery.com/api/kinko/v1/invoice/charges/.json"
}

export const createDehliveryOneShipment = async () => {

	let url = `/api/cmu/create.json`

}

export const getTrackingDetails = async () => { }

export const cancelShipment = async () => { }
