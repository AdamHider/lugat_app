<template>
  <transition appear  enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
    <q-card flat :class="`full-width no-border no-border-radius ${(transparent) ? 'transparent-card' : ''}`" v-if="isFocused && wordOptions.length>0">
      <q-card-section class="full-width q-px-none"  >
        <q-list separator >
          <q-item v-ripple clickable v-for="(wordPrediction, wordPredictionIndex) in wordOptions" :key="wordPredictionIndex" @click="word = wordPrediction.word; submit()">
            <q-item-section top avatar>
              <q-avatar size="md">
                <q-img :src="getLanguage(wordPrediction.language_id, 'id')?.flag"></q-img>
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label :class="(transparent) ? 'text-white' : ''"><b v-html="wordPrediction.wordMarked"></b></q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </transition>
    <q-card flat :class="`full-width q-pa-sm no-border no-border-radius ${(transparent) ? 'transparent-card' : ''}`" style="padding-bottom: 60px;">
      <q-card-section class="full-width">
          <q-input
            ref="searchInput"
            v-model="word"
            :dark="transparent"
            debounce="100"
            autogrow
            @keydown.enter.prevent="submit()"
            @update:model-value="autocomplete"
            placeholder="Enter a word or a phrase..."
            class="no-box-shadow"
            :input-class="(transparent) ? '' : 'text-dark'"
            input-style="font-size: 18px; line-height: 1.5"
            @focus="focus"
            @blur="blur"
          >
            <template v-slot:append>
              <q-icon v-if="word != ''" name="close" @click="word = ''; clear()" :color="(transparent) ? ' white' : 'dark'" class="q-mr-sm cursor-pointer" />
              <q-btn v-if="!isFocused || word != ''" :flat="!isFocused" round :color="(isFocused) ? 'primary' : (transparent) ? ' white' : ''" icon="search" @click="submit()"/>
            </template>
          </q-input>
        </q-card-section>
    </q-card>
</template>

<script setup>
import { api } from '../services/index'
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useLanguage } from '../composables/useLanguage'

const { getLanguage } = useLanguage()
const searchInput = ref(null)
const wordOptions = ref([])
const word = ref('')

const props = defineProps({
  focused: Boolean,
  transparent: Boolean,
  source_language_id: String,
  target_language_id: String
});
const emit = defineEmits(["onFocusChange", "onSubmit"]);

const isFocused = ref(props.focused)

const autocomplete = async function(val) {
  if(val == '') return wordOptions.value = []
  const wordListResponse = await api.word.autocomplete({ filter: { word: val, source_language_id: props.source_language_id, target_language_id: props.target_language_id }, limit: 7, offset: 0})
  if (wordListResponse.error) {
    wordOptions.value = []
    return
  }
  for(var i in wordListResponse) {
    wordListResponse[i].wordMarked = wordListResponse[i].word.replace(val, `<b style="font-weight: 400">${val}</b>`)
  }
  wordOptions.value = wordListResponse
}

const clear = function () {
  wordOptions.value = []
  searchInput.value.focus()
}
const focus = function () {
  isFocused.value = true
}
const blur = function () {
  if(word.value == '') {
    wordOptions.value = []
    isFocused.value = false
  }  else {
    searchInput.value.focus()
    return false
  }
}
const submit = function () {
  emit("onSubmit", word.value);
}
onMounted(() => {
  if(isFocused.value == true) setTimeout(()=> {searchInput.value.focus()} , 0)
})
watch(() => isFocused.value, (currentValue, oldValue) => {
  emit("onFocusChange", currentValue);
})

watch(() => props.source_language_id, (currentValue, oldValue) => {
  word.value = "";
  searchInput.value.blur()
})
watch(() => props.target_language_id, (currentValue, oldValue) => {
  word.value = "";
  searchInput.value.blur()
})

</script>

<style scoped>
.transparent-card{
  background-color: #ffffff30;
  backdrop-filter: blur(3px);
}
</style>
