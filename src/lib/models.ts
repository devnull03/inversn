import type { CatalogItemVariation, CatalogObject, OrderLineItem } from "square";


// export type CartItem = {
// 	uid?: string;
// 	item?: CatalogObject;
// 	image?: CatalogObject;
// 	variation?: CatalogObject;
// 	variationId: string;
// 	quantity?: number;
// }

export type CartItem = OrderLineItem & {
	catalogObject?: CatalogObject;
	images?: CatalogObject;
} 
