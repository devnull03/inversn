<script lang="ts">
  import SuperDebug, { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import * as Form from "$lib/components/ui/form";
  import {
    formSchema,
    FormInput,
    FormCheckbox,
    FormSelect,
    IndianStates,
  } from "$lib/components/form";
  import { toast } from "svelte-sonner";
  import { Reload } from "svelte-radix";
  import { cartData, cartItems } from "$lib/stores.svelte";
  import { formatPrice } from "$lib/utils.js";

  let { data, form: rawFormResponse } = $props();
  let formLoading = $state(false);

  const form = superForm(data.form, {
    validators: zodClient(formSchema),
    onUpdated: ({ form: f }) => {
      if (f.valid) {
        toast.success(`form processed`, {
          duration: 5000,
        });

        console.log("payment data", rawFormResponse?.redirectUrl);

        // goto(rawFormResponse?.redirectUrl);
        window.location.href = rawFormResponse?.redirectUrl;
      } else {
        toast.error("Please fix the errors in the form.");
      }
      formLoading = false;
    },
    onSubmit: async (event) => {
      console.log("Submitting form", event);
      formLoading = true;
    },
    onError(event) {
      formLoading = false;
      toast.error(
        `(${event.result.status}: ${event.result.type}) ${event.result.error.message}`
      );
    },
  });

  const { form: formData, enhance, allErrors } = form;
  $effect(() => {
    if ($allErrors.length) formLoading = false;
  });
</script>

<form
  method="POST"
  use:enhance
  class="bg-white w-full *:pt-8 flex flex-col-reverse md:flex-row *:md:px-[calc(0.5*(100vw-40rem-30rem)-0.5px)] h-[calc(100vh-6rem)] overflow-y-auto"
>
  <section
    class="border-r border-gray-300 flex justify-end md:!pr-0"
  >
    <div class="w-[40rem] flex flex-col gap-4 px-6">
      <div>
        <h3>Contact</h3>

        <FormInput
          bind:formDataField={$formData.email}
          {form}
          name="email"
          label="Email"
        />

        <FormCheckbox
          bind:formDataField={$formData.emailOffers}
          {form}
          name="emailOffers"
          label="Email me with news and offers"
        />
      </div>

      <div class="grid grid-cols-6 gap-4 *:col-span-6">
        <h3 class="">Delhivery</h3>

        <FormSelect
          bind:formDataField={$formData.country}
          {form}
          name="country"
          label="Country"
          options={["India"]}
          description="We only deliver to India"
        />

        <FormInput
          bind:formDataField={$formData.firstName}
          {form}
          required
          name="firstName"
          label="First name"
          class="!col-span-3"
        />

        <FormInput
          bind:formDataField={$formData.lastName}
          {form}
          name="lastName"
          label="Last name"
          class="!col-span-3"
        />

        <FormInput
          bind:formDataField={$formData.address1}
          {form}
          required
          name="address1"
          label="Address 1"
        />

        <FormInput
          bind:formDataField={$formData.address2}
          {form}
          name="address2"
          label="Address 2"
        />

        <FormInput
          bind:formDataField={$formData.city}
          {form}
          required
          name="city"
          label="City"
          class="!col-span-2"
        />

        <FormSelect
          bind:formDataField={$formData.state}
          {form}
          required
          name="state"
          label="State"
          options={Object.values(IndianStates)}
          class="!col-span-2"
        />

        <FormInput
          bind:formDataField={$formData.postalCode}
          {form}
          required
          name="postalCode"
          label="Pincode"
          class="!col-span-2"
        />

        <FormSelect
          bind:formDataField={$formData.phoneCountryCode}
          {form}
          name="phoneCountryCode"
          label="Country code"
          options={["+91"]}
          class="!col-span-1"
        />

        <FormInput
          bind:formDataField={$formData.phone}
          {form}
          name="phone"
          label="Phone"
          class="!col-span-5"
        />

        <FormCheckbox
          bind:formDataField={$formData.saveInfo}
          {form}
          name="saveInfo"
          label="Save this address for future purchases"
        />

        <FormCheckbox
          bind:formDataField={$formData.billingAddressSame}
          {form}
          name="billingAddressSame"
          label="Same as billing address"
        />

        <div
          class:h-0={$formData.billingAddressSame}
          class="transition-all duration-300 ease-in-out overflow-hidden"
        >
          <h3>Billing</h3>
          <div class="grid grid-cols-6 gap-4 *:col-span-6">
            <!-- Billing Country -->
            <FormSelect
              bind:formDataField={$formData.billingCountry}
              {form}
              name="billingCountry"
              label="Country"
              options={["India"]}
              description="We only deliver to India"
            />
            <!-- First and Last name -->
            <FormInput
              bind:formDataField={$formData.billingFirstName}
              {form}
              name="billingFirstName"
              label="First name"
              class="!col-span-3"
            />
            <FormInput
              bind:formDataField={$formData.billingLastName}
              {form}
              name="billingLastName"
              label="Last name"
              class="!col-span-3"
            />
            <!-- Addresses -->
            <FormInput
              bind:formDataField={$formData.billingAddress1}
              {form}
              name="billingAddress1"
              label="Address 1"
              class="col-span-6"
            />
            <FormInput
              bind:formDataField={$formData.billingAddress2}
              {form}
              name="billingAddress2"
              label="Address 2"
              class="col-span-6"
            />
            <!-- City, State, Pincode -->
            <FormInput
              bind:formDataField={$formData.billingCity}
              {form}
              name="billingCity"
              label="City"
              class="!col-span-2"
            />
            <FormSelect
              bind:formDataField={$formData.billingState}
              {form}
              name="billingState"
              label="State"
              options={Object.values(IndianStates)}
              class="!col-span-2"
            />
            <FormInput
              bind:formDataField={$formData.billingPostalCode}
              {form}
              name="billingPostalCode"
              label="Pincode"
              class="!col-span-2"
            />
            <!-- Phone: Country code and Phone -->
            <FormSelect
              bind:formDataField={$formData.billingPhoneCountryCode}
              {form}
              name="billingPhoneCountryCode"
              label="Country code"
              options={["+91"]}
              class="!col-span-1"
            />
            <FormInput
              bind:formDataField={$formData.billingPhone}
              {form}
              name="billingPhone"
              label="Phone"
              class="!col-span-5"
            />
          </div>
        </div>
      </div>

      <div>
        <h3>Shipping method</h3>

        <div>
        </div>

      </div>

      <Form.Button bind:disabled={formLoading} type="submit">
        {#if formLoading}
          <Reload class="h-4 w-4 animate-spin" />
        {/if}
        Pay now
      </Form.Button>

      <div class="py-16"></div>
    </div>
  </section>

  <section class="bg-gray-100 flex justify-start md:!pl-0 sticky top-0">
    <div class="md:w-[30rem] px-6 flex flex-col gap-4">
      <!-- Shopping Cart Table -->
      <div role="table" class="w-full flex flex-col gap-4 text-sm">
        {#each $cartItems as item}
          {@const image_url = item.images?.imageData?.url}
          <div role="row" class="flex items-center gap-4">
            <div
              role="cell"
              class="w-16 h-16 bg-gray-100 aspect-square relative rounded-lg"
            >
              {#if image_url}
                <img
                  src={image_url}
                  alt={item.name}
                  class="w-16 h-16 object-cover aspect-square rounded-lg border border-gray-300"
                />
              {/if}
              <span
                class="rounded-full w-5 h-5 text-center aspect-square absolute -right-3 -top-3 bg-gray-600 text-white"
              >
                {item.quantity}
              </span>
            </div>

            <div role="cell" class="w-full flex justify-between items-center">
              <p class="font-medium">{item.name}</p>
              <span>{formatPrice(item.basePriceMoney)}</span>
            </div>
          </div>
        {/each}
      </div>
      <FormInput
        bind:formDataField={$formData.discountCode}
        {form}
        name="discountCode"
        label="Discount code"
      />
      <!-- Cost Summary -->
      <div class="flex flex-col gap-2">
        <div class="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice($cartData.orderObject?.totalMoney)}</span>
        </div>
        <div class="flex justify-between">
          <span>Shipping</span>
          <span class="text-gray-500">Enter shipping address</span>
        </div>
        <div class="flex justify-between border-t pt-2 mt-2">
          <span class="font-bold">Total</span>
          <span class="font-bold"
            >{formatPrice($cartData.orderObject?.netAmountDueMoney)}</span
          >
        </div>
        <div class="text-sm text-gray-500 mt-1">
          <em>Including taxes</em>
        </div>
      </div>
    </div>
  </section>
</form>

<style type="postcss">
  form div h3 {
    @apply text-xl;
  }
</style>
