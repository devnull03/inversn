<script>
  import { page } from "$app/stores";
  import Faq from "$lib/pages/faq.svelte";
  import Terms from "$lib/pages/terms.svelte";
</script>

{#if $page.params.id === "faq"}
  <Faq />
{:else if $page.params.id === "terms-and-conditions"}
  <Terms />
{:else}
  <div class="flex items-center justify-center w-full h-full">NOT FOUND</div>
{/if}
