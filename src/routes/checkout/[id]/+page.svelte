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

  let { data, form: rawFormResponse } = $props();
  let formLoading = $state(false);

  const form = superForm(data.form, {
    validators: zodClient(formSchema),
    onUpdated: ({ form: f }) => {
      if (f.valid) {
        toast.success(`form processed`, {
          duration: 5000,
        });

        console.log("payment data", rawFormResponse);

        formLoading = false;
        window.location.href = rawFormResponse?.redirectUrl;

      } else {
        toast.error("Please fix the errors in the form.");
      }
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

  // $inspect($allErrors);
</script>

<form method="POST" use:enhance class="w-full *:p-16 flex">
  <section class="w-[56%] pr-4 border-r border-primary h-full">
    <div class="flex flex-col gap-8">
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

      <div class="">
        <h3>Delhivery</h3>

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
          name="firstName"
          label="First name"
        />

        <FormInput
          bind:formDataField={$formData.lastName}
          {form}
          name="lastName"
          label="Last name"
        />

        <FormInput
          bind:formDataField={$formData.address1}
          {form}
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
          name="city"
          label="City"
        />

        <FormSelect
          bind:formDataField={$formData.state}
          {form}
          name="state"
          label="State"
          options={Object.values(IndianStates)}
        />

        <FormInput
          bind:formDataField={$formData.postalCode}
          {form}
          name="postalCode"
          label="Pincode"
        />

        <div>
          <FormInput
            bind:formDataField={$formData.phone}
            {form}
            name="phone"
            label="Phone"
          />

          <FormSelect
            bind:formDataField={$formData.phoneCountryCode}
            {form}
            name="phoneCountryCode"
            label="Country code"
            options={["+91"]}
          />
        </div>

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

          <FormSelect
            bind:formDataField={$formData.billingCountry}
            {form}
            name="billingCountry"
            label="Country"
            options={["India"]}
            description="We only deliver to India"
          />

          <FormInput
            bind:formDataField={$formData.billingFirstName}
            {form}
            name="billingFirstName"
            label="First name"
          />

          <FormInput
            bind:formDataField={$formData.billingLastName}
            {form}
            name="billingLastName"
            label="Last name"
          />

          <FormInput
            bind:formDataField={$formData.billingAddress1}
            {form}
            name="billingAddress1"
            label="Address 1"
          />

          <FormInput
            bind:formDataField={$formData.billingAddress2}
            {form}
            name="billingAddress2"
            label="Address 2"
          />

          <FormInput
            bind:formDataField={$formData.billingCity}
            {form}
            name="billingCity"
            label="City"
          />

          <FormSelect
            bind:formDataField={$formData.billingState}
            {form}
            name="billingState"
            label="State"
            options={Object.values(IndianStates)}
          />

          <FormInput
            bind:formDataField={$formData.billingPostalCode}
            {form}
            name="billingPostalCode"
            label="Pincode"
          />

          <div>
            <FormInput
              bind:formDataField={$formData.billingPhone}
              {form}
              name="billingPhone"
              label="Phone"
            />

            <FormSelect
              bind:formDataField={$formData.billingPhoneCountryCode}
              {form}
              name="billingPhoneCountryCode"
              label="Country code"
              options={["+91"]}
            />
          </div>
        </div>
      </div>

      <Form.Button type="submit">Pay now</Form.Button>
    </div>
  </section>

  <section class="w-[44%] pl-4">
    <FormInput
      bind:formDataField={$formData.discountCode}
      {form}
      name="discountCode"
      label="Discount code"
    />

    <SuperDebug data={$formData} />
  </section>
</form>

<style type="postcss">
  form div h3 {
    @apply text-3xl mb-4;
  }
</style>
