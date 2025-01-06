import type { CatalogObject, Customer, Order } from "square";
import { writable } from "svelte/store";
import type { CartItem } from "$lib/models";

export const isMobile = writable(false);
export const scrollThreshold = writable<number>(10);

export const categoriesCache = writable<CatalogObject[]>([]);
export const categoryItemsCache = writable<{
	[categoryId: string]: string[]
}>({});

export const cartOpen = writable(false);
export const cartItems = writable<CartItem[]>([]);
export const cartData = writable<{
	orderId?: string;
	orderVersion?: number;
	orderObject?: Order;
}>({});

export const customerData = writable<{
	customerId?: string;
	customerObject?: Customer;
}>({});
