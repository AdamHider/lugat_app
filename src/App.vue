<template>
  <router-view />
</template>

<script>
import { useLanguage } from './composables/useLanguage'

const { loadLanguages } = useLanguage()
async function init () {
  loadLanguages()
}
init()
</script>
