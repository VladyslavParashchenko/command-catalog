<script setup lang="ts">
type CommandHeaderProps = {
  category: string;
  name: string;
};

defineProps<CommandHeaderProps>();
</script>

<template>
  <header
    class="border-b border-slate-200 bg-white/90 px-6 py-4 text-slate-950 shadow-sm backdrop-blur sm:px-10"
  >
    <div class="flex w-full items-center justify-between gap-4">
      <p class="min-w-0 truncate text-4xl font-semibold tracking-tight text-slate-900">
        <span>{{ category }}</span>
        <span class="mx-2 text-slate-400">›</span>
        <span>{{ name }}</span>
      </p>
      <slot name="actions" />
    </div>
  </header>
</template>
