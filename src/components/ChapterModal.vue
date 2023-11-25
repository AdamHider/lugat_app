<template>
  <q-card  style="width: 700px; max-width: 80%">
    <q-card-section>
      <q-list>
        <q-item v-for="(text, textIndex) in chapter.texts" :key="textIndex">
          <q-item-section avatar >
            <q-avatar rounded color="primary" text-color="white">{{text.language_code}}</q-avatar>
          </q-item-section>
          <q-item-section>
            <q-field outlined :label="text.language" stack-label >
              <template v-slot:control style="position: unset">
                <div class="">{{text.source}}</div>
              </template>
                <input
                    class="file-input"
                    type="file"
                    name="file"
                    accept=".txt, .md"
                    @change="handleUpload(text, $event)">
            </q-field>
          </q-item-section>
          <q-item-section side>
            <q-btn icon="close" @click="deleteText(text.id)" color="negative" flat/>
          </q-item-section>
        </q-item>
        <q-item v-if="options.length > 0">
          <q-item-section>
            <q-select v-model="language_id" :options="options" label="Language" outlined map-options emit-value/>
          </q-item-section>
          <q-item-section side>
            <q-btn icon="add" @click="addText()" color="primary" flat>Add</q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-actions align="between" class="text-primary">
      <q-btn flat label="Delete chapter" color="negative" @click="deleteChapter()" />
      <q-btn flat label="Close" v-close-popup />
    </q-card-actions>
  </q-card>
  <q-dialog v-model="confirmDelete" >
      <q-card class="bg-teal text-white" style="width: 300px">
        <q-card-section>
          <div class="text-h6">Deleting chapter</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          It is not empty. Are you sure?
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="No" v-close-popup />
          <q-btn flat label="Yes, delete it" color="negative" @click="deleteChapter()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script setup >
import { api } from '../services/index'
import { ref, reactive, watch, onMounted, onActivated, onDeactivated, toRefs} from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  chapter: Object
})
const { chapter: chapter } = toRefs(props)

const emits = defineEmits(['onUpdated'])

const options = ref([])
const languages = ref([
    {
      label: 'Qirimtatar',
      value: '1'
    },
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
])

const language_id = ref(null)
const confirmDelete = ref(false)

const saveText = async function (data) {
  await api.text.saveItem(data)
  emits('onUpdated')
}
const addText = function () {
  const data = {
    chapter_id: chapter.value.id,
    language_id: language_id.value,
    source: null,
    text: null,
    is_built: false
  }
  saveText(data)
}
const deleteText = async function (id) {
  const deleteTextResponse = await api.text.deleteItem({ id: id })
  if (deleteTextResponse.error) {
    deleteTextResponse.value = []
  }
  emits('onUpdated')
}
const deleteChapter = async function () {
  if(!confirmDelete.value && chapter.value.texts.length > 0){
    confirmDelete.value = true
    return
  } else {
    confirmDelete.value = false
  }
  const deleteChapterResponse = await api.chapter.deleteItem({ id: chapter.value.id })
  if (deleteChapterResponse.error) {
    deleteChapterResponse.value = []
  }
  emits('onUpdated')
}


const handleUpload = async (text, event) => {
  const data = new FormData()
  data.append('file', event.target.files[0])
  data.set('file_holder_id', 1)
  const fileUploaded = await uploadFile(data)
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
const uploadFile = function (file) {
  const data = new FormData()
  data.append('name', 'file')
  data.append('file', file)
  return api.uploader.upload(file)
}

const calculateLanguages = function(){
  language_id.value = null
  var languagesLeft = [];
  for(var i in languages.value){
    if(!chapter.value.texts.find(text => text.language_id == languages.value[i].value) ){
      if(!language_id.value) language_id.value = languages.value[i].value
      languagesLeft.push(languages.value[i])
    }
  }
  options.value = languagesLeft
}

onMounted(() => {
  calculateLanguages()
})
watch(() => chapter.value.texts, async (currentValue, oldValue) => {
  calculateLanguages()
})


</script>
<style scope>
.file-input{
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
