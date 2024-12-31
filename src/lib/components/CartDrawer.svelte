<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { cartOpen } from "$lib/stores.svelte";
</script>

<Sheet.Root bind:open={$cartOpen}>
  <Sheet.Content>
    <Sheet.Header>
      <Sheet.Title>Cart <i class="fa-solid fa-cart-shopping"></i></Sheet.Title>
      <Sheet.Description>Items in your cart</Sheet.Description>

      <!-- TODO: cart components -->
    </Sheet.Header>
  </Sheet.Content>
</Sheet.Root>
