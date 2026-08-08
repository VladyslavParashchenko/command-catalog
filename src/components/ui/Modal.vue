<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    open: boolean;
    label: string;
    title: string;
    description?: string;
    size?: 'sm' | 'lg';
    tone?: 'sky' | 'amber' | 'rose';
  }>(),
  { description: undefined, size: 'sm', tone: 'sky' },
);
const emit = defineEmits<{ close: [] }>();

const tones = {
  sky: 'bg-sky-100 text-sky-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
};
const iconClass = computed(() => tones[props.tone]);

// Bound to the document so Escape works wherever focus sits inside the dialog.
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close');
}
watch(
  () => props.open,
  (open) => {
    if (open) document.addEventListener('keydown', onKeydown);
    else document.removeEventListener('keydown', onKeydown);
  },
  { immediate: true },
);
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 grid place-items-center p-4">
      <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" @click="emit('close')"></div>
      <section
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        :class="[
          'relative z-10 flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl',
          size === 'lg' ? 'max-w-4xl' : 'max-w-xl',
        ]"
      >
        <header class="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div class="flex items-start gap-3.5">
            <span :class="['grid h-11 w-11 shrink-0 place-items-center rounded-xl', iconClass]">
              <slot name="icon" />
            </span>
            <div class="min-w-0">
              <h2 class="text-xl font-bold text-slate-900">{{ title }}</h2>
              <p v-if="description" class="mt-1 text-base text-slate-600">{{ description }}</p>
            </div>
          </div>
          <button
            type="button"
            class="-mr-1 shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Close dialog"
            @click="emit('close')"
          >
            <X :size="22" />
          </button>
        </header>

        <div class="min-h-0 overflow-y-auto">
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4"
        >
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>
