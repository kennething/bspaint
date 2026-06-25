<template>
  <Teleport to="body">
    <GuiMenu do-transition class="fixed top-1/2 left-1/2 z-20 flex h-100 -translate-x-1/2 -translate-y-1/2 items-center justify-between gap-4 p-4 shadow-lg! shadow-neutral-400/50!" @click.stop>
      <div class="flex h-full w-64 items-start justify-center gap-2">
        <div class="flex h-full w-full flex-col items-center justify-center gap-2">
          <div class="spectrum-square relative h-full w-full cursor-crosshair rounded" ref="square" :style="{ backgroundColor: `hsl(${color.h}, 100%, 50%)` }" @mousedown="startDrag">
            <div
              class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              :style="{ left: `${color.s * 100}%`, top: `${(1 - color.v) * 100}%` }"
            ></div>
          </div>

          <input class="hue-slider h-2 w-full appearance-none rounded outline-none" type="range" min="0" max="360" v-model.number="color.h" @input="updateFromHsv" />
        </div>

        <input
          v-if="editingColor === 'background'"
          type="range"
          min="0"
          max="100"
          class="transparency-slider h-[calc(100%-1rem)] w-2 appearance-none rounded border border-neutral-300/50 outline-none"
          :style="{ background: `linear-gradient(to bottom, rgba(${color.r},${color.g},${color.b},1), rgba(${color.r},${color.g},${color.b},0))` }"
          v-model.number="color.a"
          @input="updateAlpha"
        />
      </div>

      <div class="flex h-full w-40 flex-col items-center justify-between">
        <div class="flex h-full w-full flex-col items-center justify-between">
          <div class="transparent-sprite-sm flex h-20 w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-400/50">
            <div class="h-full w-full" :style="{ backgroundColor: color.hex }"></div>
          </div>

          <div class="flex items-center justify-center gap-2">
            <label for="hex" class="text-xs font-light">Hex</label>
            <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
              <input id="hex" type="text" class="w-32 text-center focus:outline-none" v-model="color.hex" @change="updateFromHex" maxlength="6" />
            </GuiMenu>
          </div>

          <div class="flex flex-col items-end justify-center gap-1">
            <div class="flex items-center justify-center gap-2">
              <label for="red" class="text-xs font-light">Red</label>
              <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
                <input id="red" type="number" class="w-20 text-center focus:outline-none" v-model.number="color.r" @change="updateFromRgb" min="0" max="255" />
              </GuiMenu>
            </div>
            <div class="flex items-center justify-center gap-2">
              <label for="green" class="text-xs font-light">Green</label>
              <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
                <input id="green" type="number" class="w-20 text-center focus:outline-none" v-model.number="color.g" @change="updateFromRgb" min="0" max="255" />
              </GuiMenu>
            </div>
            <div class="flex items-center justify-center gap-2">
              <label for="blue" class="text-xs font-light">Blue</label>
              <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
                <input id="blue" type="number" class="w-20 text-center focus:outline-none" v-model.number="color.b" @change="updateFromRgb" min="0" max="255" />
              </GuiMenu>
            </div>
            <div v-if="editingColor === 'background'" class="flex items-center justify-center gap-2">
              <label for="alpha" class="text-xs font-light">Alpha</label>
              <GuiMenu class="focus-within:border-blue-300/80! focus-within:bg-blue-100/20!">
                <input id="alpha" type="number" class="w-20 text-center focus:outline-none" v-model.number="color.a" @change="updateFromRgb" min="0" max="100" />
              </GuiMenu>
            </div>
          </div>
        </div>

        <div class="mt-10 flex w-full items-center justify-around">
          <GuiButtonSingle image="/icons/close.svg" label="Cancel" @clicked="emit('close')" />
          <GuiButtonSingle
            class="border-blue-100/90! bg-blue-100/70! hover:border-blue-200/70!"
            inner-class-override="hover:bg-blue-200/50!"
            image="/icons/check.svg"
            label="Confirm"
            @clicked="save"
          />
        </div>
      </div>
    </GuiMenu>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ editingColor: "primary" | "secondary" | "background" }>();
const emit = defineEmits<{ close: [void] }>();

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
  a: 100,
  hex: "#000000"
});
watch(primaryColor, (newColor) => {
  if (props.editingColor !== "primary") return;
  color.hex = newColor;
  updateFromHex();
});
watch(secondaryColor, (newColor) => {
  if (props.editingColor !== "secondary") return;
  color.hex = newColor;
  updateFromHex();
});

onBeforeMount(() => {
  if (props.editingColor === "background") {
    color.hex = backgroundColor.value;
    color.a = hexToPercent(color.hex.slice(7, 9));
  } else color.hex = props.editingColor === "primary" ? primaryColor.value : secondaryColor.value;
  updateFromHex();
});

function save() {
  if (props.editingColor === "background") {
    backgroundColor.value = color.hex;
    useHandleResize();
  } else toolStore.setColor(props.editingColor, color.hex.slice(0, 7));
  emit("close");
}

function updateFromHsv() {
  const [newR, newG, newB] = hsvToRgb(color.h, color.s, color.v);

  color.r = newR;
  color.g = newG;
  color.b = newB;

  color.hex = rgbToHex(newR, newG, newB);
  if (props.editingColor === "background") color.hex += percentToHex(color.a);
}
function updateFromRgb() {
  color.r = Math.max(0, Math.min(255, color.r));
  color.g = Math.max(0, Math.min(255, color.g));
  color.b = Math.max(0, Math.min(255, color.b));

  color.hex = rgbToHex(color.r, color.g, color.b);
  color.hex += percentToHex(color.a);

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
  if (props.editingColor === "background") cleanHex += percentToHex(color.a);

  const [newR, newG, newB] = hexToRgb(cleanHex.slice(0, 6));
  color.r = newR;
  color.g = newG;
  color.b = newB;

  color.hex = "#" + cleanHex.toUpperCase();

  const [newH, newS, newV] = rgbToHsv(color.r, color.g, color.b);
  color.h = newH;
  color.s = newS;
  color.v = newV;
}
function updateAlpha() {
  if (props.editingColor !== "background") return;

  color.a = Math.max(0, Math.min(100, color.a));
  color.hex += percentToHex(color.a);
  updateFromHex();
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

.hue-slider::-webkit-slider-thumb,
.transparency-slider::-webkit-slider-thumb {
  @apply size-4 cursor-pointer appearance-none rounded-full border border-neutral-700 bg-white shadow;
}

.transparency-slider {
  writing-mode: vertical-lr;
  direction: rtl;
}
</style>
