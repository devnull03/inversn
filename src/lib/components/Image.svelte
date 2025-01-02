<script lang="ts">
  interface Props {
    src: string;
    alt: string;
    class?: string;
  }

  let { src, alt, ...args }: Props = $props();
</script>

<img {src} {alt} class={args?.class} />
