<template>
  <q-page-wrapper fullscreen>
    <AppBackgroundBubles :intense="isFocused"/>
    <q-app-header class="bg-transparent sticky" reveal>
      <TranslationLanguageToggle :source_language_id="data.source_language_id" :target_language_id="data.target_language_id" @onChange="onLanguageChange"/>
    </q-app-header>
    <q-page class="q-pa-sm row column  content-around justify-end" style="transition: all 2s ease">
    <q-card v-if="isFocused && wordOptions.length>0" class="q-ma-sm">
      <q-card-section class="full-width q-px-none">
        <q-list >
          <q-item v-ripple clickable v-for="(wordPrediction, wordPredictionIndex) in wordOptions" :key="wordPredictionIndex">
            <q-item-section top avatar>
              <q-avatar size="md">
                <q-img :src="getLanguage(wordPrediction.language_id, 'id')?.flag"></q-img>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label><b v-html="wordPrediction.wordMarked"></b></q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
    <q-card v-else flat class="bg-transparent no-border q-ma-sm">
      <q-card-section align="center">
        <div class="text-h5 text-white"><b>Explore the Dictionary</b></div>
        <div class="text-caption text-white"><b>The everything and get the answer!</b></div>
      </q-card-section>
    </q-card>
      <q-card flat :class="`full-width q-my-sm bg-transparent no-border ${(isFocused) ? 'flex-item-0' : 'flex-item-0-5'} transition-0-5s`">
          <q-card-section class="full-width q-pa-sm">
            <q-input
              ref="searchInput"
              v-model="data.token"
              dark
              standout="bg-white text-primary"
              debounce="100"
              placeholder="Enter a word..."
              @keydown.enter.prevent="router.push(searchLink)"
              @update:model-value="autocomplete"
              class="no-box-shadow"
              @focus="isFocused=true"
              @blur="blurInput"
            >
              <template v-slot:append>
                <q-icon v-if="data.token != ''" name="close" @click="data.token = ''; clearInput()" class="q-mr-sm cursor-pointer" />
                <q-btn v-if="!isFocused" flat  icon="search" :to="searchLink"/>
              </template>
            </q-input>
          </q-card-section>
      </q-card>
    </q-page>
  </q-page-wrapper>
</template>

<script setup >
import { api } from '../services/index'
import { ref, reactive, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TranslationLanguageToggle from '../components/TranslationLanguageToggle.vue'
import AppBackgroundStars from '../components/AppBackgroundStars.vue'
import AppBackgroundBubles from '../components/AppBackgroundBubles.vue'
import { useLanguage } from '../composables/useLanguage'

const route = useRoute()
const router = useRouter()
const { getLanguage } = useLanguage()

const isFocused = ref(false)
const searchInput = ref(null)

const data = reactive({
  token: '',
  source_language_id: "2",
  target_language_id: "1"
})
const wordOptions = ref([])
const onLanguageChange = function(languages){
  data.source_language_id = languages.source_language_id
  data.target_language_id = languages.target_language_id
}

const searchLink = computed(() => {
  return `/translation/${getLanguage(data.source_language_id, 'id')?.title}-${getLanguage(data.target_language_id, 'id')?.title}/${data.token}`
})

const autocomplete = async function(val) {
  if(val == '') return wordOptions.value = []
  const wordListResponse = await api.word.autocomplete({ filter: { word: val }, limit: 7, offset: 0})
  if (wordListResponse.error) {
    wordOptions.value = []
    return
  }
  for(var i in wordListResponse) {
    wordListResponse[i].wordMarked = wordListResponse[i].word.replace(val, `<b style="font-weight: 400">${val}</b>`)
  }
  wordOptions.value = wordListResponse
}

const clearInput = function () {
  wordOptions.value = []
  searchInput.value.blur()
}
const blurInput = function () {
  if(data.token == '') {
    wordOptions.value = []
    isFocused.value = false
  }  else {
    searchInput.value.focus()
    return false
  }
}



</script>
<style>

.tagged{
  color: red;
}


</style>
