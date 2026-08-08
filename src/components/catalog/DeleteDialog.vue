<script setup lang="ts">
import { computed, ref } from 'vue';
import { Trash2 } from 'lucide-vue-next';
import type { Category } from 'src/types/catalog';
import type { DeleteTarget } from 'src/types/commands';
import Modal from 'src/components/ui/Modal.vue';

const props = defineProps<{ categories: Category[] }>();
const emit = defineEmits<{ confirm: [DeleteTarget] }>();

const target = ref<DeleteTarget | null>(null);

const category = computed(() => {
  const current = target.value;
  if (current?.type !== 'category') return undefined;
  return props.categories.find((item) => item.id === current.categoryId);
});
const command = computed(() => {
  const current = target.value;
  if (current?.type !== 'command') return undefined;
  return props.categories
    .flatMap((item) => item.commands)
    .find((item) => item.id === current.commandId);
});
// The tree titles group headings from the route slug, so the real name lives in the catalog.
const name = computed(() => category.value?.name ?? command.value?.name ?? '');
const commandCount = computed(() => category.value?.commands.length ?? 0);

function open(next: DeleteTarget) {
  target.value = next;
}
function close() {
  target.value = null;
}
function confirm() {
  if (target.value) emit('confirm', target.value);
  close();
}

defineExpose({ open });
</script>

<template>
  <Modal
    :open="Boolean(target)"
    label="Delete"
    :title="target?.type === 'category' ? 'Delete category?' : 'Delete command?'"
    description="This cannot be undone."
    tone="rose"
    @close="close"
  >
    <template #icon><Trash2 :size="20" /></template>

    <div class="grid gap-4 px-6 py-5">
      <p class="text-base text-slate-700">
        <span class="font-bold text-slate-900">{{ name }}</span>
        will be removed from this device.
      </p>
      <p
        v-if="target?.type === 'category' && commandCount"
        class="rounded-xl bg-rose-50 px-4 py-3 text-base font-medium text-rose-800 ring-1 ring-rose-200"
      >
        {{ commandCount }} {{ commandCount === 1 ? 'command' : 'commands' }} inside will be deleted
        too.
      </p>
    </div>

    <template #footer>
      <button
        type="button"
        class="h-11 rounded-xl border border-slate-300 px-5 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
        @click="close"
      >
        Cancel
      </button>
      <button
        type="button"
        class="h-11 rounded-xl bg-rose-600 px-5 text-base font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200"
        @click="confirm"
      >
        Delete
      </button>
    </template>
  </Modal>
</template>
