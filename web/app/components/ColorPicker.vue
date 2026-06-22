<template>
  <Teleport to="body">
    <GuiMenu class="fixed top-1/2 left-1/2 flex h-100 -translate-x-1/2 -translate-y-1/2 items-center justify-between gap-4 p-4">
      <div class="flex h-full w-64 flex-col items-center justify-center gap-2">
        <div class="spectrum-square relative h-full w-full cursor-crosshair rounded" ref="square" :style="{ backgroundColor: `hsl(${color.h}, 100%, 50%)` }" @mousedown="startDrag">
          <div
            class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            :style="{ left: `${color.s * 100}%`, top: `${(1 - color.v) * 100}%` }"
          ></div>
        </div>

        <input class="hue-slider h-2 w-full appearance-none rounded outline-none" type="range" min="0" max="360" v-model.number="color.h" @input="updateFromHsv" />
      </div>

      <div class="flex h-full w-40 flex-col items-center justify-between">
        <div class="flex h-full w-full flex-col items-center justify-between">
          <div class="h-20 w-full rounded-xl border" :style="{ backgroundColor: color.hex }"></div>

          <div class="flex items-center justify-center gap-1">
            <label for="hex" class="text-xs font-light">Hex</label>
            <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
              <input id="hex" type="text" class="w-32 focus:outline-none" v-model="color.hex" @change="updateFromHex" maxlength="6" />
            </GuiMenu>
          </div>

          <div class="flex flex-col items-end justify-center gap-1">
            <div class="flex items-center justify-center gap-1">
              <label for="red" class="text-xs font-light">Red</label>
              <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
                <input id="red" type="number" class="w-20 focus:outline-none" v-model.number="color.r" @change="updateFromRgb" min="0" max="255" />
              </GuiMenu>
            </div>
            <div class="flex items-center justify-center gap-1">
              <label for="green" class="text-xs font-light">Green</label>
              <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
                <input id="green" type="number" class="w-20 focus:outline-none" v-model.number="color.g" @change="updateFromRgb" min="0" max="255" />
              </GuiMenu>
            </div>
            <div class="flex items-center justify-center gap-1">
              <label for="blue" class="text-xs font-light">Blue</label>
              <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
                <input id="blue" type="number" class="w-20 focus:outline-none" v-model.number="color.b" @change="updateFromRgb" min="0" max="255" />
              </GuiMenu>
            </div>
          </div>
        </div>

        <div class="mt-20 flex w-full items-center justify-around">
          <GuiMenu class="flex items-center justify-center rounded-full! px-0.5">
            <button @click="emit('close')" class="flex w-10 items-center justify-center rounded-full p-1 hover:bg-neutral-200/50" aria-label="Cancel">
              <img class="size-7" src="/icons/close.svg" aria-hidden="true" />
            </button>
          </GuiMenu>

          <GuiMenu class="flex items-center justify-center rounded-full! px-0.5">
            <button @click="save" class="flex w-10 items-center justify-center rounded-full p-1 hover:bg-neutral-200/50" aria-label="Cancel">
              <img class="size-7" src="/icons/check.svg" aria-hidden="true" />
            </button>
          </GuiMenu>
        </div>
      </div>
    </GuiMenu>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ editingColor: "primary" | "secondary" | "background" }>();
const emit = defineEmits<{ close: [void] }>();

const editingColor = ref<"primary" | "secondary" | "background">(props.editingColor);

const toolStore = useToolStore();
const { primaryColor, secondaryColor, backgroundColor } = storeToRefs(toolStore);

const colorSquare = useTemplateRef("square");
let isDragging = false;

const color = reactive({
  h: 0,
  s: 0,
  v: 0,
  r: 0,
  g: 0,
  b: 0,
  hex: "#000000"
});
watch(primaryColor, (newColor) => {
  color.hex = newColor;
  editingColor.value = "primary";
  updateFromHex();
});
watch(secondaryColor, (newColor) => {
  color.hex = newColor;
  editingColor.value = "secondary";
  updateFromHex();
});

onBeforeMount(() => {
  if (editingColor.value === "background") color.hex = backgroundColor.value;
  else color.hex = editingColor.value === "primary" ? primaryColor.value : secondaryColor.value;
  updateFromHex();
});

function save() {
  if (editingColor.value === "background") backgroundColor.value = color.hex;
  else toolStore.setColor(editingColor.value, color.hex);
  emit("close");
}

function updateFromHsv() {
  const [newR, newG, newB] = hsvToRgb(color.h, color.s, color.v);

  color.r = newR;
  color.g = newG;
  color.b = newB;

  color.hex = rgbToHex(newR, newG, newB);
}
function updateFromRgb() {
  color.r = Math.max(0, Math.min(255, color.r));
  color.g = Math.max(0, Math.min(255, color.g));
  color.b = Math.max(0, Math.min(255, color.b));

  color.hex = rgbToHex(color.r, color.g, color.b);

  const [newH, newS, newV] = rgbToHsv(color.r, color.g, color.b);
  color.h = newH;
  color.s = newS;
  color.v = newV;
}
function updateFromHex() {
  let cleanHex = color.hex.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
  if (cleanHex.length === 3)
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  if (cleanHex.length !== 6) return;

  const [newR, newG, newB] = hexToRgb(cleanHex);
  color.r = newR;
  color.g = newG;
  color.b = newB;

  color.hex = "#" + cleanHex.toUpperCase();

  const [newH, newS, newV] = rgbToHsv(color.r, color.g, color.b);
  color.h = newH;
  color.s = newS;
  color.v = newV;
}

function startDrag(event: MouseEvent) {
  isDragging = true;
  handleDrag(event);
  document.addEventListener("mousemove", handleDrag);
  document.addEventListener("mouseup", stopDrag);
}
function handleDrag(event: MouseEvent) {
  if (!isDragging || !colorSquare.value) return;

  const rect = colorSquare.value.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  x = Math.max(0, Math.min(rect.width, x));
  y = Math.max(0, Math.min(rect.height, y));

  color.s = x / rect.width;
  color.v = 1 - y / rect.height;
  updateFromHsv();
}
function stopDrag() {
  isDragging = false;
  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", stopDrag);
}
onUnmounted(stopDrag);
</script>

<style scoped>
@reference "../assets/main.css";

.spectrum-square {
  background-image: linear-gradient(to top, rgba(0, 0, 0, 1), transparent), linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
}

.hue-slider {
  background: linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red);
}

.hue-slider::-webkit-slider-thumb {
  @apply size-4 cursor-pointer appearance-none rounded-full border border-neutral-700 bg-white shadow;
}
</style>
