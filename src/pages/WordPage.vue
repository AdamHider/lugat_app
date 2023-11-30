<template>
  <q-page-wrapper>
    <q-app-header class="bg-white rounded-b-md bordered" reveal>
        <q-btn flat icon="arrow_back"  @click="$router.go(-1);" v:slot="back-button"/>
        <q-toolbar-title>Achievements</q-toolbar-title>
        <q-btn flat icon="check" :disabled="!isChanged" color="positive" @click="saveChanges()"/>
    </q-app-header>
    <q-page class="bg-white q-pa-sm">
      <q-card>
        <q-card-section>
          <div class="text-caption">{{ word.language }}</div>
          <div class="text-h6">{{ word.word }}</div>
          <div v-if="word.lemma" class="text-caption"><b>{{ word.lemma }}</b></div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-h6">Lemmas:</div>
          <q-list>
            <q-item v-for="(lemma, lemmaIndex) in lemmas" :key="lemmaIndex" clickable v-ripple>
              <q-item-section>
                <q-item-label>{{lemma.lemma}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-btn icon="add" @click="addLemmaModal = true">
            New lemma
          </q-btn>
        </q-card-section>
        <q-separator />
      </q-card>
      <q-card class="q-my-sm">
        <q-card-section>
          <div class="text-h6">Examples</div>
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
      <q-dialog v-model="addLemmaModal">
        <LemmaSelector :word="word"  @onChange="onLemmaChange"/>
      </q-dialog>
    </q-page>
  </q-page-wrapper>
</template>

<script setup >
import { api } from '../services/index'
import { ref, watch, onMounted, onActivated, reactive } from 'vue'
import { useRoute } from 'vue-router'
import LemmaSelector from '../components/LemmaSelector.vue'

const route = useRoute()
const error = ref(null)
const select = ref({})
const word = ref({})
const sentences = ref([])
const lemmas = ref([])
const isChanged = ref(false)
const addLemmaModal = ref(false)



const loadData = async function () {
  const wordItemResponse = await api.word.getItem({ word_id: route.params.word_id })
  if (wordItemResponse.error) {
    error.value = wordItemResponse
    return []
  }
  word.value = wordItemResponse
  getSentences()
  getLemmas()
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

const getLemmas = async function () {
  const lemmaListResponse = await api.lemma.getList({ word_id: route.params.word_id })
  if (lemmaListResponse.error) {
    error.value = lemmaListResponse
    lemmas.value = []
    return
  }
  lemmas.value = lemmaListResponse
}

const saveChanges = async function () {
  await linkLemmas()
  if(error) return
  const wordSaveResponse = await api.word.saveItem(word.value)
  if (wordSaveResponse.error) {
    return false
  }
  isChanged.value = false
  await loadData()
  return true
}

const linkLemmas = async function (lemma) {
  const linkLemmasResponse = await api.word.linkLemmas({ lemmas: lemmas.value, word_id: route.params.word_id })
  if (linkLemmasResponse.error) {
    error.value = linkLemmasResponse
    return
  }
}

const onLemmaChange = function (lemma) {
  lemmas.value.push(lemma)
  isChanged.value = true
}

onMounted(async () => {
  word.value = {}
  await loadData()
})

</script>
