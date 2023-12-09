<template>
  <q-page-wrapper fullscreen>
    <AppBackgroundBubles :intense="isFocused"/>
    <q-app-header class="bg-transparent sticky" reveal>
      <TranslationLanguageToggle :source_language_id="data.source_language_id" :target_language_id="data.target_language_id" @onChange="onLanguageChange"/>
    </q-app-header>
    <q-page class="q-pa-sm row column  content-around justify-end" style="transition: all 2s ease">
    <q-card v-if="isFocused && lemmaOptions.length>0" class="q-ma-md">
      <q-card-section  class="full-width">
        <q-list>
          <q-item clickable v-for="(lemmaPrediction, lemmaPredictionIndex) in lemmaOptions" :key="lemmaPredictionIndex">
            <q-item-section>
              <q-item-label caption>Lemma</q-item-label>
              <q-item-label>{{ lemmaPrediction.lemma }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
      <q-card flat bordered :class="`full-width q-my-sm bg-transparent no-border ${(isFocused) ? 'flex-item-0' : 'flex-item-0-5'} transition-0-5s`">
          <q-card-section v-if="!isFocused" align="center" class="q-pa-none">
            <div class="text-h5 text-white"><b>Explore the Dictionary</b></div>
            <div class="text-caption text-white"><b>The everything and get the answer!</b></div>
          </q-card-section>
          <q-card-section class="full-width">
            <q-input
              v-model="data.token"
              dark
              standout="bg-white text-primary"
              debounce="100"
              placeholder="Enter a word..."
              @keydown.enter.prevent="router.push(searchLink)"
              @update:model-value="autocomplete"
              class="no-box-shadow"
              @focus="isFocused=true"
              @blur="isFocused=false"
            >
              <template v-slot:append>
                <q-icon v-if="data.token != ''" name="close" @click="data.token = ''" class="cursor-pointer" />
                <q-btn flat  icon="search" :to="searchLink"/>
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

const data = reactive({
  token: '',
  source_language_id: 2,
  target_language_id: 1
})
const lemmaOptions = ref([])
const onLanguageChange = function(languages){
  data.source_language_id = languages.source_language_id
  data.target_language_id = languages.target_language_id
}

const searchLink = computed(() => {
  return `/translation/${getLanguage(data.source_language_id, 'id').title}-${getLanguage(data.target_language_id, 'id').title}/${data.token}`
})

const autocomplete = async function(val) {
    const lemmaListResponse = await api.lemma.autocomplete({ filter: { lemma: val }, limit: 7, offset: 0})
    if (lemmaListResponse.error) {
      lemmaOptions.value = []
    } else {
      lemmaOptions.value = lemmaListResponse
    }
}

</script>
<style>

.tagged{
  color: red;
}


</style>
