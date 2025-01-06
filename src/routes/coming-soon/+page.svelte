<script lang="ts">
  import {
    superForm,
    type Infer,
    type SuperValidated,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { formSchema, type FormSchema } from "./schema";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";

  let { data } = $props();

  const form = superForm(data.form, {
    validators: zodClient(formSchema),
  });

  const { form: formData, enhance } = form;
</script>

<main class="flex flex-col items-center justify-center w-screen h-screen">
  <h1>Coming Soon</h1>
  <p>This page is under construction.</p>

  <form method="POST" use:enhance class="">
    <Form.Field {form} name="email">
      <Form.Control let:attrs>
        <Form.Label>email</Form.Label>
        <Input {...attrs} bind:value={$formData.email} />
      </Form.Control>
      <Form.Description>Signup to stay up to date with Inversn</Form.Description
      >
      <Form.FieldErrors />
    </Form.Field>
    <Form.Button>Signup</Form.Button>
  </form>
</main>
