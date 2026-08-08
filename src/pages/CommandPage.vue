<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import CommandBody from 'src/components/command-page/CommandBody.vue';
import CommandContainer from 'src/components/command-page/CommandContainer.vue';
import CommandHeader from 'src/components/command-page/CommandHeader.vue';
import PresetManager from 'src/components/command-page/PresetManager.vue';
import { categories, commandRegistry } from 'src/catalog';
import type { SavedPreset, PresetState } from 'src/types/presets';
import EmptyPage from 'src/pages/EmptyPage.vue';

const emit = defineEmits<{ addCommand: [] }>();

const route = useRoute();
const body = ref<InstanceType<typeof CommandBody> | null>(null);
const command = computed(() => {
  const id = typeof route.params.commandId === 'string' ? route.params.commandId : '';
  return commandRegistry.value[id];
});
const category = computed(() => {
  const id = typeof route.params.categoryId === 'string' ? route.params.categoryId : '';
  return categories.value.find(
    (item) => item.id === id && item.commands.some((entry) => entry.id === command.value?.id),
  );
});
function getFormState(): PresetState | undefined {
  return body.value?.getState();
}
function restorePreset(preset: SavedPreset) {
  body.value?.setState(preset);
}
</script>

<template>
  <CommandContainer v-if="command && category">
    <CommandHeader :category="category.name" :name="command.name">
      <template #actions>
        <PresetManager
          :command-id="command.id"
          :get-state="getFormState"
          @restore="restorePreset"
        />
      </template>
    </CommandHeader>
    <CommandBody ref="body" :key="command.id" :command="command" />
  </CommandContainer>
  <EmptyPage v-else @add-command="emit('addCommand')" />
</template>
