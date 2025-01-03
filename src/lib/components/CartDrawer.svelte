<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { cartItems, cartOpen } from "$lib/stores.svelte";
  import { fade, fly, slide } from "svelte/transition";

  let quantityUp = $state(true);

  const changeQuantity = (variationId: string, amount: number) => {
    const index = $cartItems.findIndex((i) => i.variationId === variationId);
    quantityUp = amount > 0;

    cartItems.update((val) => {
      if (val[index].quantity !== undefined && val[index].quantity + amount > 0) {
        val[index].quantity += amount;
      }
      return val;
    });
  };
</script>

<Sheet.Root bind:open={$cartOpen}>
  <Sheet.Content>
    <Sheet.Header>
      <Sheet.Title>Cart <i class="fa-solid fa-cart-shopping"></i></Sheet.Title>
      <Sheet.Description>Items in your cart</Sheet.Description>

      <div class="flex flex-col gap-4">
        {#each $cartItems as item}
          <div class="flex flex-col gap-4 border-b border-black p-4">
            <h6 class="text-xl">{item.item?.itemData?.name}</h6>
            <p class="text-sm">{item.variation?.itemOptionData?.values}</p>

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
    </Sheet.Header>
  </Sheet.Content>
</Sheet.Root>
