<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Command } from 'src/types/catalog';
import type { PresetState } from 'src/types/presets';
import CommandParameterField from 'src/components/command-page/CommandParameterField.vue';
import CommandPreview from 'src/components/command-page/CommandPreview.vue';

type CommandBodyProps = {
  command: Command;
};

const props = defineProps<CommandBodyProps>();
const values = reactive<Record<string, string | number | boolean>>(
  Object.fromEntries(
    Object.entries(props.command.options).map(([name, option]) => [
      name,
      option.defaultValue ?? '',
    ]),
  ),
);
const enabled = reactive<Record<string, boolean>>(
  Object.fromEntries(Object.keys(props.command.options).map((name) => [name, true])),
);
const copied = reactive({ value: false });
const renderedTemplate = computed(() => {
  const rendered = props.command.template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const option = props.command.options[name];
    if (option?.optional && !enabled[name]) return '';
    const value = values[name];
    const empty = value === undefined || value === null || value === '';
    if (option?.type === 'boolean') return value === true ? (option.key ?? '') : '';
    const renderedValue = empty ? `{{${name}}}` : String(value);
    return `${option?.key ? `${option.key} ` : ''}${renderedValue}`;
  });
  return rendered.replace(/\s+/g, ' ').trim();
});
function toggleOption(name: string) {
  enabled[name] = !enabled[name];
}
async function copyCommand() {
  await navigator.clipboard.writeText(renderedTemplate.value);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1500);
}
function getState(): PresetState {
  return {
    values: { ...values },
    enabled: { ...enabled },
  };
}
function setState(state: PresetState) {
  Object.assign(values, state.values);
  Object.assign(enabled, state.enabled);
}

defineExpose({ getState, setState });
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10 sm:px-10">
    <CommandPreview :command="renderedTemplate" :copied="copied.value" @copy="copyCommand" />

    <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 class="text-xl font-semibold tracking-tight text-slate-900">Command parameters</h2>
      <p class="mt-1 text-sm text-slate-500">{{ command.description }}</p>
      <form class="mt-8 grid gap-6" @submit.prevent>
        <CommandParameterField
          v-for="(option, name) in command.options"
          :key="name"
          :name="name"
          :option="option"
          :model-value="values[name]"
          :enabled="enabled[name]"
          @update:model-value="values[name] = $event"
          @toggle="toggleOption(name)"
        />
      </form>
    </section>
  </div>
</template>
