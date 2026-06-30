import * as z from "zod/mini";

export default defineNuxtRouteMiddleware(() => {
  const nuxtApp = useNuxtApp();
  // * only run on initial page load
  // https://nuxt.com/docs/guide/directory-structure/middleware#when-middleware-runs
  if (!import.meta.client || !nuxtApp.isHydrating) return;

  const userStore = useUserStore();
  const { isMac, settings } = storeToRefs(userStore);

  function getDefaultSettings() {
    return {
      horizontalScrollAssist: !isMac.value
    } as z.infer<typeof SettingsSchema>;
  }

  const existingSettings = localStorage.getItem("settings");
  if (!existingSettings) return void (settings.value = getDefaultSettings());

  const { error, data } = SettingsSchema.safeParse(existingSettings);
  if (error) return void (settings.value = getDefaultSettings());

  settings.value = data;
});
