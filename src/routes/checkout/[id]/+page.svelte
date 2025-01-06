<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import * as Form from "$lib/components/ui/form";
  import {
    formSchema,
    FormInput,
    FormCheckbox,
    FormSelect,
    type FormSchema,
    IndianStates,
  } from "$lib/components/form";
  // import { Input } from "$lib/components/ui/input";
  // import { Checkbox } from "$lib/components/ui/checkbox";
  // import * as Select from "$lib/components/ui/select";

  let { data } = $props();

  const form = superForm(data.form, {
    validators: zodClient(formSchema),
  });

  const { form: formData, enhance } = form;

  $inspect($formData);
</script>

<main class="w-full *:p-16 flex">
  <section class="w-[56%] pr-4 border-r border-primary h-full">
    <form method="POST" use:enhance class="flex flex-col gap-8">
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
      </div>

      <Form.Button>Pay now</Form.Button>
    </form>
  </section>

  <section class="w-[44%] pl-4">dlkjs</section>
</main>

<style type="postcss">
  form div h3 {
    @apply text-3xl mb-4;
  }
</style>
