<template>
  <div>
    <q-scroll-area
      style="width: 100vw; height: 100vh;"
      :thumb-style="{opacity: 0}">
      <q-page-container :style="`${(!props.fullscreen) ? 'padding-top: 50px;' : ''} `">
        <slot />
      </q-page-container>
    </q-scroll-area>
  </div>
</template>
<script setup>
import { ref, onActivated, defineExpose } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const props = defineProps({
  fullscreen: Boolean
});
</script>
