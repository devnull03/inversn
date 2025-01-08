<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { slide } from "svelte/transition";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { cartData, cartItems, cartOpen } from "$lib/stores.svelte";
  import { formatPrice } from "$lib/utils";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Button } from "$lib/components/ui/button";
  import Reload from "svelte-radix/Reload.svelte";
  import { applyAction, deserialize } from "$app/forms";
  import type { ActionResult } from "@sveltejs/kit";

  let checkoutLoading = $state(false);
  let cartUpdateLoading = $state(false);

  let actionVariationId = $state<string>();
  let actionQuantity = $state<number>();
  let actionLineItemUid = $state<string>();
  let actionIdx = $state<number>();
  let actionType = $state<"update" | "delete">();

  async function handleSubmit(
    event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
  ) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    cartUpdateLoading = true;

    const response = await fetch(event.currentTarget.action, {
      method: "POST",
      body: data,
    });

    const result: ActionResult = deserialize(await response.text());

    if (result.type === "success") {
      await invalidateAll();

      if (actionType === "update" && actionIdx !== undefined) {
        $cartItems[actionIdx].quantity = actionQuantity?.toString() as string;
      } else if (actionType === "delete") {
        cartItems.update((val) => {
          actionIdx !== undefined && val.splice(actionIdx, 1);
          return val;
        });
      }
    }

    actionVariationId = undefined;
    actionQuantity = undefined;
    actionLineItemUid = undefined;
    actionIdx = undefined;
    actionType = undefined;

    cartUpdateLoading = false;

    console.log("cart drawer action:", result);
    // applyAction(result);
  }
</script>

<Sheet.Root bind:open={$cartOpen}>
  <Sheet.Content>
    <div class="h-full flex flex-col justify-between">
      <div class="h-full">
        <Sheet.Header>
          <Sheet.Title
            >Cart <i class="fa-solid fa-cart-shopping"></i></Sheet.Title
          >
          <Sheet.Description>Items in your cart</Sheet.Description>
        </Sheet.Header>

        <ScrollArea class="w-full h-full">
          <form
            class="flex flex-col gap-4"
            action="/cart?/update"
            method="POST"
            onsubmit={handleSubmit}
          >
            <input
              type="hidden"
              name="variationId"
              bind:value={actionVariationId}
            />
            <input type="hidden" name="quantity" bind:value={actionQuantity} />
            <input
              type="hidden"
              name="lineItemUid"
              bind:value={actionLineItemUid}
            />
            <input type="hidden" name="type" bind:value={actionType} />
            <input type="hidden" name="idx" bind:value={actionIdx} />

            {#each $cartItems as item, idx (item.uid)}
              <div
                class="flex flex-col gap-4 border-b border-black last:border-none p-4"
              >
                <h6 class="text-2xl">{item.name}</h6>
                <p>
                  {#if cartUpdateLoading && actionIdx === idx}
                    <Reload class="h-4 w-4 animate-spin" />
                  {:else}
                    {formatPrice(item.totalMoney?.amount)}
                  {/if}
                </p>
                <p class="text-sm">
                  {item.uid} <br />
                  {item.catalogObjectId} <br />
                  {item.variationName}
                </p>

                <div class="flex gap-4 items-center">
                  {#if item.quantity}
                    <div class="flex gap-4 rounded border border-black p-2">
                      <button
                        type="submit"
                        onclick={() => {
                          if (!item.quantity) return;
                          actionLineItemUid = item.uid as string | undefined;
                          actionQuantity = Number(item.quantity) - 1;
                          actionVariationId = item.catalogObjectId as
                            | string
                            | undefined;
                          actionIdx = idx;
                          actionType = "update";
                        }}
                        class="">-</button
                      >
                      {#key item.quantity}
                        <span in:slide>{item.quantity}</span>
                      {/key}
                      <button
                        type="submit"
                        onclick={() => {
                          if (!item.quantity) return;
                          actionLineItemUid = item.uid as string | undefined;
                          actionQuantity = Number(item.quantity) + 1;
                          actionVariationId = item.catalogObjectId as
                            | string
                            | undefined;
                          actionIdx = idx;
                          actionType = "update";
                        }}
                        class="">+</button
                      >
                    </div>
                  {/if}
                  <button
                    type="submit"
                    class="fa-solid fa-trash hover:text-red-400 transition-colors duration-200 ease-in-out"
                    aria-label="Delete item"
                    onclick={() => {
                      actionLineItemUid = item.uid as string | undefined;
                      actionVariationId = item.catalogObjectId as
                        | string
                        | undefined;
                      actionIdx = idx;
                      actionType = "delete";
                    }}
                  ></button>
                </div>
              </div>
            {/each}
          </form>
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
