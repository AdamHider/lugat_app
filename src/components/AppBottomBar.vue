<template>
  <q-tabs>
      <q-route-tab
          icon="map"
          :to="routes.prediction"
          exact replace
      />
      <q-route-tab
          icon="group"
          :to="routes.training"
          exact replace
      />
      <q-route-tab
          icon="book"
          :to="routes.books"
          exact replace
      />
  </q-tabs>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useNavigationHistory } from '../composables/useNavigationHistory'
import { watch } from 'vue'

const { routes, watchRoute } = useNavigationHistory()
/*
watch(route, (newData, oldData) => {
console.log(route)
watchRoute(route)
}) */
</script>
