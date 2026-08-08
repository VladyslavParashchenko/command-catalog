<script setup lang="ts">
import { computed, reactive } from 'vue';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';

type Segment = 'hours' | 'minutes' | 'seconds';

const props = defineProps<{
  modelValue?: string | number | boolean;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const initial = String(props.modelValue ?? '').match(/^(\d{2}):([0-5]\d):([0-5]\d)$/);
const segments = reactive<Record<Segment, string>>({
  hours: initial?.[1] ?? '00',
  minutes: initial?.[2] ?? '00',
  seconds: initial?.[3] ?? '00',
});
const limits: Record<Segment, number> = { hours: 99, minutes: 59, seconds: 59 };
const valid = computed(() =>
  (Object.keys(segments) as Segment[]).every(
    (segment) => /^\d{2}$/.test(segments[segment]) && Number(segments[segment]) <= limits[segment],
  ),
);

function format(value: number) {
  return String(value).padStart(2, '0');
}
function emitValue() {
  emit(
    'update:modelValue',
    `${format(Number(segments.hours) || 0)}:${format(Number(segments.minutes) || 0)}:${format(Number(segments.seconds) || 0)}`,
  );
}
function update(segment: Segment, event: Event) {
  const input = event.target as HTMLInputElement;
  const next = input.value.replace(/\D/g, '').slice(0, 2);
  segments[segment] = next;
  input.value = next;
  emitValue();
}
function normalize(segment: Segment) {
  segments[segment] = format(Math.min(limits[segment], Number(segments[segment]) || 0));
  emitValue();
}
function adjust(segment: Segment, amount: number) {
  const next = Math.max(0, Math.min(limits[segment], (Number(segments[segment]) || 0) + amount));
  segments[segment] = format(next);
  emitValue();
}
</script>

<template>
  <div class="flex h-12 w-full items-center gap-2" :aria-invalid="!valid">
    <template v-for="(label, segmentIndex) in ['Hours', 'Minutes', 'Seconds']" :key="label">
      <span
        class="flex h-full flex-1 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100 aria-[invalid=true]:border-rose-400"
      >
        <input
          :value="segments[(Object.keys(segments) as Segment[])[segmentIndex]]"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          maxlength="2"
          :placeholder="placeholder?.split(':')[segmentIndex] ?? '00'"
          :aria-label="label"
          :disabled="disabled"
          :required="required"
          class="min-w-0 flex-1 bg-transparent text-center font-mono text-base tabular-nums text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
          @input="update((Object.keys(segments) as Segment[])[segmentIndex], $event)"
          @blur="normalize((Object.keys(segments) as Segment[])[segmentIndex])"
        />
        <span class="flex w-8 shrink-0 flex-col border-l border-slate-200 bg-slate-50">
          <button
            type="button"
            class="grid flex-1 place-items-center text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
            :aria-label="`Increase ${label.toLowerCase()}`"
            :disabled="disabled"
            @click="adjust((Object.keys(segments) as Segment[])[segmentIndex], 1)"
          >
            <ChevronUp :size="14" />
          </button>
          <button
            type="button"
            class="grid flex-1 place-items-center border-t border-slate-200 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
            :aria-label="`Decrease ${label.toLowerCase()}`"
            :disabled="disabled"
            @click="adjust((Object.keys(segments) as Segment[])[segmentIndex], -1)"
          >
            <ChevronDown :size="14" />
          </button>
        </span>
      </span>
      <span v-if="segmentIndex < 2" class="font-mono text-lg font-semibold text-slate-400">:</span>
    </template>
  </div>
</template>
