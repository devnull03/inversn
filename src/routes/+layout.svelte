<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  // import { navigating } from "$app/state";
  import { PUBLIC_COMPANY_NAME, PUBLIC_DOMAIN } from "$env/static/public";
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import { Toaster } from "$lib/components/ui/sonner";
  import Cart from "$lib/components/CartDrawer.svelte";
  import type { LayoutData } from "./$types";
  import {
    cartData,
    cartItems,
    categoriesCache,
    customerData,
  } from "$lib/stores.svelte";
  import type { CartItem } from "$lib/models";
  import { page } from "$app/state";

  interface Props {
    children?: import("svelte").Snippet;
    data?: LayoutData;
  }

  let scrollY = $state(0);
  let { children, data }: Props = $props();

  let firstLoad = $state(true);
  // let load = $derived(firstLoad || !$navigating);

  const siteData = {
    description:
      "Inversn - Luxury Clothing for the Discerning Shopper in India",
    keywords: [
      "luxury clothing",
      "designer wear",
      "fashion",
      "India",
      "Inversn",
    ],
    placename: "India",
    region: "IN",
  };

  $inspect($cartData, $cartItems);

  onMount(async () => {
    firstLoad = false;

    BigInt.prototype.toJSON = function () {
      return Number(this);
    };

    categoriesCache.set(data?.categories || []);

    // cartData.set(JSON.parse(localStorage.getItem("cartData") || "{}"));
    cartData.subscribe((value) => {
      localStorage.removeItem("cartData");
      localStorage.setItem("cartData", JSON.stringify(value));
    });

    cartData.update((v) => {
      v.orderId = data?.orderData?.orderId;
      v.orderVersion = Number.parseInt(data?.orderData?.orderVersion as string);
      v.orderObject = data?.orderData?.orderObject;
      return v;
    });

    customerData.update((v) => {
      v.customerId = data?.customerData?.customerId;
      v.customerObject = data?.customerData?.customerObject;
      return v;
    });

    cartItems.set(data?.orderData?.orderLineItems || []);
  });
</script>

<svelte:head>
  <title>{PUBLIC_COMPANY_NAME}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Afacad:ital,wght@0,400..700;1,400..700&family=Average&display=swap"
    rel="stylesheet"
  />

  <script
    src="https://kit.fontawesome.com/30f055fc02.js"
    crossorigin="anonymous"
  ></script>

  <link
    rel="icon"
    type="image/png"
    href="/favicon/favicon-96x96.png"
    sizes="96x96"
  />
  <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
  <link rel="shortcut icon" href="/favicon/favicon.ico" />
  <link
    rel="apple-touch-icon"
    sizes="180x180"
    href="/favicon/apple-touch-icon.png"
  />
  <meta name="apple-mobile-web-app-title" content="Inversn" />
  <link rel="manifest" href="/favicon/site.webmanifest" />

  <meta name="description" content={siteData.description} />
  <meta name="keywords" content={siteData.keywords.join(", ")} />
  <meta property="og:title" content={PUBLIC_COMPANY_NAME} />
  <meta property="og:description" content={siteData.description} />
  <meta property="og:image" itemprop="image" content="/favicon/web-app-manifest-512x512.png" />
  <meta property="og:url" content={PUBLIC_DOMAIN} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={PUBLIC_COMPANY_NAME} />

  <meta name="twitter:card" content="/favicon/favicon.svg" />
  <meta name="twitter:title" content={PUBLIC_COMPANY_NAME} />
  <meta name="twitter:description" content={siteData.description} />
  <meta name="twitter:image" content="/favicon/web-app-manifest-512x512.png" />

  <meta name="author" content={PUBLIC_COMPANY_NAME} />
  <meta name="geo.placename" content={siteData.placename} />
  <meta name="geo.region" content={siteData.region} />
</svelte:head>

<svelte:window bind:scrollY />

<Toaster />

<Cart />

{#if page.url.pathname !== "/coming-soon"}
  <div
    in:fade={{ duration: 400 }}
    class="flex h-screen flex-col justify-between"
  >
    <Header />
    <main class="mt-24">
      {@render children?.()}
    </main>
    <Footer />
  </div>
{:else}
  {@render children?.()}
{/if}

{#if scrollY !== 0}
  <button
    transition:fade
    class="group fixed bottom-6 right-6 z-[999] rounded-full bg-white object-cover py-0.5 shadow-lg transition-all duration-500 hover:-translate-y-1"
    aria-label="yuh"
    onclick={() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
  >
    <span
      class="fa fa-angle-left rotate-90 px-5 py-4 text-black transition-all duration-500 group-hover:scale-110"
    ></span>
  </button>
{/if}
