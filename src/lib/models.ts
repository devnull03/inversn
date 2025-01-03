import type { CatalogItemVariation, CatalogObject } from "square";


export type CartItem = {
	item?: CatalogObject;
	variation?: CatalogObject;
	variationId: string;
	quantity?: number;
}
