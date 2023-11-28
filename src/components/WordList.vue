<style>
.text-underline:hover{
  text-decoration: underline;
}
</style>
<template>
  <q-card flat class="q-pa-sm q-my-sm">
    <q-card-actions>
      <q-input borderless dense v-model="filterSet.filter" label="Search word ..."  debounce="500">
          <template v-slot:append>
            <q-icon v-if="filterSet.filter !== ''" name="close" @click="filterSet.filter = ''" class="cursor-pointer" />
            <q-icon name="search" />
          </template>
        </q-input>
    </q-card-actions>
  </q-card>
  <q-list bordered padding  >
    <q-infinite-scroll ref="infiniteScroll" @load="loadData" :offset="250">
        <q-item v-for="(word, wordIndex) in words" :key="wordIndex" clickable v-ripple :to="`/word-${word.id}`">
          <q-item-section>
            <q-item-label>{{word.word}}</q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>meta</q-item-label>
          </q-item-section>
        </q-item>
    </q-infinite-scroll>
  </q-list>
</template>

<script setup>
import { api } from '../services/index'
import { ref, watch, onMounted, onActivated, reactive } from 'vue'

const error = ref({})
const words = ref([])
const infiniteScroll = ref(null)
const isLoaded = ref(false)

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
  const wordListResponse = await api.word.getList({ filter: { search: filterSet.value.filter }, lemmaless: true, limit, offset })
  if (wordListResponse.error) {
    words.value = []
    error.value = wordListResponse
    isLoaded.value = true
    done()
    return
  }
  if(offset == 0){
    words.value = wordListResponse
  } else {
    words.value = [...words.value, ...wordListResponse];
  }
  isLoaded.value = false
  if(wordListResponse.length < limit)  isLoaded.value = true
  done()
}

onMounted(async () => {
  infiniteScroll.value.trigger()
})

watch(() => filterSet.value.filter, async (currentValue, oldValue) => {
  filter()
})
</script>
