<script lang="ts">
  import { goto } from "$app/navigation";
  import { slide } from "svelte/transition";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { cartData, cartItems, cartOpen } from "$lib/stores.svelte";
  import { formatPrice } from "$lib/utils";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Button } from "$lib/components/ui/button";
  import Reload from "svelte-radix/Reload.svelte";

  let quantityUp = $state(true);

  const changeQuantity = (variationId: string, amount: number) => {
    const index = $cartItems.findIndex((i) => i.variationId === variationId);
    quantityUp = amount > 0;

    cartItems.update((val) => {
      if (
        val[index].quantity !== undefined &&
        val[index].quantity + amount > 0
      ) {
        val[index].quantity += amount;
      }
      return val;
    });
  };

  let checkoutLoading = $state(false);
</script>

<Sheet.Root bind:open={$cartOpen}>
  <Sheet.Content>
    <div class="h-full flex flex-col justify-between">
      <div>
        <Sheet.Header>
          <Sheet.Title
            >Cart <i class="fa-solid fa-cart-shopping"></i></Sheet.Title
          >
          <Sheet.Description>Items in your cart</Sheet.Description>
        </Sheet.Header>

        <ScrollArea class="w-full h-[80vh]">
          <div class="flex flex-col gap-4">
            {#each $cartItems as item}
              <div class="flex flex-col gap-4 border-b border-black last:border-none p-4">
                <h6 class="text-2xl">{item.item?.itemData?.name}</h6>
                <p>
                  {formatPrice(
                    item.variation?.itemVariationData?.priceMoney?.amount
                  )}
                </p>
                <p class="text-sm">
                  {item.variationId} <br />
                  {item.variation?.itemVariationData?.name}
                </p>

                <div class="flex gap-4 rounded border border-black p-2">
                  <button
                    onclick={() => changeQuantity(item.variationId, -1)}
                    class="">-</button
                  >
                  {#key item.quantity}
                    <span in:slide>{item.quantity}</span>
                  {/key}
                  <button
                    onclick={() => changeQuantity(item.variationId, 1)}
                    class="">+</button
                  >
                </div>
              </div>
            {/each}
          </div>
        </ScrollArea>
      </div>
      <div class="w-full border-t border-black pt-2 flex flex-col gap-4">
        <p class="flex justify-between w-full">
          <span>Total</span>
          <span>{formatPrice($cartData.orderObject?.totalMoney?.amount)}</span>
        </p>
        <Button
          class="w-full"
          disabled={Number($cartData.orderObject?.totalMoney?.amount) <= 0 ||
            checkoutLoading}
          onclick={() => {
            checkoutLoading = true;
            $cartOpen = false;
            goto(`/checkout/${$cartData.orderObject?.id}`);
            checkoutLoading = false;
          }}
        >
          {#if checkoutLoading}
            <Reload />
          {/if}
          Checkout
        </Button>
      </div>
    </div>
  </Sheet.Content>
</Sheet.Root>
