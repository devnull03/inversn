<script lang="ts">
  import type { CatalogObject } from "square";
  import * as Card from "$lib/components/ui/card";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import { imageCache } from "$lib/stores.svelte";

  interface Props {
    productData: CatalogObject;
  }

  let { productData }: Props = $props();

  let itemBaseData = $derived(
    productData.itemData?.variations?.[0].itemVariationData
  );
  let itemImages = $derived(
    $imageCache.filter((img) =>
      productData.itemData?.imageIds?.includes(img.id)
    )
  );

  $inspect(itemImages, $imageCache, productData.itemVariationData?.imageIds);
</script>

<Card.Root
  class="flex flex-col justify-end min-w-[20vw] aspect-[0.8] hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer"
  onclick={() => console.log(productData)}
>
  <Card.Content class="p-1 h-full">
    <Carousel.Root class="h-full border rounded-lg group overflow-hidden">
      <Carousel.Content>
        {#each itemImages as imageObj}
          <Carousel.Item class="h-full aspect-[0.8] object-cover">
            <img
              src={imageObj?.imageData?.url}
              alt={productData.itemData?.name}
              class="h-full w-full object-cover"
            />
          </Carousel.Item>
        {/each}
      </Carousel.Content>

      <Carousel.Previous
        class="translate-x-14 group-hover:inline-flex hidden"
      />
      <Carousel.Next class="-translate-x-14 group-hover:inline-flex hidden" />
    </Carousel.Root>
  </Card.Content>

  <Card.Footer class="p-3 pt-0">
    <div class="text-xs max-w-[19vw] w-full whitespace-nowrap overflow-clip">
      <p class="">{productData.itemData?.name}</p>
      <p>
        <!-- ₹ -->
        RS. {itemBaseData?.priceMoney?.amount
          ? Number(itemBaseData?.priceMoney.amount) / 100
          : "N/A"}
      </p>
    </div>
  </Card.Footer>
</Card.Root>
