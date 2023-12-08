<template>
  <q-page-wrapper>
    <q-page class="q-pa-sm">
      <q-card flat bordered class="q-my-sm">
          <q-card-section horizontal>
            <q-card-section class="full-width">
              <q-select
                v-model="data.source_language_id"
                :options="languages"
                emit-value
                map-options
                option-value="id"
                option-label="title"
                option-disable="inactive"
                label="Language"
                class="q-my-sm"
                dense
                outlined
              />
            </q-card-section>
            <q-card-section class="full-width">
              <q-select
                v-model="data.target_language_id"
                :options="targetLanguages"
                emit-value
                map-options
                option-value="id"
                option-label="title"
                option-disable="inactive"
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
          <q-btn flat color="primary" :to="`/translation/${getLang(data.source_language_id, 'id').title}-${getLang(data.target_language_id, 'id').title}/${data.token}`">
            Search!
          </q-btn>
        </q-card-actions>
      </q-card>
      <q-card flat bordered class="q-my-sm"  v-if="translations.length > 0">
          <q-card-section class="full-width">
            <div class="text-h6">Translations</div>
          </q-card-section>
          <q-card-section class="full-width">
            <q-list>
              <q-item  v-for="(translationGroup, translationGroupIndex) in translations" :key="translationGroupIndex">
                  <q-item-section>
                    <div class="row items-center">
                      <b v-if="translations.length > 1">{{ translationGroup.source_word }}</b>
                      <q-chip v-for="(translation, translationIndex) in translationGroup.translations" :key="translationIndex" >
                        {{translation.word}}
                      </q-chip>
                    </div>
                  </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
      </q-card>
      <q-card flat bordered class="q-my-sm" v-if="sentences.length> 0">
          <q-card-section class="full-width">
            <div class="text-h6">Examples of use</div>
              <q-list separator>
                <q-item v-for="(sentenceGroup, sentenceGroupIndex) in sentences" :key="sentenceGroupIndex"  active-class="bg-teal-1 text-green-8">
                  <q-item-section class="source-sentences">
                    <div>
                      <span v-for="(sourceChunk, sourceChunkIndex) in sentenceGroup.source_sentence" :key="sourceChunkIndex">
                        <router-link v-if="sourceChunk.type == 'link'"
                          v-html="sourceChunk.text"
                          :to="`/translation/${getLang(data.source_language_id, 'id').title}-${getLang(data.target_language_id, 'id').title}/${sourceChunk.text}`"
                        ></router-link>
                        <span v-else v-html="sourceChunk.text"></span>
                      </span>
                    </div>
                  </q-item-section>
                  <q-item-section class="target-sentences">
                    <div>
                      <span v-for="(targetChunk, targetChunkIndex) in sentenceGroup.target_sentence" :key="targetChunkIndex">
                        <router-link v-if="targetChunk.type == 'link'"
                          v-html="targetChunk.text"
                          :to="`/translation/${getLang(data.target_language_id, 'id').title}-${getLang(data.source_language_id, 'id').title}/${targetChunk.text}`"
                        ></router-link>
                        <span v-else v-html="targetChunk.text"></span>
                      </span>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
          </q-card-section>
      </q-card>
    </q-page>
  </q-page-wrapper>
</template>

<script setup >
import { api } from '../services/index'
import { ref, reactive, watch, onActivated, onMounted, onUpdated, onDeactivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const languages = [
  {
    title: 'qirimtatar',
    id: 1
  },
  {
    title: 'russian',
    id: 2
  }
]
const targetLanguages = ref([])

const data = reactive({
  token: '',
  source_language_id: 2,
  target_language_id: 1
})

const sentencesContainer = ref(null)
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
  translations.value = []
  if(data.token == '') return
  const translationListResponse = await api.word.getTranslations(data)
  if (translationListResponse.error) {
    translations.value = []
    return
  }
  let groups = groupBy(translationListResponse, 'source_word')
  for(var i in groups){
    translations.value.push({
      source_word: groups[i][0].source_word,
      translations: groups[i]
    })
  }
}
const getSentences = async function () {
  if(data.token == '') return
  const sentenceListResponse = await api.sentence.getPairList(data)
  if (sentenceListResponse.error) {
    sentences.value = []
    return
  }
  sentences.value = preprocessSentences(sentenceListResponse)
  console.log(sentences.value)
}

const preprocessSentences = function(sentences) {
  var result = [];
  for(var i in sentences){
    var sentence = {}
    for(var groupIndex in sentences[i]){
      sentence[groupIndex] = []
      var sentenceSplitted = sentences[i][groupIndex].split('<::>')
      for(var u in sentenceSplitted){
        if(sentenceSplitted[u].indexOf('<s>') > -1){
          sentence[groupIndex].push({
            type: 'link',
            text: sentenceSplitted[u].replace('<s>', '')
          })
        } else {
          sentence[groupIndex].push({
            type: 'text',
            text: sentenceSplitted[u]
          })
        }
      }
    }
    result.push(sentence)
  }
  return result
}

const getLang = function(value, key){
  return languages.find(language => language[key] == value)
}

const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

const targetLangsRecalc = function(){
  targetLanguages.value = []
  for(var i in languages){
    if(data.source_language_id == languages[i].id) continue
    targetLanguages.value.push(languages[[i]])
  }
}

const pathRecalc = function(){
  if(route.params.source_language) {
    data.source_language_id = getLang(route.params.source_language, 'title').id
  }
  if(route.params.target_language) {
    data.target_language_id = getLang(route.params.target_language, 'title').id
  }
  if(route.params.word) {
    data.token = route.params.word
  }
}

onActivated(() => {
  pathRecalc()
  targetLangsRecalc()
  search()
})

watch(() => data.source_language_id, async (currentValue, oldValue) => {
  if(currentValue == data.target_language_id){
    data.target_language_id = oldValue
  }
  targetLangsRecalc()
})

watch(() => route.params.word, async (currentValue, oldValue) => {
  pathRecalc()
  search()
})


</script>
<style>

.tagged{
  color: red;
}


</style>
