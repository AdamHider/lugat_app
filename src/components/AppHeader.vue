<template>
  <q-page-sticky
    :class="`q-app-header ${props.class}`"
    ref="header"
    style="z-index: 100"
    expand
    position="top"
  >
    <q-toolbar>
      <slot name="back-button"></slot>
      <slot />
    </q-toolbar>
  </q-page-sticky>
  <q-scroll-observer @scroll="onScroll" />
</template>

<script setup>
import { ref, onActivated, defineExpose } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const props = defineProps({
  reveal: Boolean,
  class: String,
});
const header = ref(null);
let revealOffset = 0;
const onScroll = (event) => {
  if (event.position.top > 0) {
    if (props.reveal) {
      header.value.$el.classList.add("header-sticky");
      checkReveal(event);
    }
  } else {
    revealOffset = 0;
    header.value.$el.classList.remove("header-sticky");
  }
};
const checkReveal = (event) => {
  if (event.direction == "down") {
    if (revealOffset > 150) {
      header.value.$el.classList.add("header-reveal");
    }
    revealOffset += event.delta.top;
  } else {
    header.value.$el.classList.remove("header-reveal");
    revealOffset = 0;
  }
};
defineExpose({
  onScroll,
});
onActivated(() => {
  revealOffset = 0;
  header.value.$el.classList.remove("header-reveal");
});
</script>

<style scoped>
.q-app-header {
  transition: 0.2s ease;
}
.q-app-header.bordered {
  box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.12);
}
.q-app-header.header-sticky {
  background: #fff !important;
  color: var(--q-dark) !important;
  box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.12);
}
.q-app-header.header-sticky.header-reveal {
  transform: translateY(-52px) !important;
}
</style>
