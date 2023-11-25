<template>
  <q-page-wrapper>
    <q-app-header class="bg-white rounded-b-md bordered" reveal>
        <q-btn flat icon="arrow_back"  @click="$router.go(-1);" v:slot="back-button"/>
        <q-toolbar-title>Achievements</q-toolbar-title>
    </q-app-header>
    <q-page class="bg-white q-pa-sm">
      <q-card>
        <q-card-section>
          <div class="text-h6">Meta data</div>
        </q-card-section>
        <q-separator />
        <q-card-section >
          <q-form class=" q-gutter-md">
            <q-input outlined v-model="formData.title" label="Title"/>
            <q-input outlined v-model="formData.author" label="Author"/>
            <q-input outlined v-model="formData.year" label="Year"/>
          </q-form>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="Save" @click="saveBook()" />
        </q-card-actions>
      </q-card>
      <q-card class="q-my-sm">
        <q-card-section>
          <div class="text-h6">Chapters</div>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-list >
            <q-item clickable v-for="(chapter, chapterIndex) in chapters" :key="chapterIndex" @click="activeChapter = chapter; chapterModal = true">
                <q-item-section avatar top>
                  <q-avatar icon="subdirectory_arrow_right" />
                </q-item-section>
                <q-item-section>
                  Chapter {{chapter.number}}
                </q-item-section>

                <q-item-section side>
                  <div class="row" v-if="chapter.languages">
                    <q-chip v-for="(language, langIndex) in chapter.languages" :key="langIndex" color="primary" text-color="white" size="sm">
                      <b>{{language}}</b>
                    </q-chip>
                  </div>
                </q-item-section>
                <q-item-section side v-if="chapter.is_exported == 1">
                  <b class="text-positive">Exported</b>
                </q-item-section>
            </q-item>

            <q-item clickable @click="addChapter(chapters.length+1)">
              <q-item-section avatar top>
                <q-avatar icon="add" />
              </q-item-section>
              <q-item-section>
                New chapter
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="Build" @click="build()" />
        </q-card-actions>
      </q-card>
      <q-dialog v-model="chapterModal" >
        <chapter-modal :chapter="activeChapter" @onUpdated="loadData" />
      </q-dialog>
    </q-page>
  </q-page-wrapper>
</template>

<script setup >
import { api } from '../services/index'
import { ref, watch, onMounted, onActivated, reactive } from 'vue'
import { useRoute } from 'vue-router'
import ChapterModal from '../components/ChapterModal.vue'

const route = useRoute()
const chapterModal = ref(false)
const activeChapter = ref(null)

const formData = reactive({
  id: null,
  title: '',
  author: '',
  year: ''
})
const chapters = ref([])

const loadData = async function () {
  const bookItemResponse = await api.book.getItem({ book_id: route.params.book_id })
  if (bookItemResponse.error) {
    error.value = bookItemResponse
    return []
  }
  formData.id = bookItemResponse.id
  formData.title = bookItemResponse.title
  formData.author = bookItemResponse.author
  formData.year = bookItemResponse.year
  chapters.value = bookItemResponse.chapters
  if(activeChapter.value){
    activeChapter.value = bookItemResponse.chapters.find(chapter => chapter.id == activeChapter.value.id)
  }
  if(!activeChapter.value) chapterModal.value = false
}

const saveBook = async function () {
  const bookAddResponse = await api.book.saveItem({
    id: formData.id,
    title: formData.title,
    author: formData.author,
    year: formData.year
  })
  if (bookAddResponse.error) {
    bookAddResponse.value = []
  }
  return true
}
const build = async function () {
  const bookBuildResponse = await api.book.buildItem({id: formData.id})
  if (bookBuildResponse.error) {
    bookBuildResponse.value = []
  }
  return true
}

const addChapter = async function (number) {
  const chapterAddResponse = await api.chapter.createItem({ book_id: route.params.book_id, number })
  if (chapterAddResponse.error) {
    chapterAddResponse.value = []
  }
  return await loadData()
}

onActivated(async () => {
  await loadData()
})

onMounted(async () => {
  await loadData()
})
</script>
