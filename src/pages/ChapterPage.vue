<template>
  <q-page class="bg-white q-pa-sm">
    <q-card flat bordered class="q-my-sm">
      <q-card-section class="q-pt-xs" v-if="book">
        <div class="text-overline">{{ book.author }}</div>
        <div class="text-h5 q-mt-sm q-mb-xs">{{ book.title }}</div>
        <div class="text-h6 q-mt-sm q-mb-xs">Chapter {{ book.chapter }}</div>
        <div class="text-caption text-grey">{{ book.year }}</div>
        <div class="row q-gutter-md">
          <q-btn color="primary" icon="edit" label="Open editor" @click="textModal = !textModal"></q-btn>
          <q-btn flate icon="trash" @click="deleteChapter()">Delete</q-btn>
        </div>
      </q-card-section>
    </q-card>
    <q-dialog v-model="textModal"
      persistent
      maximized>
        <q-card class="my-card">
          <q-bar>
            <q-btn flat icon="save" @click="saveTexts()">
              Save
            </q-btn>
            <q-spinner
              v-if="saving"
              color="primary"
            />
            <q-btn flat icon="move_up" @click="exportTexts()">
              Export
            </q-btn>
            <q-space />
            <q-btn flat round dense icon="close" v-close-popup />
          </q-bar>

          <div class="row q-px-sm">
            <div class="col-6 row">
              <q-select
                dense
                v-model="data.source.language_id"
                :options="options.source"
                emit-value
                map-options
              />
              <q-chip v-if="data.source.is_exported" size="md" icon="check" color="positive" text-color="white">
                Exported
              </q-chip>
            </div>
            <div class="col-6 row">
              <q-select
                dense
                v-model="data.target.language_id"
                :options="options.target"
                emit-value
                map-options
              />
              <q-chip v-if="data.target.is_exported" size="md" icon="check" color="positive" text-color="white">
                Exported
              </q-chip>
            </div>
          </div>

          <q-card-section horizontal>
            <q-card-section class="full-width q-pa-none">
              <NotepadTextarea :value="data.source.text" :scrollSync="scrollSync" :readonly="data.source.is_exported"
                @update-value="data.source.text = $event;"
                @update-scroll="scrollSync = $event;"/>
            </q-card-section>
            <q-card-section  class="full-width q-pa-none">
              <NotepadTextarea :value="data.target.text" :scrollSync="scrollSync" :readonly="data.target.is_exported"
                @update-value="data.target.text = $event;"
                @update-scroll="scrollSync = $event;"/>
            </q-card-section>
          </q-card-section>
          <q-inner-loading :showing="!loaded">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>

        </q-card>
      </q-dialog>

  </q-page>
</template>

<script setup >
import { api } from '../services/index'
import { ref, reactive, watch, onMounted, onActivated, onDeactivated } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

import NotepadTextarea from '../components/NotepadTextarea.vue'

const options = {
  source: [
    {
      label: 'Qirimtatar',
      value: '1'
    }
  ],
  target: [
    {
      label: 'Русский',
      value: '2'
    },
    {
      label: 'Украинська',
      value: '3'
    },
    {
      label: 'English',
      value: '4'
    }
  ]
}

const scrollSync = ref({})
const error = ref(false)
const loaded = ref(false)
const saving = ref(false)
const textModal = ref(false)
const maximizedToggle = ref(false)

const saveInterval = ref(false)

const book = ref({})
const data = reactive({

  source: {
    text: '',
    language_id: '1',
    is_done: false,
    is_exported: false
  },
  target: {
    text: '',
    language_id: '2',
    is_done: false,
    is_exported: false
  }
})

async function loadText (scope) {
  const textListResponse = await api.text.getItem({
    chapter_id: route.params.chapter_id,
    language_id: data[scope].language_id
  })
  if (textListResponse.error) {
    data[scope] = {
      text: '',
      language_id: data[scope].language_id,
      is_done: false,
      is_exported: false
    }
    return []
  }
  data[scope] = textListResponse
}
async function loadBook () {
  const bookItemResponse = await api.book.getItem({ filter: { chapter_id: route.params.chapter_id } })
  if (bookItemResponse.error) {
    error.value = bookItemResponse
    return []
  }
  book.value = bookItemResponse
}
const saveTexts = async function () {
  if (!route.params.chapter_id) return
  saving.value = true
  await saveText('source')
  await saveText('target')
  saving.value = false
}
const exportTexts = async function () {
  await api.text.exportItem({
    chapter_id: route.params.chapter_id,
    language_id: data.source.language_id,
    text: data.source.text,
    is_done: data.source.is_done,
    is_exported: data.source.is_exported
  })
  await api.text.exportItem({
    chapter_id: route.params.chapter_id,
    language_id: data.target.language_id,
    text: data.target.text,
    is_done: data.target.is_done,
    is_exported: data.target.is_exported
  })
  loadData()
}
const saveText = async function (scope) {
  await api.text.saveItem({
    chapter_id: route.params.chapter_id,
    language_id: data[scope].language_id,
    text: data[scope].text,
    is_done: data[scope].is_done,
    is_exported: data[scope].is_exported
  })
}
const loadData = async function () {
  clearInterval(saveInterval.value)
  loadBook()
  loaded.value = false
  await loadText('source')
  await loadText('target')
  loaded.value = true
}
const deleteChapter = async function () {
  await api.chapter.deleteItem({ chapter_id: route.params.chapter_id })
}
const saveCounter = function () {
  saveInterval.value = setInterval(function () {
    saveTexts()
  }, 60000)
}

onActivated(async () => {
  await loadData()
})
onDeactivated(async () => {
  clearInterval(saveInterval.value)
})

onMounted(async () => {
  await loadData()
})

watch(() => data.source.language_id, async (currentValue, oldValue) => {
  await loadText('source')
})
watch(() => data.target.language_id, async (currentValue, oldValue) => {
  await loadText('target')
})
</script>
