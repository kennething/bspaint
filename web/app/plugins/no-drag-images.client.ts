export default defineNuxtPlugin(() => {
  function apply() {
    document.querySelectorAll("img").forEach((img) => (img.draggable = false));
  }

  onNuxtReady(() => {
    apply();

    const observer = new MutationObserver(apply);

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
});
