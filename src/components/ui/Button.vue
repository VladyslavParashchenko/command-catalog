<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'ghost' | 'icon' }>(), { variant: 'ghost' });
</script>
<template>
  <button
    type="button"
    :class="
      variant === 'icon'
        ? 'inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70'
        : 'rounded-md px-3 py-2 text-sm transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70'
    "
  >
    <slot />
  </button>
</template>
