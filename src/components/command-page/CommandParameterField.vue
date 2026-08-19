<script setup lang="ts">
import { computed } from 'vue';
import type { TemplateOption } from 'src/types/catalog';
import TimecodeInput from 'src/components/ui/TimecodeInput.vue';

const props = defineProps<{
  name: string;
  option: TemplateOption;
  modelValue: string | number | boolean;
  enabled: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean];
  toggle: [];
}>();

const value = computed({
  get: () => props.modelValue,
  set: (next: string | number | boolean) => emit('update:modelValue', next),
});

const displayName = computed(() =>
  props.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
);
</script>

<template>
  <label class="grid gap-2.5">
    <span class="flex items-center justify-between gap-3">
      <span class="text-sm font-semibold text-slate-700">
        {{ displayName }}
        <span v-if="option.key">({{ option.key }}) </span>
      </span>
      <button
        v-if="option.optional"
        type="button"
        :aria-pressed="enabled"
        :class="[
          'rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-300',
          enabled
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-slate-100 text-slate-500',
        ]"
        @click="emit('toggle')"
      >
        {{ enabled ? 'Enabled' : 'Disabled' }}
      </button>
    </span>

    <select
      v-if="option.type === 'enum'"
      v-model="value"
      :name="name"
      :disabled="option.optional && !enabled"
      :required="!option.optional"
      class="h-12 rounded-lg border border-slate-300 bg-white px-3.5 text-base text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
    >
      <option v-for="item in option.restrictions?.enum ?? []" :key="item.key" :value="item.key">
        {{ item.label }}
      </option>
    </select>

    <TimecodeInput
      v-else-if="option.type === 'timecode'"
      :model-value="modelValue"
      :placeholder="option.example"
      :disabled="option.optional && !enabled"
      :required="!option.optional"
      @update:model-value="value = $event"
    />

    <input
      v-else-if="option.type !== 'boolean'"
      v-model="value"
      :name="name"
      :type="option.type === 'output-file' ? 'text' : option.type"
      :disabled="option.optional && !enabled"
      :min="option.restrictions?.min"
      :max="option.restrictions?.max"
      :placeholder="option.example"
      :readonly="option.type === 'output-file'"
      :required="!option.optional"
      class="h-12 rounded-lg border border-slate-300 bg-white px-3.5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
    />

    <span v-else class="flex h-12 items-center gap-3">
      <input
        v-model="value"
        :name="name"
        type="checkbox"
        :disabled="option.optional && !enabled"
        class="h-5 w-5 accent-sky-600"
      />
      <span class="text-sm text-slate-500">Enabled</span>
    </span>
  </label>
</template>
