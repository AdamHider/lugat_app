<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Select lemma:</div>
    </q-card-section>
    <q-card-section>
      <q-list>
        <q-item clickable v-for="(lemmaPrediction, lemmaPredictionIndex) in lemmaPredictions" :key="lemmaPredictionIndex"
          @click="(!lemmaPrediction.id) ? addLemma(lemmaPrediction.lemma) : lemmaModel = lemmaPrediction"
          :active="lemmaModel.lemma == lemmaPrediction.lemma"
          >
          <q-item-section avatar>
            <q-icon :name="(lemmaModel.lemma == lemmaPrediction.lemma) ? 'check' : 'lightbulb_outline'" :color="distanceColorMap[lemmaPrediction.distance]" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Prediction</q-item-label>
            <q-item-label>{{ lemmaPrediction.lemma }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label caption>
              Probability:
              <b v-if="lemmaPrediction.distance == 0" :class="`text-green-7`">High</b>
              <b v-if="lemmaPrediction.distance == 1" :class="`text-orange-7`">Medium</b>
              <b v-if="lemmaPrediction.distance == 2" :class="`text-red-7`">Low</b>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon color="primary" name="search" />
          </q-item-section>
          <q-item-section>
            <q-select
              ref="select"
              dense borderless
              v-model="lemmaModel"
              use-input hide-selected fill-input map-options
              input-debounce="200" option-value="id" option-label="lemma"
              label="Type lemma yourself..."
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
    <q-card-actions align="right">
      <q-btn flat label="Cancel" color="primary" v-close-popup />
      <q-btn flat label="Add" color="primary" :disabled="!lemmaModel.lemma" v-close-popup @click="saveChanges()" />
    </q-card-actions>
  </q-card>
</template>

<script setup >
import { api } from '../services/index'
import { ref, watch, onMounted, onActivated, toRefs } from 'vue'

const props = defineProps({
  word: Object,
  lemmas: Array
})
const { word: word, lemmas: lemmas } = toRefs(props)
const emits = defineEmits(['onChange'])

const select = ref({})
const error = ref('')
const lemmaModel = ref({id: null, lemma: ''})
const lemmaOptions = ref([])
const lemmaPredictions = ref([])
const selected = ref(false)


const distanceColorMap = ref(['green-7', 'orange-7', 'red-7'])

const loadData = async function () {
  if(!word.value.word || !word.value.language_id) return
  const lemmaListResponse = await api.lemma.predictList({ word: word.value.word, language_id: word.value.language_id })
  if (lemmaListResponse.error) {
    error.value = lemmaListResponse
    lemmaPredictions.value = []
    return
  }
  lemmaPredictions.value = filterPredictions(lemmaListResponse)
}


const filterPredictions = function (predictions) {
  var result = [];
  for(var i in predictions){
    if(lemmas.value.find(lemma => lemma.lemma == predictions[i].lemma)) continue;
    result.push(predictions[i])
  }
  return result
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
    const lemmaListResponse = await api.lemma.autocomplete({ filter: { lemma: val }, limit: 7, offset: 0})
    update(() => {
      if (lemmaListResponse.error) {
        lemmaOptions.value = []
      } else {
        lemmaOptions.value = lemmaListResponse
      }
    })
}


const saveChanges = function() {
  if(lemmaModel.value.id){
    emits('onChange', lemmaModel.value)
    selected.value = true
  }
  select.value.blur()
}

watch(word, async (currentValue, oldValue) => {
  lemmaModel.value.id = word.lemma_id
  lemmaModel.value.lemma = word.lemma
  await loadData()
})
onMounted(async () => {
  await loadData()
})

</script>
