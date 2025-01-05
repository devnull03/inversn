<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import * as Select from "$lib/components/ui/select";
  import { formSchema, IndianStates } from "./schema";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  let { data } = $props();

  const form = superForm(data.form, {
    validators: zodClient(formSchema),
  });

  const { form: formData, enhance } = form;

  let selectedCountry = $derived(
    $formData.country
      ? {
          label: $formData.country,
          value: $formData.country,
        }
      : undefined
  );

  let selectedBillingCountry = $derived(
    $formData.billingCountry
      ? {
          label: $formData.billingCountry,
          value: $formData.billingCountry,
        }
      : undefined
  );

  let selectedPhoneCountryCode = $derived(
    $formData.phoneCountryCode
      ? {
          label: $formData.phoneCountryCode,
          value: $formData.phoneCountryCode,
        }
      : undefined
  );

  let selectedBillingPhoneCountryCode = $derived(
    $formData.billingPhoneCountryCode
      ? {
          label: $formData.billingPhoneCountryCode,
          value: $formData.billingPhoneCountryCode,
        }
      : undefined
  );
</script>

<main class="w-full *:p-16 flex">
  <section class="w-[56%] pr-4 border-r border-primary h-full">
    <form method="POST" use:enhance class="flex flex-col gap-8">
      <div>
        <h3>Contact</h3>
        <Form.Field {form} name="email">
          <Form.Control let:attrs>
            <Form.Label>Email</Form.Label>
            <Input {...attrs} bind:value={$formData.email} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="emailOffers">
          <Form.Control let:attrs>
            <Checkbox {...attrs} bind:checked={$formData.emailOffers} />
            <p>Email me with news and offers</p>
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>

      <div class="">
        <h3>Delhivery</h3>

        <Form.Field {form} name="country">
          <Form.Control let:attrs>
            <Form.Label>Country</Form.Label>

            <Select.Root
              selected={selectedCountry}
              onSelectedChange={(v) => {
                v && ($formData.country = v.value);
              }}
            >
              <Select.Trigger {...attrs}>
                <Select.Value placeholder="Country" />
              </Select.Trigger>
              <Select.Content>
                <!-- TODO: other country support? -->
                <Select.Item value="India" label="India" />
              </Select.Content>
            </Select.Root>
	    <input type="hidden" name={attrs.name} bind:value={$formData.country} />
          </Form.Control>
          <Form.Description>Currently we only support India</Form.Description>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="firstName">
          <Form.Control let:attrs>
            <Form.Label>First name</Form.Label>
            <Input {...attrs} bind:value={$formData.firstName} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="lastName">
          <Form.Control let:attrs>
            <Form.Label>Last name</Form.Label>
            <Input {...attrs} bind:value={$formData.lastName} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="address1">
          <Form.Control let:attrs>
            <Form.Label>Address 1</Form.Label>
            <Input {...attrs} bind:value={$formData.address1} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="address2">
          <Form.Control let:attrs>
            <Form.Label>Address 2</Form.Label>
            <Input {...attrs} bind:value={$formData.address2} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="city">
          <Form.Control let:attrs>
            <Form.Label>City</Form.Label>
            <Input {...attrs} bind:value={$formData.city} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="state">
          <Form.Control let:attrs>
            <Form.Label>State</Form.Label>
            <Select.Root
              selected={{
                label: $formData.state,
                value: $formData.state,
              }}
              onSelectedChange={(v) => {
                v && ($formData.state = v.value);
              }}
            >
              <Select.Trigger {...attrs}>
                <Select.Value placeholder="State" />
              </Select.Trigger>
              <Select.Content>
                {#each Object.values(IndianStates) as state}
                  <Select.Item value={state} label={state} />
                {/each}
              </Select.Content>
            </Select.Root>
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <Form.Field {form} name="postalCode">
          <Form.Control let:attrs>
            <Form.Label>Pincode</Form.Label>
            <Input {...attrs} bind:value={$formData.postalCode} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <div>
          <Form.Field {form} name="phone">
            <Form.Control let:attrs>
              <Form.Label>Phone</Form.Label>
              <Input {...attrs} bind:value={$formData.phone} />
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>

	  <Form.Field {form} name="phoneCountryCode">
	    <Form.Control let:attrs>
	      <Form.Label>Country code</Form.Label>
	      <Select.Root
		selected={selectedPhoneCountryCode}
		onSelectedChange={(v) => {
		  v && ($formData.phoneCountryCode = v.value);
		}}
	      >
		<Select.Trigger {...attrs}>
		  <Select.Value placeholder="Country code" />
		</Select.Trigger>
		<Select.Content>
		  <Select.Item value="+91" label="+91" />
		</Select.Content>
	      </Select.Root>
	    </Form.Control>
	    <Form.FieldErrors />
	  </Form.Field>
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
