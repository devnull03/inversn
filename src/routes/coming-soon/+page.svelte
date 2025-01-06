<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { formSchema } from "./schema";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { horizontalLoop } from "$lib/utils";

  let { data } = $props();

  const form = superForm(data.form, {
    validators: zodClient(formSchema),
  });

  const { form: formData, enhance } = form;

  onMount(() => {
    const boxes = gsap.utils.toArray(".box"),
      loop = horizontalLoop(boxes, { repeat: -1 });

    const invertedBoxes = gsap.utils.toArray(".box-inverted"),
      invertedLoop = horizontalLoop(invertedBoxes, { repeat: -1, reversed: true });

  });
</script>

{#snippet marquee(className: string, side: "top" | "bottom")}
  <div
    class:top-0={side === "top"}
    class:bottom-0={side === "bottom"}
    class="absolute text-xl h-10 bg-primary text-white flex items-center gap-1 w-screen overflow-hidden font-[Afacad]"
  >
    {#each Array(20) as _, idx}
      <div class="{className} whitespace-nowrap break-keep w-full even:pl-2 odd:pr-2 font-medium uppercase odd:scale-x-[-1]">DROPPING SOON</div>
    {/each}
  </div>
{/snippet}

<main class="flex flex-col items-center justify-center w-screen h-screen">
  {@render marquee("box-inverted", "top")}
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

  {@render marquee("box", "bottom")}
</main>
