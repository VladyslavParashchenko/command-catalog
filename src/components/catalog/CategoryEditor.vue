<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { FolderPen, FolderPlus } from 'lucide-vue-next';
import type { Category } from 'src/types/catalog';
import Modal from 'src/components/ui/Modal.vue';

const emit = defineEmits<{ create: [name: string]; update: [categoryId: string, name: string] }>();

const isOpen = ref(false);
const editedId = ref('');
const name = ref('');
const error = ref('');
const field = ref<HTMLInputElement | null>(null);
const isEditing = computed(() => Boolean(editedId.value));

function show() {
  error.value = '';
  isOpen.value = true;
  nextTick(() => field.value?.focus());
}
function open() {
  editedId.value = '';
  name.value = '';
  show();
}
function openEdit(category: Category) {
  editedId.value = category.id;
  name.value = category.name;
  show();
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
  if (editedId.value) emit('update', editedId.value, name.value.trim());
  else emit('create', name.value.trim());
  name.value = '';
  editedId.value = '';
  close();
}

defineExpose({ open, openEdit });
</script>

<template>
  <Modal
    :open="isOpen"
    :label="isEditing ? 'Edit category' : 'New category'"
    :title="isEditing ? 'Edit category' : 'New category'"
    description="Changes are saved on this device."
    @close="close"
  >
    <template #icon>
      <component :is="isEditing ? FolderPen : FolderPlus" :size="20" />
    </template>

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
        <component :is="isEditing ? FolderPen : FolderPlus" :size="18" />
        {{ isEditing ? 'Save category' : 'Create category' }}
      </button>
    </template>
  </Modal>
</template>
