<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { formSchema } from "./schema";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { horizontalLoop } from "$lib/utils";
  import Logo from "$lib/icons/Logo.svelte";
  import { toast } from "svelte-sonner";
  import { Reload } from "svelte-radix";

  let { data } = $props();
  let submitLoading = $state(false);

  const form = superForm(data.form, {
    validators: zodClient(formSchema),
    onUpdated: ({ form: f }) => {
      if (f.valid) {
        toast.success(`Thank you for joining the waitlist!`, {
          duration: 5000,
        });
      } else {
        toast.error("Please fix the errors in the form.");
      }
      submitLoading = false;
    },
  });

  const { form: formData, enhance } = form;

  onMount(() => {
    const marqueeSpeed = 1;

    const boxes = gsap.utils.toArray(".box"),
      loop = horizontalLoop(boxes, { repeat: -1, speed: marqueeSpeed });

    const invertedBoxes = gsap.utils.toArray(".box-inverted"),
      invertedLoop = horizontalLoop(invertedBoxes, {
        repeat: -1,
        reversed: true,
        speed: marqueeSpeed,
      });
  });
</script>

{#snippet marquee(className: string, side: "top" | "bottom")}
  <div
    class:top-0={side === "top"}
    class:bottom-0={side === "bottom"}
    class="absolute text-xl h-10 bg-primary text-white flex items-center gap-1 !w-screen overflow-hidden"
  >
    {#each Array(20) as _, idx}
      <div
        class="{className} whitespace-nowrap break-keep w-full even:pl-2 odd:pr-2 font-medium uppercase odd:scale-x-[-1]"
      >
        DROPPING SOON
      </div>
    {/each}
  </div>
{/snippet}

<video
  autoplay
  loop
  muted
  playsinline
  poster="/coming-soon/poster.jpg"
  class="w-full h-full object-cover fixed top-0 left-0 z-[-1] *:opacity-50 opacity-50"
>
  <source src="/coming-soon/bg.webm" type="video/webm" />
  <source src="/coming-soon/bg.mp4" type="video/mp4" />
</video>

<main
  class="flex flex-col items-center justify-evenly w-screen h-screen font-[Afacad] bg-primary/45 *:w-4/5 *:md:w-1/4"
>
  {@render marquee("box-inverted", "top")}

  <div class="flex flex-col items-center justify-center gap-4">
    <Logo class="w-20 h-20 aspect-square" color="white" />
    <p class="uppercase font-bold text-3xl tracking-[0.27rem] text-white">
      Inversn
    </p>
  </div>

  <div class="flex-col inline-flex font-[Arial] text-white text-lg">
    in.ver.sion
    <p class="flex flex-col gap-0 text-xs text-white/60">
      <span class="font-[Average]">/inˈvərZH(ə)n/</span>
      <span class="italic">noun</span>
    </p>
    the action of converting regular to not regular.
  </div>

  <form
    method="POST"
    use:enhance
    class="flex items-center justify-between rounded-lg bg-white/80 p-1.5 gap-2"
  >
    <Form.Field {form} name="email" class="w-full h-full -space-y-2 relative">
      <Form.Control let:attrs>
        <input
          type="text"
          placeholder="example@email.com"
          {...attrs}
          bind:value={$formData.email}
          class="bg-transparent w-full placeholder:text-primary/40 text-primary h-full outline-none"
        />
      </Form.Control>
      <Form.FieldErrors class="absolute bottom-[-90%]" />
    </Form.Field>
    <Form.Button
      onclick={() => (submitLoading = true)}
      class="uppercase shadow-xl font-bold"
    >
      {#if submitLoading}
        <Reload class="w-4 h-4 animate-spin" />
      {/if}
      join waitlist
    </Form.Button>
  </form>

  {@render marquee("box", "bottom")}
</main>
