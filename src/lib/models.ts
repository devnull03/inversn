import type { CatalogItemVariation, CatalogObject } from "square";


export type CartItem = {
	item?: CatalogObject;
	image?: CatalogObject;
	variation?: CatalogObject;
	variationId: string;
	quantity?: number;
}
