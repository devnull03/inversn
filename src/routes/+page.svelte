<script lang="ts">
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import Button from "$lib/components/ui/button/button.svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import * as Card from "$lib/components/ui/card";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import {
    categoryItemsCache,
    isMobile,
    scrollThreshold,
  } from "$lib/stores.svelte";
  import ProductCard from "$lib/components/ProductCard.svelte";

  let initScroll = $state(0);

  let { data } = $props();
  $inspect(data);

  onMount(() => {});
</script>

<svelte:window bind:scrollY={initScroll} />

<main class="flex flex-col w-screen items-center gap-16 lg:gap-8 pb-48 p-4">
  <section class="grid grid-cols-4 w-full gap-2">
    {#each data.landingPageItems as item}
      {#if item}
        <ProductCard productData={item} />
      {/if}
    {/each}
  </section>
</main>
