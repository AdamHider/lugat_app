<template>
  <q-page-wrapper fullscreen>
    <AppBackgroundBubles :intense="isFocused"/>
    <q-app-header class="bg-transparent sticky" reveal>
      <TranslationLanguageToggle :sourceLang="data.source_language_id" :targetLang="data.target_language_id"/>
    </q-app-header>
    <q-page class="q-pa-sm row content-center justify-around">
      <q-card flat bordered class="q-my-sm bg-transparent no-border">
          <q-card-section align="center" class="q-pa-none">
            <div class="text-h5 text-white"><b>Dictionary</b></div>
            <div class="text-caption text-white"><b>The best of the best</b></div>
          </q-card-section>
          <q-card-section class="full-width">
            <q-input
              v-model="data.token"
              dark
              standout="bg-white text-primary"
              clearable
              debounce="500"
              placeholder="Enter a word..."
              class="no-box-shadow"
              @focus="isFocused=true"
              @blur="isFocused=false"
            >
              <template v-slot:append>
                <q-btn flat  icon="search" :to="`/translation/${getLang(data.source_language_id, 'id').title}-${getLang(data.target_language_id, 'id').title}/${data.token}`"/>
              </template>
            </q-input>
          </q-card-section>
      </q-card>
    </q-page>
  </q-page-wrapper>
</template>

<script setup >
import { api } from '../services/index'
import { ref, reactive, watch, onActivated, onMounted, onUpdated, onDeactivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TranslationLanguageToggle from '../components/TranslationLanguageToggle.vue'
import AppBackgroundStars from '../components/AppBackgroundStars.vue'
import AppBackgroundBubles from '../components/AppBackgroundBubles.vue'

const route = useRoute()
const router = useRouter()

const isFocused = ref(false)

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
  search()
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
