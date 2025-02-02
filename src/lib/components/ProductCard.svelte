<script lang="ts">
  import type { CatalogObject } from "square";
  import * as Card from "$lib/components/ui/card";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { formatPrice } from "$lib/utils";

  interface Props {
    productData: CatalogObject;
    productImages: CatalogObject[];
  }

  let { productData, productImages }: Props = $props();

  let itemBaseData = $derived(
    productData.itemData?.variations?.[0].itemVariationData
  );
</script>

<!-- for both seo and performance -->
<div
  class="flex flex-col justify-end min-w-[20vw] aspect-[0.8] hover:shadow transition-all duration-300 ease-in-out cursor-pointer border"
>
  <div class="h-full">
    <Carousel.Root class="h-full group overflow-hidden">
      <Carousel.Content>
        {#each productImages as imageObj}
          <Carousel.Item
            class="h-full aspect-[0.8] object-cover"
            onclick={() => goto(`/product/${productData.id}`)}
          >
            <img
              src={imageObj?.imageData?.url}
              alt={productData.itemData?.name}
              class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
            />
          </Carousel.Item>
        {/each}
      </Carousel.Content>

      {#if productImages.length > 1}
        <Carousel.Previous
          class="translate-x-14 group-hover:inline-flex hidden"
        />
        <Carousel.Next class="-translate-x-14 group-hover:inline-flex hidden" />
      {/if}
    </Carousel.Root>

  </div>

  <div class="p-3">
    <a
      href={`${page.url.origin}/product/${productData.id}`}
      onclick={(e) => {
        e.preventDefault();
        goto(`/product/${productData.id}`);
      }}
    >
      <div class="flex justify-between font-light w-full whitespace-nowrap overflow-clip">
        <p class="">{productData.itemData?.name}</p>
        <p>
          {formatPrice(itemBaseData?.priceMoney)}
        </p>
      </div>
    </a>
  </div>
</div>
