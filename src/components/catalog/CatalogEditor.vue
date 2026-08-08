<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { FileDown, Plus, Settings2 } from 'lucide-vue-next';
import type { Category, Command, TemplateOption } from 'src/types/catalog';
import { parseCommandJson, validateCommandInput } from 'src/lib/command-import';
import { optionTypes } from 'src/schemes/command';
import skillMarkdown from 'src/assets/command-skill.md?raw';
import CategorySelect from 'src/components/catalog/CategorySelect.vue';
import Modal from 'src/components/ui/Modal.vue';

type OptionType = TemplateOption['type'];
type ParameterDraft = {
  name: string;
  key: string;
  example: string;
  type: OptionType;
  optional: boolean;
};

const props = withDefaults(
  defineProps<{ categories: Category[]; showFloatingButton?: boolean }>(),
  { showFloatingButton: true },
);
const emit = defineEmits<{
  createCommand: [categoryId: string, command: Omit<Command, 'id'>];
}>();

const isOpen = ref(false);
const tab = ref<'form' | 'json'>('form');
const command = reactive({ categoryId: '', name: '', description: '', template: '' });
const parameters = ref<ParameterDraft[]>([]);
const json = ref('');
const error = ref('');
const hasCategories = computed(() => props.categories.length > 0);

function createParameter(): ParameterDraft {
  return { name: '', key: '', example: '', type: 'string', optional: false };
}
function openCommand() {
  error.value = '';
  if (!command.categoryId) command.categoryId = props.categories[0]?.id ?? '';
  isOpen.value = true;
}
function close() {
  isOpen.value = false;
  error.value = '';
}
function submitCommand() {
  if (!command.categoryId || !command.name.trim() || !command.template.trim()) {
    error.value = 'Choose a category and fill in the command name and template.';
    return;
  }
  const names = parameters.value.map((item) => item.name.trim()).filter(Boolean);
  // Duplicates would silently collapse into one key once options becomes an object.
  if (new Set(names).size !== names.length) {
    error.value = 'Parameter names must be unique.';
    return;
  }
  const options = Object.fromEntries(
    parameters.value
      .filter((item) => item.name.trim())
      .map((item) => [
        item.name.trim(),
        {
          key: item.key.trim() || undefined,
          example: item.example.trim() || undefined,
          type: item.type,
          optional: item.optional,
          restrictions: {},
        },
      ]),
  );
  const result = validateCommandInput({
    name: command.name.trim(),
    description: command.description.trim(),
    template: command.template.trim(),
    options,
  });
  if (!result.ok) {
    error.value = result.error;
    return;
  }
  emit('createCommand', command.categoryId, result.command);
  Object.assign(command, { name: '', description: '', template: '' });
  parameters.value = [];
  close();
}
function submitJson() {
  if (!command.categoryId) {
    error.value = 'Choose a category first.';
    return;
  }
  const result = parseCommandJson(json.value);
  if (!result.ok) {
    error.value = result.error;
    return;
  }
  emit('createCommand', command.categoryId, result.command);
  json.value = '';
  close();
}
function selectTab(next: 'form' | 'json') {
  tab.value = next;
  error.value = '';
}
function downloadSkill() {
  const url = URL.createObjectURL(new Blob([skillMarkdown], { type: 'text/markdown' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'command-catalog-skill.md';
  link.click();
  URL.revokeObjectURL(url);
}

defineExpose({ openCommand });
</script>

<template>
  <div v-if="props.showFloatingButton" class="fixed bottom-5 right-5 z-40">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/20 transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
      @click="openCommand"
    >
      <Plus :size="18" /> Add command
    </button>
  </div>

  <Modal
    :open="isOpen"
    label="New command"
    title="New command"
    description="Changes are saved on this device."
    size="lg"
    @close="close"
  >
    <template #icon><Settings2 :size="20" /></template>

    <div class="border-b border-slate-200 px-6 pt-4">
      <button
        type="button"
        :class="[
          'border-b-2 px-2 pb-3 text-base font-bold transition',
          tab === 'form'
            ? 'border-sky-600 text-sky-700'
            : 'border-transparent text-slate-500 hover:text-slate-700',
        ]"
        @click="selectTab('form')"
      >
        Manual
      </button>
      <button
        type="button"
        :class="[
          'ml-6 border-b-2 px-2 pb-3 text-base font-bold transition',
          tab === 'json'
            ? 'border-sky-600 text-sky-700'
            : 'border-transparent text-slate-500 hover:text-slate-700',
        ]"
        @click="selectTab('json')"
      >
        From JSON
      </button>
    </div>

    <p
      v-if="!hasCategories"
      class="mx-6 mt-5 rounded-xl bg-amber-50 px-4 py-3 text-base font-medium text-amber-900 ring-1 ring-amber-200"
    >
      Create a category first — use + in the sidebar.
    </p>

    <form
      v-if="tab === 'json'"
      id="command-form"
      class="grid gap-5 p-6"
      @submit.prevent="submitJson"
    >
      <div class="grid gap-5 sm:grid-cols-2">
        <CategorySelect v-model="command.categoryId" :categories="categories" />
        <div class="grid content-end gap-2">
          <span class="text-base font-semibold text-slate-800">Writing the JSON with an LLM?</span>
          <button
            type="button"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
            @click="downloadSkill"
          >
            <FileDown :size="18" /> Download skill
          </button>
        </div>
      </div>
      <p class="-mt-1 text-sm text-slate-600">
        The skill file explains the format, field types and restrictions. Give it to your assistant
        along with the command you want, and paste the JSON it returns below.
      </p>
      <label class="grid gap-2">
        <span class="text-base font-semibold text-slate-800">Command JSON</span>
        <textarea
          v-model="json"
          rows="14"
          spellcheck="false"
          placeholder='{
  "name": "Build image",
  "description": "Build a Docker image from a Dockerfile.",
  "template": "docker build -t {{image}} {{path}}",
  "options": {
    "image": { "type": "string", "optional": false, "example": "my-app:latest" },
    "path": { "type": "string", "optional": false, "example": "." }
  }
}'
          class="resize-y rounded-xl border border-slate-300 px-3.5 py-3 font-mono text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        ></textarea>
        <span class="text-sm text-slate-600">
          One command object, without an id — the category comes from the field above.
        </span>
      </label>
      <p v-if="error" class="text-base font-medium text-rose-600">{{ error }}</p>
    </form>

    <form v-else id="command-form" class="grid gap-5 p-6" @submit.prevent="submitCommand">
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        <CategorySelect v-model="command.categoryId" :categories="categories" />
        <label class="grid gap-2">
          <span class="text-base font-semibold text-slate-800">Command name</span>
          <input
            v-model="command.name"
            placeholder="e.g. Build image"
            class="h-12 rounded-xl border border-slate-300 px-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </label>
      </div>
      <label class="grid gap-2">
        <span class="text-base font-semibold text-slate-800">Template</span>
        <textarea
          v-model="command.template"
          rows="2"
          placeholder="docker build -t {{image}} {{path}}"
          class="resize-y rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        ></textarea>
      </label>
      <label class="grid gap-2">
        <span class="text-base font-semibold text-slate-800">Description</span>
        <textarea
          v-model="command.description"
          rows="2"
          placeholder="What this command does"
          class="resize-y rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        ></textarea>
      </label>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-base font-bold text-slate-800">Parameters</p>
            <p class="text-sm text-slate-600">
              Use the same name in the template:
              <code v-pre class="rounded bg-slate-200/80 px-1 py-0.5 font-mono text-slate-900">{{
                parameter
              }}</code
              >.
            </p>
          </div>
          <button
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-100"
            @click="parameters.push(createParameter())"
          >
            Add parameter
          </button>
        </div>
        <div v-if="parameters.length" class="mt-4 grid gap-3">
          <div
            v-for="(parameter, index) in parameters"
            :key="index"
            class="grid gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label class="grid gap-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-600">Name</span>
              <input
                v-model="parameter.name"
                placeholder="image"
                class="h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 text-base outline-none focus:border-sky-500"
              />
            </label>
            <label class="grid gap-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-600">Key</span>
              <input
                v-model="parameter.key"
                placeholder="-t"
                class="h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 font-mono text-base outline-none focus:border-sky-500"
              />
            </label>
            <label class="grid gap-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-600">Type</span>
              <select
                v-model="parameter.type"
                class="h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 text-base outline-none focus:border-sky-500"
              >
                <option v-for="type in optionTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </label>
            <label class="flex h-11 items-center gap-2 text-base font-medium text-slate-700">
              <input v-model="parameter.optional" type="checkbox" class="h-4 w-4 accent-sky-600" />
              Optional
            </label>
            <label class="grid gap-1.5 sm:col-span-2 lg:col-span-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-600"
                >Example / placeholder</span
              >
              <input
                v-model="parameter.example"
                placeholder="my-app"
                class="h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 text-base outline-none focus:border-sky-500"
              />
            </label>
            <button
              type="button"
              class="h-11 justify-self-start rounded-lg px-3 text-base font-semibold text-rose-600 hover:bg-rose-50"
              @click="parameters.splice(index, 1)"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      <p v-if="error" class="text-base font-medium text-rose-600">{{ error }}</p>
    </form>

    <template #footer>
      <button
        type="submit"
        form="command-form"
        :disabled="!hasCategories"
        class="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-5 text-base font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <Plus :size="18" /> Create command
      </button>
    </template>
  </Modal>
</template>
