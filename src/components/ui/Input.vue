<script setup lang="ts">
defineProps<{ modelValue?: string; type?: string; placeholder?: string; ariaLabel?: string }>();
defineEmits<{ 'update:modelValue': [value: string] }>();
</script>
<template>
  <input
    :value="modelValue"
    :type="type ?? 'text'"
    :placeholder="placeholder"
    :aria-label="ariaLabel"
    class="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 text-base text-slate-100 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/15"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
