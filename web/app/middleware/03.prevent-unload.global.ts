// single

export default defineNuxtRouteMiddleware((to, from) => {
  if (!import.meta.client) return;

  if (from.path.includes("draw")) {
    const confirmed = window.confirm("You have unsaved changes. Leave this page?");
    if (!confirmed) return abortNavigation();
  }
});
