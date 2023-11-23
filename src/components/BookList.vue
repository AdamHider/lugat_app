<style>
.text-underline:hover{
  text-decoration: underline;
}
</style>
<template>
  <q-card flat class="q-pa-sm q-my-sm">
    <q-card-actions>
      <q-btn color="primary" icon="add" label="New book" @click="bookModal = !bookModal"></q-btn>
      <q-input borderless dense v-model="filterSet.filter" label="Search book ..." >
          <template v-slot:append>
            <q-icon v-if="filterSet.filter !== ''" name="close" @click="filterSet.filter = ''" class="cursor-pointer" />
            <q-icon name="search" />
          </template>
        </q-input>
    </q-card-actions>
  </q-card>
  <q-dialog v-model="bookModal">
        <q-card class="my-card">
          <q-card-section>
            <q-input outlined v-model="formData.title" label="Title" />
            <q-input outlined v-model="formData.author" label="Author" />
            <q-input outlined v-model="formData.year" label="Year" />
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn v-close-popup flat color="gray" label="Cancel" />
            <q-btn v-close-popup flat color="primary" label="Save" @click="addBook()" />
          </q-card-actions>
        </q-card>
      </q-dialog>
  <div>
    <q-list  bordered dense  >
      <q-expansion-item
        v-for="(book, bookIndex) in books" :key="bookIndex"
        icon="book"
        expand-separator
        :label="book.title"
        :caption="book.author"
      >
        <q-list dense class="q-pl-md">
          <q-item clickable v-for="(chapter, chapterIndex) in book.chapters" :key="chapterIndex" :to="`/chapter-${chapter.id}`">
            <q-item-section avatar top>
              <q-avatar icon="subdirectory_arrow_right" />
            </q-item-section>
            <q-item-section>
              Chapter {{chapter.number}}
            </q-item-section>

            <q-item-section side>
              <q-chip color="primary" text-color="white" size="sm">{{ chapter.total_texts }}</q-chip>
            </q-item-section>
            <q-item-section side v-if="chapter.is_exported == 1">
              <b class="text-positive">Exported</b>
            </q-item-section>
          </q-item>

          <q-item clickable @click="addChapter(book.id, book.chapters.length+1)">
            <q-item-section avatar top>
              <q-avatar icon="add" />
            </q-item-section>
            <q-item-section>
              New chapter
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
    </q-list>

  </div>
</template>

<script setup>
import { api } from '../services/index'
import { ref, watch, onMounted, reactive } from 'vue'

const error = ref({})
const books = ref([])
const bookModal = ref(false)
const chapterModal = ref(false)
const formData = reactive({
  title: '',
  author: '',
  year: ''
})
const filterSet = ref({
  language_id: 1,
  filter: ''
})

async function loadData () {
  const bookListResponse = await api.book.getList({ filter: { search: filterSet.value.filter } })
  if (bookListResponse.error) {
    error.value = bookListResponse
    return []
  }
  books.value = bookListResponse
}
const addBook = async function () {
  const bookAddResponse = await api.book.createItem({
    title: formData.title,
    author: formData.author,
    year: formData.year
  })
  if (bookAddResponse.error) {
    bookAddResponse.value = []
  }
  return true
}
const addChapter = async function (book_id, number) {
  const chapterAddResponse = await api.chapter.createItem({ book_id, number })
  if (chapterAddResponse.error) {
    chapterAddResponse.value = []
  }
  return await loadData()
}

onMounted(async () => {
  // get initial data from server (1st page)
  await loadData()
})

watch(() => filterSet.value.filter, async (currentValue, oldValue) => {
  loadData()
})
</script>
