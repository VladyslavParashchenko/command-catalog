<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { FolderPlus } from 'lucide-vue-next';
import Modal from 'src/components/ui/Modal.vue';

const emit = defineEmits<{ create: [name: string] }>();

const isOpen = ref(false);
const name = ref('');
const error = ref('');
const field = ref<HTMLInputElement | null>(null);

function open() {
  error.value = '';
  isOpen.value = true;
  nextTick(() => field.value?.focus());
}
function close() {
  isOpen.value = false;
  error.value = '';
}
function submit() {
  if (!name.value.trim()) {
    error.value = 'Enter a category name.';
    return;
  }
  emit('create', name.value.trim());
  name.value = '';
  close();
}

defineExpose({ open });
</script>

<template>
  <Modal
    :open="isOpen"
    label="New category"
    title="New category"
    description="Changes are saved on this device."
    @close="close"
  >
    <template #icon><FolderPlus :size="20" /></template>

    <form id="category-form" class="grid gap-5 px-6 py-5" @submit.prevent="submit">
      <label class="grid gap-2">
        <span class="text-base font-semibold text-slate-800">Category name</span>
        <input
          ref="field"
          v-model="name"
          placeholder="e.g. Docker"
          class="h-12 rounded-xl border border-slate-300 px-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
      </label>
      <p v-if="error" class="text-base font-medium text-rose-600">{{ error }}</p>
    </form>

    <template #footer>
      <button
        type="submit"
        form="category-form"
        class="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-5 text-base font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
      >
        <FolderPlus :size="18" /> Create category
      </button>
    </template>
  </Modal>
</template>
