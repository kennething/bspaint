import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/main.css"],
  modules: ["@pinia/nuxt", "@formkit/auto-animate/nuxt"],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit", "fabric", "uuid"]
    }
  },
  runtimeConfig: {
    public: {
      minZoom: 0.1,
      maxZoom: 50,
      minCanvasSize: 1,
      maxCanvasSize: 4200
    }
  },
  app: {
    head: {
      title: "BS Paint",
      meta: [
        { charset: "UTF-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "author", content: "Kenneth Ng" },
        { property: "og:title", content: "BS Paint" },
        { property: "og:site_name", content: "BS Paint" }
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/bspaint.svg" }]
    }
  }
});
