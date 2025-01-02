<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { imageCache } from "$lib/stores.svelte";
  import { formatPrice } from "$lib/utils";
  import type { PageData, PageServerData } from "./$types";

  let { data }: { data: PageServerData } = $props();

  let itemBaseData = $derived(
    data.product?.itemData?.variations?.[0].itemVariationData
  );
  let itemImages = $derived(
    data.productImages?.filter((img) =>
      data.product?.itemData?.imageIds?.includes(img.id)
    ) || []
  );
</script>

<main class="flex w-screen h-screen *:w-1/2">
  <section class="overflow-scroll pb-40 flex flex-col gap-4">
    {#each itemImages as imageObj}
      <img
        src={imageObj?.imageData?.url}
        alt={data.product?.itemData?.name}
        class=" aspect-[0.8] object-cover"
      />
    {/each}
  </section>

  <section class="">
    <div class="p-4">
      <h1 class="text-3xl">{data.product?.itemData?.name}</h1>

      <p>{formatPrice(itemBaseData?.priceMoney?.amount)}</p>

      <div class="flex w-full justify-evenly">
        <Button>Buy now</Button>
        <Button>Add to Cart</Button>
      </div>
    </div>
  </section>
</main>
