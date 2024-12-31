import type { CatalogItem, CatalogObject, CatalogObjectCategory } from "square";
import { writable } from "svelte/store";

export const isMobile = writable(false);
export const scrollThreshold = writable<number>(10);

export const categoriesCache = writable<CatalogObjectCategory[]>([]);
export const categoryItemsCache = writable<{
	[categoryId: string]: CatalogObject[]
}>({});

export const cartOpen = writable(false);
export const cartItems = writable<any[]>([]);
