<template>
  <q-tabs>
      <q-route-tab
          icon="search"
          :to="routes.translation"
      />
      <q-route-tab
          icon="checklist"
          :to="routes.training"
      />
      <q-route-tab
          icon="spellcheck"
          :to="routes.words"
      />
      <q-route-tab
          icon="book"
          :to="routes.books"
      />
  </q-tabs>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useNavigationHistory } from '../composables/useNavigationHistory'
import { watch } from 'vue'

const { routes, watchRoute } = useNavigationHistory()

const route = useRoute()
const router = useRouter()

watch(() => route.fullPath, (to, from) => {
  //watchRoute(to, from)
})
</script>
