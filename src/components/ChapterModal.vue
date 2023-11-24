<template>
  <q-card>
    <q-card-section>
      <q-list>
        <q-item v-for="(text, textIndex) in chapter.texts" :key="textIndex">
          <q-item-section avatar top>
            <q-avatar rounded color="primary" text-color="white">{{text.language_code}}</q-avatar>
          </q-item-section>
          <q-item-section>
            <q-field outlined label="source">
            <input class=""
                type="file"
                name="file"
                accept=".txt, .md5"
                @change="handleUpload(text, $event)"
                style="opacity: 0">
            {{text.source}}
            </q-field>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup >
import { api } from '../services/index'
import { ref, reactive, watch, onMounted, onActivated, onDeactivated } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const chapter = ref({})

const props = defineProps({
  chapter: Object
})

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

const saveText = async function (data) {
  console.log(data)
  await api.text.saveItem(data)
}

const handleUpload = async (text, event) => {
  const data = new FormData()
  data.append('file', event.target.files[0])
  data.set('file_holder_id', 1)
  const fileUploaded = await upload(data)
  if (!fileUploaded.error) {
    error.value = ''
    text.source = fileUploaded.file
    saveText(text)
  } else {
    error.value = fileUploaded.messages.errors.file
    setTimeout(() => { error.value = '' }, 3000)
    text.source = null;
    saveText(text)
  }
}
function upload (file) {
  const data = new FormData()
  data.append('name', 'file')
  data.append('file', file)
  return api.uploader.upload(file)
}

onMounted(() => {
  chapter.value = props.chapter
})


</script>
