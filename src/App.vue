<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Menu, Terminal, X } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import CatalogEditor from 'src/components/catalog/CatalogEditor.vue';
import CategoryEditor from 'src/components/catalog/CategoryEditor.vue';
import CatalogTransfer from 'src/components/catalog/CatalogTransfer.vue';
import ExportDialog from 'src/components/catalog/ExportDialog.vue';
import ImportDialog from 'src/components/catalog/ImportDialog.vue';
import CommandTree from 'src/components/navigation/CommandTree.vue';
import DeleteDialog from 'src/components/catalog/DeleteDialog.vue';
import type { Command } from 'src/types/catalog';
import type { DeleteTarget, EditTarget } from 'src/types/commands';
import {
  addCategory,
  addCommand,
  categories,
  deleteCategory,
  deleteCommand,
  commandRegistry,
  commandRoutes,
  commandTree,
  initializeCatalog,
  renameCategory,
  replaceCatalog,
  updateCommand,
} from 'src/catalog';

const route = useRoute();
const router = useRouter();
const catalogEditor = ref<InstanceType<typeof CatalogEditor> | null>(null);
const categoryEditor = ref<InstanceType<typeof CategoryEditor> | null>(null);
const exportDialog = ref<InstanceType<typeof ExportDialog> | null>(null);
const importDialog = ref<InstanceType<typeof ImportDialog> | null>(null);
const deleteDialog = ref<InstanceType<typeof DeleteDialog> | null>(null);
const drawerOpen = ref(false);
const query = ref('');
const activeCommandId = computed(() => {
  const commandId = route.params.commandId;
  return typeof commandId === 'string' && commandRegistry.value[commandId] ? commandId : undefined;
});
const isCommandRoute = computed(() => commandRoutes.value.some((item) => item.path === route.path));
function select(id: string) {
  const command = commandRegistry.value[id];
  if (command) {
    const route = commandRoutes.value.find((item) => item.definition.id === id);
    if (route) router.push(route.path);
    query.value = '';
  }
}
function openCommandEditor() {
  catalogEditor.value?.openCommand();
}
function remove(target: DeleteTarget) {
  if (target.type === 'category') deleteCategory(target.categoryId);
  else deleteCommand(target.commandId);
}
async function saveCommand(commandId: string, categoryId: string, command: Omit<Command, 'id'>) {
  await updateCommand(commandId, command, categoryId);
  if (route.params.commandId === commandId && route.params.categoryId !== categoryId)
    router.replace(`/${categoryId}/${commandId}`);
}
function edit(target: EditTarget) {
  if (target.type === 'category') {
    const category = categories.value.find((item) => item.id === target.categoryId);
    if (category) categoryEditor.value?.openEdit(category);
    return;
  }
  const owner = categories.value.find((item) =>
    item.commands.some((command) => command.id === target.commandId),
  );
  const command = owner?.commands.find((item) => item.id === target.commandId);
  if (owner && command) catalogEditor.value?.openCommandEdit(command, owner.id);
}
onMounted(async () => {
  await initializeCatalog();
});
</script>
<template>
  <div class="min-h-screen bg-slate-50 text-slate-950">
    <aside
      class="fixed inset-y-0 left-0 z-30 hidden w-96 flex-col border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl md:flex"
    >
      <div class="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <span
          class="grid h-10 w-10 place-items-center rounded-xl bg-sky-400/15 text-sky-300 ring-1 ring-sky-300/20"
        >
          <Terminal :size="22" />
        </span>
        <div>
          <p class="text-xl font-semibold tracking-tight">Command catalog</p>
          <p class="text-base text-slate-400">Shell utilities</p>
        </div>
      </div>
      <div class="flex min-h-0 flex-1 flex-col p-4 pb-1">
        <CommandTree
          v-model="query"
          :categories="commandTree"
          :active-command-id="activeCommandId"
          @select="select"
          @create-category="categoryEditor?.open()"
          @remove="deleteDialog?.open($event)"
          @edit="edit"
        />
        <CatalogTransfer @open-export="exportDialog?.open()" @open-import="importDialog?.open()" />
      </div>
    </aside>
    <div
      v-if="drawerOpen"
      class="fixed inset-0 z-40 bg-slate-950/45 md:hidden"
      @click="drawerOpen = false"
    ></div>
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl transition-transform md:hidden',
        drawerOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      aria-label="Command navigation"
    >
      <div class="flex h-20 items-center justify-between border-b border-slate-800 px-5">
        <div class="flex items-center gap-3">
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-sky-400/15 text-sky-300">
            <Terminal :size="20" />
          </span>
          <span class="font-semibold">Command catalog</span>
        </div>
        <button
          type="button"
          class="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
          aria-label="Close navigation"
          @click="drawerOpen = false"
        >
          <X :size="21" />
        </button>
      </div>
      <div class="flex min-h-0 flex-1 flex-col p-4">
        <CommandTree
          v-model="query"
          :categories="commandTree"
          :active-command-id="activeCommandId"
          @select="select"
          @close="drawerOpen = false"
          @create-category="categoryEditor?.open()"
          @remove="deleteDialog?.open($event)"
          @edit="edit"
        />
        <CatalogTransfer @open-export="exportDialog?.open()" @open-import="importDialog?.open()" />
      </div>
    </aside>
    <main class="min-h-screen bg-slate-50 md:ml-96">
      <div class="flex h-14 items-center border-b border-slate-200 bg-white px-4 md:hidden">
        <button
          type="button"
          class="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Open navigation"
          @click="drawerOpen = true"
        >
          <Menu :size="22" /></button
        ><span class="ml-2 font-semibold">Command catalog</span>
      </div>
      <RouterView v-slot="{ Component }">
        <component :is="Component" @add-command="openCommandEditor" />
      </RouterView>
    </main>
    <CatalogEditor
      ref="catalogEditor"
      :show-floating-button="isCommandRoute"
      :categories="categories"
      @create-command="addCommand"
      @update-command="saveCommand"
    />
    <CategoryEditor ref="categoryEditor" @create="addCategory" @update="renameCategory" />
    <ExportDialog ref="exportDialog" :categories="categories" />
    <ImportDialog ref="importDialog" :categories="categories" @replace="replaceCatalog" />
    <DeleteDialog ref="deleteDialog" :categories="categories" @confirm="remove" />
  </div>
</template>
