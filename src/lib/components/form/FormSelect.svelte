<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import * as Select from "$lib/components/ui/select";

  interface Props {
    form: any;
    formDataField: any;
    name: string;
    options: any[];
    label: string;
    description?: string;
  }

  let {
    formDataField = $bindable(),
    form,
    options,
    label,
    name,
    description,
  }: Props = $props();

  let selected = $derived(
    formDataField
      ? {
          label: formDataField,
          value: formDataField,
        }
      : undefined
  );
</script>

<Form.Field {form} {name}>
  <Form.Control let:attrs>
    <Form.Label>{label}</Form.Label>
    <Select.Root
      {selected}
      onSelectedChange={(v) => {
        v && (formDataField = v.value);
      }}
    >
      <Select.Trigger {...attrs}>
        <Select.Value placeholder={label} />
      </Select.Trigger>
      <Select.Content class="max-h-[50vh] overflow-y-auto">
        {#each options as option}
          <Select.Item value={option} label={option} />
        {/each}
      </Select.Content>
    </Select.Root>
    <input type="hidden" {name} bind:value={formDataField} />
    {#if description}
      <Form.Description>{description}</Form.Description>
    {/if}
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>
