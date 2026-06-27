export default defineNuxtRouteMiddleware(() => {
  const nuxtApp = useNuxtApp();
  // * only run on initial page load
  // https://nuxt.com/docs/guide/directory-structure/middleware#when-middleware-runs
  if (!import.meta.client || !nuxtApp.isHydrating || !nuxtApp.payload.serverRendered) return;

  const userStore = useUserStore();
  const { isMac, modifierKeySet } = storeToRefs(userStore);

  isMac.value = navigator.platform.toLowerCase().includes("mac");
  modifierKeySet.value = isMac.value ? modifierKeys.mac : modifierKeys.windows;
});
