<script lang="ts">
  import type { PageData, ActionData } from "./$types";

  let { data, form }: {data: PageData, form: ActionData} = $props();

  $inspect(form)

</script>


<main class="w-screen h-[80vh] flex items-center justify-center">
	
	{form?.message}

  {#if form?.body}
    <section>
      <h2>Transaction Information</h2>
      <p>Transaction ID: {form.body.transactionData?.txnid}</p>
      <p>Amount: {form.body.transactionData?.amount}</p>
    </section>

    <section>
      <h2>Order Details</h2>
      <p>Order ID: {form.body.order?.id}</p>
      {#each form.body.order?.lineItems || [] as item}
        <p>{item.name} x {item.quantity}</p>
      {/each}
    </section>
  {/if}

</main>
