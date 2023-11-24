<style>
.text-underline:hover{
  text-decoration: underline;
}
</style>
<template>
  <q-card flat class="q-pa-sm q-my-sm">
    <q-card-actions>
      <q-btn color="primary" icon="add" label="New book" @click="bookModal = !bookModal"></q-btn>
      <q-input borderless dense v-model="filterSet.filter" label="Search book ..."  debounce="500">
          <template v-slot:append>
            <q-icon v-if="filterSet.filter !== ''" name="close" @click="filterSet.filter = ''" class="cursor-pointer" />
            <q-icon name="search" />
          </template>
        </q-input>
    </q-card-actions>
  </q-card>

  <q-list bordered padding  >
    <q-infinite-scroll ref="infiniteScroll" @load="loadData" :offset="250">
        <q-item v-for="(book, bookIndex) in books" :key="bookIndex" clickable v-ripple :to="`/book-${book.id}`">
          <q-item-section top avatar>
            <q-avatar color="primary" text-color="white"  icon="book" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{book.title}}</q-item-label>
            <q-item-label caption>{{book.author}}</q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>meta</q-item-label>
          </q-item-section>
        </q-item>
    </q-infinite-scroll>
  </q-list>

  <q-dialog v-model="bookModal">
        <q-card style="width: 700px; max-width: 80%;">
          <q-card-section>
            <div class="text-h6">Edit book</div>
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
            <q-btn v-close-popup flat color="gray" label="Cancel" />
            <q-btn v-close-popup flat color="primary" label="Save" @click="saveBook()" />
          </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { api } from '../services/index'
import { ref, watch, onMounted, onActivated, reactive } from 'vue'

const error = ref({})
const books = ref([])
const bookModal = ref(false)
const chapterModal = ref(false)
const infiniteScroll = ref(null)
const isLoaded = ref(false)

const formData = reactive({
  id: null,
  title: '',
  author: '',
  year: ''
})
const filterSet = ref({
  language_id: 1,
  filter: ''
})

const filter = function () {
  isLoaded.value = false
  infiniteScroll.value.reset()
  infiniteScroll.value.trigger()
}

const loadData = async function  (index, done) {
  if(isLoaded.value === true) return done()
  var limit = 15
  var offset = limit * (index-1)
  const bookListResponse = await api.book.getList({ filter: { search: filterSet.value.filter }, limit, offset })
  if (bookListResponse.error) {
    books.value = []
    error.value = bookListResponse
    isLoaded.value = true
    done()
    return
  }
  if(offset == 0){
    books.value = bookListResponse
  } else {
    books.value = [...books.value, ...bookListResponse];
  }
  isLoaded.value = false
  if(bookListResponse.length < limit)  isLoaded.value = true
  done()
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

onMounted(async () => {
  infiniteScroll.value.trigger()
})

watch(() => filterSet.value.filter, async (currentValue, oldValue) => {
  filter()
})
</script>
