<script setup lang="ts">
import { Plus } from 'lucide-vue-next';

const emit = defineEmits<{ addCommand: [] }>();
</script>

<template>
  <section
    class="relative grid min-h-[calc(100vh-3.5rem)] place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#e0f2fe_0%,#f8fafc_42%,#f8fafc_100%)] p-6 md:min-h-screen"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl"
    ></div>
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -right-24 bottom-8 h-80 w-80 rounded-full bg-indigo-200/25 blur-3xl"
    ></div>

    <div class="relative flex max-w-md flex-col items-center text-center">
      <div class="relative mb-8 h-56 w-64 sm:h-64 sm:w-72" aria-hidden="true">
        <div
          class="absolute inset-x-5 bottom-2 h-8 rounded-full bg-slate-300/40 blur-xl sm:inset-x-8"
        ></div>
        <svg
          viewBox="0 0 288 256"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="relative h-full w-full drop-shadow-[0_18px_24px_rgba(15,23,42,0.12)]"
        >
          <defs>
            <linearGradient
              id="window"
              x1="48"
              y1="35"
              x2="232"
              y2="214"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#1E293B" />
              <stop offset="1" stop-color="#0F172A" />
            </linearGradient>
            <linearGradient
              id="screen"
              x1="68"
              y1="64"
              x2="214"
              y2="190"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#E0F2FE" />
              <stop offset="1" stop-color="#BAE6FD" />
            </linearGradient>
            <linearGradient
              id="button"
              x1="189"
              y1="154"
              x2="232"
              y2="204"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#38BDF8" />
              <stop offset="1" stop-color="#6366F1" />
            </linearGradient>
          </defs>
          <path d="M144 13 260 80v96l-116 67-116-67V80L144 13Z" fill="#CBD5E1" opacity=".5" />
          <path d="m144 27 99 57v81l-99 57-99-57V84l99-57Z" fill="url(#window)" />
          <path d="M45 84 144 141l99-57" stroke="#475569" stroke-width="2" />
          <path d="M144 141v81" stroke="#475569" stroke-width="2" />
          <circle cx="65" cy="58" r="5" fill="#FB7185" />
          <circle cx="82" cy="58" r="5" fill="#FBBF24" />
          <circle cx="99" cy="58" r="5" fill="#34D399" />
          <path
            d="m75 102 17 13-17 13m27-1h39"
            stroke="url(#screen)"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="6"
          />
          <path d="M75 151h89M75 169h63" stroke="#64748B" stroke-linecap="round" stroke-width="5" />
          <circle cx="211" cy="182" r="29" fill="url(#button)" />
          <path d="M211 170v24m-12-12h24" stroke="white" stroke-linecap="round" stroke-width="5" />
          <path
            d="m239 67 12-7m-14 25 15 1M49 62l-12-7m14 25-15 1"
            stroke="#38BDF8"
            stroke-linecap="round"
            stroke-width="3"
          />
        </svg>
      </div>

      <p class="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sky-600">Command catalog</p>
      <h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Nothing here yet</h1>
      <p class="mt-3 max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
        This page is ready for a new command. Add one to start building your catalog.
      </p>
      <button
        type="button"
        class="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-slate-300"
        @click="emit('addCommand')"
      >
        <Plus :size="18" /> Add command
      </button>
    </div>
  </section>
</template>
