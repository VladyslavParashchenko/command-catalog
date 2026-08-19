<script setup lang="ts">
import { ref } from 'vue';
import { FileText, Sparkles } from 'lucide-vue-next';
import packageJson from '../../../package.json';
import changelog from '../../../changelog.json';
import Modal from 'src/components/ui/Modal.vue';

const open = ref(false);
const version = packageJson.version;

function show() {
  open.value = true;
}

function close() {
  open.value = false;
}

defineExpose({ show, close });
</script>

<template>
  <Modal
    :open="open"
    label="Changelog"
    title="What’s new"
    :description="`Command catalog v${version}`"
    @close="close"
  >
    <template #icon>
      <FileText :size="20" />
    </template>
    <div class="grid gap-5 px-6 py-5">
      <section v-for="release in changelog.releases" :key="release.version" class="grid gap-3">
        <div class="flex items-baseline justify-between gap-3">
          <h3 class="text-lg font-bold text-slate-900">Version {{ release.version }}</h3>
          <time class="text-sm text-slate-500" :datetime="release.date">{{ release.date }}</time>
        </div>
        <div
          v-for="section in release.sections"
          :key="section.title"
          class="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <h4 class="flex items-center gap-2 text-base font-bold text-slate-800">
            <Sparkles :size="16" class="text-sky-600" />
            {{ section.title }}
          </h4>
          <ul class="mt-2 grid gap-1.5 pl-5 text-base leading-6 text-slate-600">
            <li v-for="item in section.items" :key="item" class="list-disc">{{ item }}</li>
          </ul>
        </div>
      </section>
    </div>
  </Modal>
</template>
