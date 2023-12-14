<template>
  <q-page-wrapper>
    <q-app-header class="bg-transparent sticky" reveal centered>
      <TranslationLanguageToggle :source_language_id="data.source_language_id" :target_language_id="data.target_language_id" @onChange="onLanguageChange"/>
    </q-app-header>
    <q-page class="q-pa-sm">
      <div class="text-h5 q-ma-sm">{{ route.params.word }}</div>
      <TranslationList :source_language_id="data.source_language_id" :target_language_id="data.target_language_id"/>
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
                          :to="`/translation/q=${sourceChunk.text}&sl=${data.source_language_id}&tl=${data.target_language_id}`"
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
                          :to="`/translation/q=${targetChunk.text}&sl=${data.target_language_id}&tl=${data.source_language_id}`"
                        ></router-link>
                        <span v-else v-html="targetChunk.text"></span>
                      </span>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
          </q-card-section>
      </q-card>
        <q-page-sticky position="bottom-right" :offset="[10, 18]">
      <transition
        appear
        enter-active-class="animated fadeInRight"
        leave-active-class="animated fadeOutRight"
      >
          <q-btn v-if="!isFocused"
            class="search-button"
            color="primary"
            round
            size="lg"
            :icon="(isFocused) ? 'close' : 'search'"
            :disable="isFocused"
            style="background: #ffffff20;"
            @click="isFocused = !isFocused"
          />
      </transition>
        </q-page-sticky>
      <q-dialog v-model="isFocused" position="bottom">
        <TranslationSearchBar
          :source_language_id="data.source_language_id"
          :target_language_id="data.target_language_id"
          :focused="isFocused"
          @onFocusChange="isFocused = $event.value"
          @onSubmit="onSubmit"
        />
        </q-dialog>
    </q-page>
  </q-page-wrapper>
</template>

<script setup >
import { api } from '../services/index'
import { ref, reactive, watch, onActivated, onMounted, onUpdated, onDeactivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLanguage } from '../composables/useLanguage'
import TranslationLanguageToggle from '../components/TranslationLanguageToggle.vue'
import TranslationSearchBar from '../components/TranslationSearchBar.vue'
import TranslationList from '../components/TranslationList.vue'

const { getLanguage } = useLanguage()
const route = useRoute()
const router = useRouter()

const isFocused = ref(false)
const data = reactive({
  token: '',
  source_language_id: "1",
  target_language_id: "2"
})

const sentencesContainer = ref(null)
const translationData = ref({})
const sentences = ref([])

const predict = async function () {
  const translationResponse = await api.translator.predict(data)
  if (translationResponse.error) {
    translationData.value = {}
    return
  }
  translationData.value = translationResponse
}

const onSubmit = function (val) {
  router.push(`/translation/q=${val}&sl=${data.source_language_id}&tl=${data.target_language_id}`)
}
const search = async function(){
  await getSentences()
}

const getSentences = async function () {
  if(!route.params.word) return
  const sentenceListResponse = await api.sentence.getPairList({
    query: route.params.word,
    source_language_id: route.params.source_language_id,
    target_language_id: route.params.target_language_id,
  })
  if (sentenceListResponse.error) {
    sentences.value = []
    return
  }
  sentences.value = preprocessSentences(sentenceListResponse)
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

const pathRecalc = function(){
  if(route.params.source_language_id) {
    data.source_language_id = route.params.source_language_id
  }
  if(route.params.target_language_id) {
    data.target_language_id = route.params.target_language_id
  }
  if(route.params.word) {
    data.token = route.params.word
  }
}

const onLanguageChange = function(languages){
  data.source_language_id = languages.source_language_id
  data.target_language_id = languages.target_language_id
  router.push(`/translation/q=${route.params.word}&sl=${data.source_language_id}&tl=${data.target_language_id}`)
}

onActivated(() => {
  pathRecalc()
  search()
})

watch(() => route.params, async (currentValue, oldValue) => {
  pathRecalc()
  search()
})

</script>
