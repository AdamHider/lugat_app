<template>
  <q-page-wrapper fullscreen>
    <AppBackgroundBubles :intense="isFocused"/>
    <q-app-header class="bg-transparent sticky" reveal centered>
      <TranslationLanguageToggle
        transparent
        :source_language_id="data.source_language_id"
        :target_language_id="data.target_language_id"
        @onChange="onLanguageChange"/>
    </q-app-header>
    <q-page class="q-pa-sm row content-center justify-center" style="transition: all 2s ease">
      <transition appear  enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
        <q-card  v-if="!isFocused" flat class="bg-transparent no-border q-ma-sm">
          <q-card-section align="center">
            <div class="text-h5 text-white"><b>Tap to search...</b></div>
            <div class="text-caption text-white"><b>The everything and get the answer!</b></div>
          </q-card-section>
          <q-card-section align="center">
            <q-btn
              class="search-button"
              color="white"
              flat
              round
              size="xl"
              :icon="(isFocused) ? 'close' : 'search'"
              :disable="isFocused"
              style="background: #ffffff20;"
              @click="isFocused = !isFocused"
            />
          </q-card-section>
        </q-card>
      </transition>
      <q-dialog v-model="isFocused" position="bottom">
        <TranslationSearchBar
          transparent
          :source_language_id="data.source_language_id"
          :target_language_id="data.target_language_id"
          :focused="isFocused"
          @onSubmit="search"
        />
        </q-dialog>
    </q-page>
  </q-page-wrapper>
</template>

<script setup >
import { ref, reactive, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TranslationLanguageToggle from '../components/TranslationLanguageToggle.vue'
import AppBackgroundBubles from '../components/AppBackgroundBubles.vue'
import TranslationSearchBar from '../components/TranslationSearchBar.vue'

const route = useRoute()
const router = useRouter()

const isFocused = ref(false)

const data = reactive({
  source_language_id: "1",
  target_language_id: "2"
})

const search = function (val) {
  router.push(`/translation/q=${val}&sl=${data.source_language_id}&tl=${data.target_language_id}`)
}

const onFocusChange = function(val){
  isFocused.value = val
  if(val) route.meta.bottomBarEnabled = false
}

const onLanguageChange = function(languages){
  data.source_language_id = languages.source_language_id
  data.target_language_id = languages.target_language_id
}

watch(() => isFocused.value, (currentValue, oldValue) => {
  if(currentValue) route.meta.bottomBarEnabled = false
})


</script>

<style scoped>

.search-button::before,
.search-button::after {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: transparent;
  border: 2px solid white;
  opacity: 0.5;
  transform: scale(1);
  content: '';


}
.search-button::before{
  animation: pulse 2s ease-out infinite;
}
.search-button::after {
  animation: pulse 2s 1s ease-out infinite ;
}

@keyframes pulse {
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style>
