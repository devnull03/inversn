<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import Input from "$lib/components/ui/input/input.svelte";

  interface Props {
    form: any;
    formDataField: any;
    name: string;
    label: string;
    description?: string;
  }

  let { formDataField = $bindable(), form, label, name, description }: Props = $props();
</script>

<Form.Field {form} {name}>
  <Form.Control let:attrs>
    <Form.Label>{label}</Form.Label>
    <Input {...attrs} bind:value={formDataField} placeholder={label} />
    {#if description}
      <Form.Description>{description}</Form.Description>
    {/if}
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>
