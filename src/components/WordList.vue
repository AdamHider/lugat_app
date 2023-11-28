<style>
.text-underline:hover{
  text-decoration: underline;
}
</style>
<template>
  <q-card flat class="q-pa-sm q-my-sm">
    <q-card-actions>
      <q-input borderless dense v-model="filterSet.filter" label="Search book ..."  debounce="500">
          <template v-slot:append>
            <q-icon v-if="filterSet.filter !== ''" name="close" @click="filterSet.filter = ''" class="cursor-pointer" />
            <q-icon name="search" />
          </template>
        </q-input>
    </q-card-actions>
  </q-card>

  <q-list bordered padding  >
    <q-infinite-scroll ref="infiniteScroll" @load="loadData" :offset="250">
        <q-item v-for="(word, wordIndex) in words" :key="wordIndex" clickable v-ripple @click="wordModal = !wordModal; activeWord = word">
          <q-item-section>
            <q-item-label>{{word.word}}</q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>meta</q-item-label>
          </q-item-section>
        </q-item>
    </q-infinite-scroll>
  </q-list>

  <q-dialog v-model="wordModal">
        <q-card style="width: 700px; max-width: 80%;">
          <q-card-section>
            <div class="text-h6">{{ formData.word }}</div>
          </q-card-section>
          <q-separator />
          <q-card-section >
            <q-form class=" q-gutter-md">
              <q-select
                filled
                v-model="formData.lemma_id"
                use-input
                hide-selected
                fill-input
                emit-value
                map-options
                input-debounce="0"
                option-value="id"
                option-label="lemma"
                label="Lemma"
                :options="lemmaOptions"
                @filter="autocomplete"
                style="width: 250px"
                hint="Enter lemma..."
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-form>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn v-close-popup flat color="gray" label="Cancel" />
            <q-btn v-close-popup flat color="primary" label="Save" @click="saveWord()" />
          </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { api } from '../services/index'
import { ref, watch, onMounted, onActivated, reactive } from 'vue'

const error = ref({})
const words = ref([])
const wordModal = ref(false)
const activeWord = ref({})
const infiniteScroll = ref(null)
const isLoaded = ref(false)
const lemmaOptions = ref([])

const formData = ref({
  id: null,
  word: '',
  lemma_id: '',
  language_id: ''
})
const filterSet = ref({
  language_id: 1,
  filter: ''
})

const filter = function () {
  isLoaded.value = false
  infiniteScroll.value.reset()
  infiniteScroll.value.trigger()
}

const loadData = async function  (index, done) {
  if(isLoaded.value === true) return done()
  var limit = 15
  var offset = limit * (index-1)
  const bookListResponse = await api.word.getList({ filter: { search: filterSet.value.filter }, lemmaless: true, limit, offset })
  if (bookListResponse.error) {
    words.value = []
    error.value = bookListResponse
    isLoaded.value = true
    done()
    return
  }
  if(offset == 0){
    words.value = bookListResponse
  } else {
    words.value = [...words.value, ...bookListResponse];
  }
  isLoaded.value = false
  if(bookListResponse.length < limit)  isLoaded.value = true
  done()
}
const saveWord = async function () {
  const wordAddResponse = await api.word.saveItem(formData.value)
  if (wordAddResponse.error) {
    wordAddResponse.value = []
  }
  wordModal.value != wordModal.value
  loadData()
  return true
}
const autocomplete = async function(val, update, abort) {
  // call abort() at any time if you can't retrieve data somehow
    const lemmaListResponse = await api.lemma.autocomplete({ filter: { lemma: val }})
    update(() => {
      if (lemmaListResponse.error) {
        lemmaOptions.value = []
      } else {
        lemmaOptions.value = lemmaListResponse
      }
    })
}

onMounted(async () => {
  infiniteScroll.value.trigger()
})

watch(() => filterSet.value.filter, async (currentValue, oldValue) => {
  filter()
})
watch(() => wordModal.value, async (currentValue, oldValue) => {
  if(wordModal.value){
    formData.value = activeWord.value
  } else {
    formData.value = {}
  }
})
</script>
