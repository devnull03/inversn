<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Checkbox } from "$lib/components/ui/checkbox";

  interface Props {
    form: any;
    formDataField: any;
    name: string;
    label: string;
    description?: string;
  }

  let {
    formDataField = $bindable(),
    form,
    label,
    name,
    description,
  }: Props = $props();
</script>

<Form.Field {form} {name}>
  <Form.Control let:attrs>
    <div class="flex items-center gap-2">
      <Checkbox {...attrs} bind:checked={formDataField} />
      <p>{label}</p>
    </div>
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>
