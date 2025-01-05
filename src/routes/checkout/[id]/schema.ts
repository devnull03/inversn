import { z } from "zod";

export enum IndianStates {
    AP = "Andhra Pradesh",
    AR = "Arunachal Pradesh",
    AS = "Assam",
    BR = "Bihar",
    CG = "Chhattisgarh",
    GA = "Goa",
    GJ = "Gujarat",
    HR = "Haryana",
    HP = "Himachal Pradesh",
    JH = "Jharkhand",
    KA = "Karnataka",
    KL = "Kerala",
    MP = "Madhya Pradesh",
    MH = "Maharashtra",
    MN = "Manipur",
    ML = "Meghalaya",
    MZ = "Mizoram",
    NL = "Nagaland",
    OR = "Odisha",
    PB = "Punjab",
    RJ = "Rajasthan",
    SK = "Sikkim",
    TN = "Tamil Nadu",
    TS = "Telangana",
    TR = "Tripura",
    UP = "Uttar Pradesh",
    UK = "Uttarakhand",
    WB = "West Bengal",

    // Union Territories
    AN = "Andaman and Nicobar Islands",
    CH = "Chandigarh",
    DH = "Dadra and Nagar Haveli and Daman and Diu",
    DL = "Delhi",
    JK = "Jammu and Kashmir",
    LA = "Ladakh",
    LD = "Lakshadweep",
    PY = "Puducherry"
}

export const formSchema = z.object({
	// Contact Information
	email: z.string().email(),
	emailOffers: z.boolean().default(true),

	// Shipping Information
	country: z.literal("India"),
	firstName: z.string(),
	lastName: z.string().optional(),
	address1: z.string(),
	address2: z.string().optional(),
	city: z.string(),
	state: z.nativeEnum(IndianStates),
	postalCode: z.string(),
	phoneCountryCode: z.literal("+91"),
	phone: z.string().min(10).max(10),
	saveInfo: z.boolean().default(false),

	// Payment Information
	paymentMethod: z.enum(["PayU", "COD"]),
	billingAddressSame: z.boolean().default(true),
	discountCode: z.string().optional(),

	// optional billing address if billingAddressSame is false
	billingFirstName: z.string().optional(),
	billingLastName: z.string().optional(),
	billingAddress1: z.string().optional(),
	billingAddress2: z.string().optional(),
	billingCity: z.string().optional(),
	billingState: z.nativeEnum(IndianStates).optional(),
	billingPostalCode: z.string().optional(),
	billingCountry: z.string().optional(),
	billingPhoneCountryCode: z.literal("+91").optional(),
	billingPhone: z.string().min(10).max(10).optional(),
}).refine(data => {
	if (!data.billingAddressSame) {
		return data.billingFirstName && data.billingLastName && data.billingAddress1 && data.billingCity && data.billingState && data.billingPostalCode && data.billingCountry && data.billingPhone && data.billingPhoneCountryCode;
	}
	return true;
});

export type FormSchema = typeof formSchema;