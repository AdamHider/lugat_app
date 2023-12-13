<template>
  <q-layout view="hHh Lpr lff">
    <router-view v-slot="{ Component, route }">
      <transition :name="`page-${route.meta.transition}`">
          <keep-alive :exclude="['WordPage']">
              <component :is="Component"/>
          </keep-alive>
      </transition>
    </router-view>
    <q-footer v-if="bottomBarEnabled" bordered class="bg-white text-primary ">
      <AppBottomBar/>
    </q-footer>
  </q-layout>
</template>

<script setup>

import { ref, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import AppBottomBar from '../components/AppBottomBar.vue'


const route = useRoute()
const isRootPage = ref(false)
const bottomBarEnabled = ref(false)
const pageTitle = ref(route.meta.pageTitle)

provide('redirectedFrom', route.redirectedFrom)
isRootPage.value = (route.fullPath.split('/').length === 2)
bottomBarEnabled.value = route.meta.bottomBarEnabled === true

watch(route, (currentValue, oldValue) => {
  isRootPage.value = (currentValue.fullPath.split('/').length === 2)
  bottomBarEnabled.value = route.meta.bottomBarEnabled === true
})

</script>
