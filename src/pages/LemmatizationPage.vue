<template>
  <q-page-wrapper>
    <q-app-header class="bg-white rounded-b-md bordered" reveal>
        <q-toolbar-title>Words</q-toolbar-title>
    </q-app-header>
    <q-page class="bg-white q-pa-sm" >
        <WordList/>
    </q-page>
  </q-page-wrapper>
</template>

<script setup >
import WordList from '../components/WordList.vue'

</script>
