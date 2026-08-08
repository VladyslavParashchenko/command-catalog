<script setup lang="ts">
import type { Category } from 'src/types/catalog';

defineProps<{ categories: Category[] }>();
const model = defineModel<string>({ default: '' });
</script>

<template>
  <label class="grid gap-2">
    <span class="text-base font-semibold text-slate-800">Category</span>
    <select
      v-model="model"
      :disabled="!categories.length"
      class="h-12 rounded-xl border border-slate-300 bg-white px-3.5 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-100"
    >
      <option v-for="category in categories" :key="category.id" :value="category.id">
        {{ category.name }}
      </option>
    </select>
  </label>
</template>
