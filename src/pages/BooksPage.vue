<template>
  <q-page-wrapper>
    <q-app-header class="bg-white rounded-b-md bordered" reveal>
        <q-toolbar-title>Achievements</q-toolbar-title>
    </q-app-header>
    <q-page class="bg-white q-pa-sm" >
        <BookList/>
    </q-page>
  </q-page-wrapper>
</template>

<script setup >
import BookList from '../components/BookList.vue'

</script>
