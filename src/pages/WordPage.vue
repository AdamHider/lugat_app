<template>
  <q-page-wrapper>
    <q-app-header class="bg-white rounded-b-md bordered" reveal>
        <q-btn flat icon="arrow_back"  @click="$router.go(-1);" v:slot="back-button"/>
        <q-toolbar-title>Achievements</q-toolbar-title>
    </q-app-header>
    <q-page class="bg-white q-pa-sm">
      <q-card>
        <q-card-section>
          <div class="text-caption">{{ word.language }}</div>
          <div class="text-h6">{{ word.word }}</div>
          <div v-if="word.lemma_id" class="text-caption"><b>{{ word.lemma}}</b></div>
        </q-card-section>
        <q-separator />
        <q-card-section >
          <div class="text-h6">Lemma </div>
          <q-list >
            <q-item>
              <q-item-section avatar>
                <q-icon color="primary" name="search" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Manual</q-item-label>
                <q-select
                  ref="select"
                  dense outlined
                  v-model="lemmaModel"
                  use-input hide-selected fill-input map-options
                  input-debounce="200" option-value="id" option-label="lemma"
                  label="Type lemma"
                  :options="lemmaOptions"
                  @filter="searchLemma"
                >
                  <template v-slot:no-option="scope">
                    <q-item clickable @click="addLemma(scope.inputValue)" dense>
                      <q-item-section avatar>
                        <q-icon color="primary" name="add" />
                      </q-item-section>
                      <q-item-section>
                        Add <b>{{scope.inputValue}}</b>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="Save" @click="saveWord()" />
        </q-card-actions>
      </q-card>
      <q-card class="q-my-sm">
        <q-card-section>
          <div class="text-h6">Chapters</div>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-list >
            <q-item v-for="(sentence, sentenceIndex) in sentences" :key="sentenceIndex">
                <q-item-section>
                  <div v-html="sentence.sentence"></div>
                </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
      <q-dialog v-model="sentenceModal" >
        <sentence-modal :sentence="activeChapter" @onUpdated="loadData" />
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
const sentenceModal = ref(false)
const activeChapter = ref(null)
const select = ref({})
const word = ref({
  id: null,
  word: '',
  lemma_id: '',
  lemma: '',
  language_id: ''
})
const lemmaModel = ref({})
const lemmaOptions = ref([])
const sentences = ref([])



const loadData = async function () {
  const wordItemResponse = await api.word.getItem({ word_id: route.params.word_id })
  if (wordItemResponse.error) {
    error.value = wordItemResponse
    return []
  }
  word.value = wordItemResponse
  lemmaModel.value = {
    id: wordItemResponse.lemma_id,
    lemma: wordItemResponse.lemma
  }
  getSentences()
}

const getSentences = async function () {
  const sentenceListResponse = await api.sentence.getList({ word: word.value.word, language_id: word.value.language_id })
  if (sentenceListResponse.error) {
    error.value = sentenceListResponse
    sentences.value = []
    return
  }
  sentences.value = sentenceListResponse
}

const saveWord = async function () {
  const wordSaveResponse = await api.word.saveItem(word.value)
  if (wordSaveResponse.error) {
    return false
  }
  await lemmatize(lemmaModel.value.lemma)
  return true
}
const lemmatize = async function (lemma) {
  const lemmaAddResponse = await api.lemma.lemmatize({ lemma: lemma, language_id: word.value.language_id, word: word.value.word })
  if (lemmaAddResponse.error) {
    return false
  }
  return true
}
const addLemma = async function (lemma) {
  const lemmaAddResponse = await api.lemma.saveItem({ lemma: lemma, language_id: word.value.language_id })
  if (lemmaAddResponse.error) {
    return
  }
  lemmaModel.value.id = lemmaAddResponse
  lemmaModel.value.lemma = lemma
  select.value.hidePopup()
}
const searchLemma = async function(val, update, abort) {
    const lemmaListResponse = await api.lemma.autocomplete({ filter: { lemma: val }})
    update(() => {
      if (lemmaListResponse.error) {
        lemmaOptions.value = []
      } else {
        lemmaOptions.value = lemmaListResponse
      }
    })
}

watch(() => lemmaModel.value.id, async (currentValue, oldValue) => {
  word.value.lemma_id = lemmaModel.value.id
  word.value.lemma = lemmaModel.value.lemma
  console.log(word.value)
})

onActivated(async () => {
  await loadData()
})

</script>
