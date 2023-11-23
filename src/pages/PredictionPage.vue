<template>
  <q-page class="bg-white q-pa-sm">
    <q-card flat bordered class="q-my-sm">
        <q-card-section horizontal>
          <q-card-section class="full-width">
            <q-select
              v-model="data.source_language_id"
              :options="options"
              emit-value
              map-options
              label="Language"
              class="q-my-sm"
              dense
              outlined
            />
          </q-card-section>
          <q-card-section class="full-width">
            <q-select
              v-model="data.target_language_id"
              :options="options"
              emit-value
              map-options
              label="Language"
              class="q-my-sm"
              dense
              outlined
            />
          </q-card-section>
        </q-card-section>
        <q-card-section class="full-width">
          <q-input
            v-model="data.token"
            debounce="500"
            outlined
            placeholder="Enter a word..."
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
      <q-card-actions>
        <q-btn flat color="primary" @click="search()">
          Search!
        </q-btn>
      </q-card-actions>
    </q-card>
    <q-card flat bordered class="q-my-sm"  v-if="translations.length > 0">
        <q-card-section class="full-width">
          <q-chip v-for="(translation, translationIndex) in translations" :key="translationIndex" >
            {{translation.word}}
          </q-chip>
        </q-card-section>
    </q-card>
    <q-card flat bordered class="q-my-sm" v-if="sentences.length> 0">
        <q-card-section class="full-width">
          <div class="text-h6">Examples of use</div>
            <q-list separator>
              <q-item v-for="(sentenceGroup, sentenceGroupIndex) in sentences" :key="sentenceGroupIndex"  active-class="bg-teal-1 text-green-8">
                <q-item-section>
                  <div v-html="sentenceGroup.source_sentence"></div>
                </q-item-section>
                <q-item-section>
                  <div v-html="sentenceGroup.target_sentence"></div>
                </q-item-section>
              </q-item>
            </q-list>
        </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup >
import { api } from '../services/index'
import { ref, reactive, watch } from 'vue'

const options = [
  {
    label: 'Qirimtatar',
    value: 1
  },
  {
    label: 'Русский',
    value: 2
  }
]

const data = reactive({
  token: '',
  source_language_id: 2,
  target_language_id: 1
})

const translationData = ref({})
const translations = ref([])
const sentences = ref([])

const predict = async function () {
  const translationResponse = await api.translator.predict(data)
  if (translationResponse.error) {
    translationData.value = {}
    return
  }
  translationData.value = translationResponse
}

const search = async function(){
  await getTranslations()
  await getSentences()
}

const getTranslations = async function () {
  if(data.token == '') return
  const translationListResponse = await api.word.getTranslations(data)
  if (translationListResponse.error) {
    translations.value = []
    return
  }
  translations.value = translationListResponse
}
const getSentences = async function () {
  if(data.token == '') return
  const sentenceListResponse = await api.sentence.getPairList(data)
  if (sentenceListResponse.error) {
    sentences.value = []
    return
  }
  sentences.value = sentenceListResponse
}

watch(() => data.source_language_id, async (currentValue, oldValue) => {
  if (currentValue === data.target_language_id) {
    data.target_language_id = oldValue
  }
})

</script>
<style>

.tagged{
  color: red;
}

</style>
