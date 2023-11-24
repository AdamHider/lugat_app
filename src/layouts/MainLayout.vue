<template>
  <q-layout view="hHh Lpr lff"  class="shadow-2 rounded-borders">
    <q-header elevated :class="$q.dark.isActive ? 'bg-secondary' : 'bg-black'">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>{{ pageTitle }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="200"
      :breakpoint="500"
      bordered
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
    >
      <q-scroll-area class="fit">
        <q-list>
          <template v-for="(menuItem, index) in menuList" :key="index">
            <q-item
              clickable
              :active="menuItem.label === 'Outbox'"
              :to="menuItem.link"
               v-ripple>
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>
                {{ menuItem.label }}
              </q-item-section>
            </q-item>
            <q-separator :key="'sep' + index"  v-if="menuItem.separator" />
          </template>

        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component, route }">
        <transition :name="`page-${route.meta.transition}`">
            <keep-alive >
                <component :is="Component"/>
            </keep-alive>
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>

import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const drawer = ref(false)

const pageTitle = ref(route.meta.pageTitle)

const menuList = [
{
  icon: 'error',
  label: 'Prediction',
  link: 'prediction',
  separator: true
},
{
  icon: 'notes',
  label: 'Training',
  link: 'training',
  separator: false
},
{
  icon: 'menu_book',
  label: 'Books',
  link: 'books',
  separator: false
}
]
watch(route, (currentValue, oldValue) => {
pageTitle.value = route.meta.pageTitle
})

</script>
