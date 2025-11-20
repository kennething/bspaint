<template>
  <NuxtPage />

  <Teleport to="body">
    <p class="pointer-events-none fixed right-1 bottom-1 z-100 text-xs text-neutral-500 transition duration-500 select-none" :class="{ 'opacity-25': isTransparentUI }">
      if anythings broken, womp womp its a feature not a bug
    </p>

    <button
      @click="menuIsOpen = !menuIsOpen"
      class="du-tooltip du-swap du-tooltip-left fixed top-2 right-2 z-100 rounded-full p-2 transition duration-500 hover:bg-sky-200/50 hover:duration-150"
      :class="{ 'pointer-events-none opacity-25': isTransparentUI }"
      data-tip="Keyboard Shortcuts"
    >
      <img class="size-8" :class="`du-swap-${menuIsOpen ? 'on' : 'off'}`" src="/icons/keyboard.svg" aria-hidden="true" />
      <img class="size-8" :class="`du-swap-${menuIsOpen ? 'off' : 'on'}`" src="/icons/keyboard-off.svg" aria-hidden="true" />
    </button>

    <Transition>
      <div
        class="hide-scrollbar fixed top-1/2 left-1/2 z-110 flex h-[80dvh] w-150 -translate-x-1/2 -translate-y-1/2 cursor-default flex-col items-start justify-start overflow-y-scroll rounded-xl border-2 bg-white p-6 shadow-2xl"
        v-show="menuIsOpen"
      >
        <h3 class="text-xl font-bold">Keyboard Shortcuts</h3>
        <button @click="menuIsOpen = false" class="du-tooltip du-tooltip-left absolute top-4 right-4 rounded-full p-2 hover:bg-neutral-200/50" data-tip="Close">
          <img class="size-6" src="/icons/close.svg" aria-hidden="true" />
        </button>

        <div class="my-4 flex w-full flex-col items-center justify-center gap-2">
          <KeyboardShortcut v-for="shortcut in generalShortcuts" :key="shortcut.name" :shortcut="shortcut" />
        </div>

        <div class="du-join du-join-vertical w-full bg-neutral-100" v-for="(tool, index) in toolShortcuts">
          <div class="du-collapse du-join-item border border-neutral-500" :class="{ 'du-collapse-arrow': 'shortcuts' in tool }">
            <input type="radio" name="shortcut-accordion" :checked="index === 0" :disabled="!('shortcuts' in tool)" />

            <div class="du-collapse-title text-lg font-semibold capitalize">
              {{ tool.tool }} <kbd class="du-kbd du-kbd-lg">{{ tool.keys[0] }}</kbd>
            </div>

            <div class="du-collapse-content flex flex-col items-center justify-center gap-2">
              <KeyboardShortcut v-if="'shortcuts' in tool" v-for="shortcut in tool.shortcuts" :key="shortcut.name" :shortcut="shortcut" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const { isTransparentUI } = storeToRefs(userStore);

const menuIsOpen = ref(false);

const isMac = ref(false);
const generalShortcuts = ref<GeneralShortcut[]>([]);
const toolShortcuts = ref<Shortcut[]>([]);

onMounted(() => {
  isMac.value = navigator.userAgent.includes("Mac");

  const helperKeys = isMac.value
    ? ({
        cmd: "⌘",
        alt: "⌥",
        shift: "⇧",
        ctrl: "⌃",
        space: "␣",
        escape: "Esc",
        leftClick: "Left Click",
        rightClick: "Right Click"
      } as const)
    : ({
        cmd: "ctrl",
        alt: "alt",
        shift: "shift",
        ctrl: "ctrl",
        space: "space",
        escape: "esc",
        leftClick: "Left Click",
        rightClick: "Right Click"
      } as const);

  generalShortcuts.value = [
    {
      name: "Undo",
      keys: [helperKeys.cmd, "Z"]
    },
    {
      name: "Redo",
      keys: isMac.value ? [helperKeys.cmd, helperKeys.shift, "Z"] : [helperKeys.cmd, "Y"]
    },
    {
      name: "Swap Tools",
      note: "between your last two used tools",
      keys: [helperKeys.space]
    }
  ];

  toolShortcuts.value = [
    {
      tool: "select",
      keys: ["V"],
      shortcuts: [
        {
          name: "Select All",
          keys: [helperKeys.cmd, "A"]
        },
        {
          name: "Deselect and Stamp Selection",
          keys: [helperKeys.escape]
        },
        {
          name: "Copy Selection",
          note: "to clipboard, pastable to other apps",
          keys: [helperKeys.cmd, "C"]
        },
        {
          name: "Cut Selection",
          note: "to clipboard, pastable to other apps",
          keys: [helperKeys.cmd, "X"]
        },
        {
          name: "Move Selection",
          keys: [helperKeys.leftClick]
        },
        {
          name: "Rotate Selection",
          keys: [helperKeys.shift, helperKeys.leftClick]
        },
        {
          name: "Resize Selection",
          keys: [helperKeys.cmd, helperKeys.leftClick]
        }
      ]
    },
    {
      tool: "brush",
      keys: ["B"],
      shortcuts: [
        {
          name: "Draw with Primary Color",
          keys: [helperKeys.leftClick]
        },
        {
          name: "Draw with Secondary Color",
          keys: [helperKeys.rightClick]
        }
      ]
    },
    {
      tool: "fill",
      keys: ["F"],
      shortcuts: [
        {
          name: "Fill with Primary Color",
          keys: [helperKeys.leftClick]
        },
        {
          name: "Fill with Secondary Color",
          keys: [helperKeys.rightClick]
        }
      ]
    },
    {
      tool: "eyedropper",
      keys: ["I"],
      shortcuts: [
        {
          name: "Select to Primary Color",
          keys: [helperKeys.leftClick]
        },
        {
          name: "Select to Secondary Color",
          keys: [helperKeys.rightClick]
        }
      ]
    },
    {
      tool: "eraser",
      keys: ["E"]
    },
    {
      tool: "text",
      keys: ["T"],
      shortcuts: [
        {
          name: "Create with Primary Color",
          keys: [helperKeys.leftClick]
        },
        {
          name: "Create with Secondary Color",
          keys: [helperKeys.rightClick]
        },
        {
          name: "Unfocus and Stamp Text",
          keys: [helperKeys.escape]
        }
      ]
    }
  ];
});
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
