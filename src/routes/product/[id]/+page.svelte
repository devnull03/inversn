<script lang="ts">
  import { enhance } from "$app/forms";
  import { Button } from "$lib/components/ui/button";
  import * as Select from "$lib/components/ui/select";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { cartData, cartItems, cartOpen } from "$lib/stores.svelte";
  import { formatPrice } from "$lib/utils";
  import { onMount, untrack } from "svelte";
  import type { ActionData, PageServerData } from "./$types";
  import type { CatalogObject } from "square";
  import Reload from "svelte-radix/Reload.svelte";

  let { data, form }: { data: PageServerData; form: ActionData } = $props();

  let itemBaseData = $derived(
    data.product?.itemData?.variations?.[0].itemVariationData
  );
  let itemImages = $derived(
    data.productImages?.filter((img) =>
      data.product?.itemData?.imageIds?.includes(img.id)
    ) || []
  );

  let selectedVariation = $state<CatalogObject | undefined>();
  // let selectedVariationId = $derived(selectedVariation?.id);
  let itemInCart = $derived(
    $cartItems.find((item) => item.catalogObjectId === selectedVariation?.id)
  );

  let formLoading = $state(false);

  $inspect(data, $cartItems);

  $effect(() => {
    if (form) {
      cartData.update((val) => {
        val.orderId = form.orderId;
        val.orderVersion =
          typeof form.orderVersion === "string"
            ? parseInt(form.orderVersion)
            : form.orderVersion;
        val.orderObject = form.order;
        return val;
      });

      cartItems.update((val) => {
        val.push({
          ...form?.lineItem,
          catalogObject: data?.product,
          image: itemImages[0],
          quantity: form?.lineItem?.quantity as string,
        });
        return val;
      });

      untrack(() => {
        formLoading = false;
        $cartOpen = true;
      });
    }
  });

  onMount(() => {});
</script>

{#snippet actionButton(buyNow: boolean)}
  <form
    use:enhance={() => {
      formLoading = true;
      return async ({ update }) => {
        update();
      };
    }}
    method="POST"
  >
    <input type="hidden" name="variationId" value={selectedVariation?.id} />
    {#if buyNow}
      <input type="hidden" name="buyNow" value="true" />
    {/if}

    <Tooltip.Root openDelay={200}>
      <Tooltip.Trigger>
        <Button
          class="w-full"
          type="submit"
          disabled={!selectedVariation || formLoading}
        >
          {#if formLoading}
            <Reload class="mr-2 h-4 w-4 animate-spin" />
          {/if}
          {buyNow ? "Buy Now" : "Add to cart"}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content side="bottom">
        {#if selectedVariation}
          {buyNow ? "Proceed to checkout" : "Add this item to your cart"}
        {:else}
          Select a size
        {/if}
      </Tooltip.Content>
    </Tooltip.Root>
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
    <div class="p-4 flex flex-col gap-4">
      <h1 class="text-3xl">{data.product?.itemData?.name}</h1>

      <p>{formatPrice(itemBaseData?.priceMoney?.amount)}</p>

      <Select.Root>
        <Select.Trigger class="w-[180px]">
          <Select.Value placeholder="Size" />
        </Select.Trigger>
        <Select.Content>
          {#each data.product?.itemData?.variations || [] as variation}
            <Select.Item
              value={variation.id}
              on:click={() => {
                selectedVariation = variation;
              }}
            >
              {variation.itemVariationData?.name}
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>

      <div class="flex gap-4">
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
