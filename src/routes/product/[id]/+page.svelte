<script lang="ts">
  import { enhance } from "$app/forms";
  import { Button } from "$lib/components/ui/button";
  import {
    cartData,
    cartItems,
    cartOpen,
    imageCache,
  } from "$lib/stores.svelte";
  import { formatPrice } from "$lib/utils";
  import { onMount, untrack } from "svelte";
  import type { ActionData, PageData, PageServerData } from "./$types";

  let { data, form }: { data: PageServerData; form: ActionData } = $props();

  let itemBaseData = $derived(
    data.product?.itemData?.variations?.[0].itemVariationData
  );
  let itemImages = $derived(
    data.productImages?.filter((img) =>
      data.product?.itemData?.imageIds?.includes(img.id)
    ) || []
  );

  let selectedVariation = $state(data.product?.itemData?.variations?.[0]);
  // let selectedVariationId = $derived(selectedVariation?.id);
  let itemInCart = $derived(
    $cartItems.find((item) => item.variationId === selectedVariation?.id)
  );

  // $inspect(data);

  $effect(() => {
    console.log(form);
    if (form) {
      if (!untrack(() => $cartData.orderId))
        cartData.update((val) => {
          val.orderId = form.orderId;
          val.orderVersion = form.orderVersion;
          val.orderObject = form.order;
          return val;
        });

      cartItems.update((val) => {
        val.push({
          item: data.product,
          variation: selectedVariation,
          variationId: form.variationId,
          quantity: 1,
        });
        return val;
      });
    }
  });

  onMount(() => {});
</script>

{#snippet actionButton(buyNow: boolean)}
  <form use:enhance method="POST">
    <input type="hidden" name="variationId" value={selectedVariation?.id} />
    <input type="hidden" name="orderId" value={$cartData?.orderId} />
    <input type="hidden" name="orderVersion" value={$cartData?.orderVersion} />
    {#if buyNow}
      <input type="hidden" name="buyNow" value="true" />
    {/if}
    <Button class="w-full" type="submit"
      >{buyNow ? "Buy Now" : "Add to cart"}</Button
    >
  </form>
{/snippet}

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
        {#if itemInCart}
          <Button
            class="w-full"
            on:click={() => {
              $cartOpen = true;
            }}>View Cart</Button
          >
        {:else}
          {@render actionButton(true)}
          {@render actionButton(false)}
        {/if}
      </div>
    </div>
  </section>
</main>
