<script lang="ts">
  import { onMount } from "svelte";
  import type { LayoutServerData } from "./$types";
  import ProductCard from "$lib/components/ProductCard.svelte";

  let initScroll = $state(0);

  let { data }: { data: LayoutServerData } = $props();

  let productImages = $derived(
    data.landingPageItems?.relatedObjects?.filter(
      (item) => item.type === "IMAGE"
    )
  );

  onMount(() => {});
</script>

<svelte:window bind:scrollY={initScroll} />

<main class="flex flex-col w-screen items-center gap-16 lg:gap-8 pb-48 p-4">
  <section class="grid grid-cols-4 w-full gap-2">
    {#each data.landingPageItems?.objects || [] as item}
      <ProductCard
        productData={item}
        productImages={productImages?.filter((img) =>
          item.itemData?.imageIds?.includes(img.id)
        ) || []}
      />
    {/each}
  </section>
</main>
