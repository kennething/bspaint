<script setup lang="ts">
definePageMeta({
  middleware: () => navigateTo("/draw", { redirectCode: 302 })
});
</script>
