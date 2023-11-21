<template>
  <q-page class="bg-white q-pa-sm">
    <q-card flat bordered class="q-my-sm">
      <q-card-section horizontal>
        <q-card-section class="full-width">
          <div class="text-h6">Source Text</div>
          <q-select
            filled
            v-model="data.source.language_id"
            :options="options"
            emit-value
            map-options
            label="Language"
          />
          <q-input
            v-model="data.source.text"
            outlined
            type="textarea"
          />
        </q-card-section>
        <q-card-section  class="full-width">
          <div class="text-h6">Target text</div>
          <q-select
            filled
            v-model="data.target.language_id"
            :options="options"
            label="Language"
            emit-value
            map-options
          />
            <q-input
              v-model="data.target.text"
              outlined
              type="textarea"
            />
        </q-card-section>
      </q-card-section>

      <q-card-actions>
        <q-btn flat color="primary" @click="feed()">
          feed
        </q-btn>
      </q-card-actions>
    </q-card>
    <q-card flat bordered class="q-my-sm" v-if="tokens">
      <q-card-section horizontal>
        <q-card-section class="full-width" v-for="(language, langIndex) in tokens" :key="langIndex">
          <div class="text-h6">Source Text</div>
          <div>
            <q-chip
              v-for="(token, tokenIndex) in language" :key="tokenIndex"
              clickable
              @click="(activeGroup === null) ? setActiveGroup(token.id, langIndex) : relate(token.id, langIndex)"
              :color="checkChipColor(token.id, langIndex).color"
              :text-color="checkChipColor(token.id, langIndex).text"
            >
              {{ token.word }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card-section>
    </q-card>
    <q-card flat bordered class="q-my-sm" v-if="tokenRelations">
      <q-card-section v-if="activeGroup != null" >
        <q-btn :disable="!activeGroupIsCompleted" class="full-width" icon="done" color="positive" label="Confirm" @click="activeGroup = null"  />
      </q-card-section>
      <q-card-section>
        <q-list separator>
          <q-item v-for="(languages, relationIndex) in tokenRelations" :key="relationIndex"
            :active="activeGroup == relationIndex"
            active-class="bg-teal-1 text-green-8">
            <q-item-section v-for="(tokens, langIndex) in languages" :key="langIndex">
              <div>
                <q-chip  v-for="(token, tokenIndex) in tokens" :key="tokenIndex"
                  :color="(activeGroup == relationIndex) ? 'primary' : ''"
                  :text-color="(activeGroup == relationIndex) ? 'white' : ''"
                >
                  {{token.word}}
                </q-chip>
              </div>
            </q-item-section>
            <q-item-section side>
              <div class="q-gutter-sm" >
                <q-btn v-if="activeGroup != relationIndex" flat round icon="edit" @click="activeGroup = relationIndex"  />
                <q-btn v-if="activeGroup == relationIndex" flat round color="positive" icon="done" @click="activeGroup = null" />
                <q-btn flat  round color="negative" icon="delete_outline" @click="deleteGroup(relationIndex)" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <q-btn flat color="primary" @click="createGroup()">
          New group
        </q-btn>
      </q-card-section>

      <q-card-actions>
        <q-btn flat color="primary" @click="train()">
          Train
        </q-btn>
      </q-card-actions>
    </q-card>

  </q-page>
</template>

<script setup >
import { api } from '../services/index'
import { ref, reactive, watch, onMounted } from 'vue'
const options = [
  {
    label: 'Qirimtatar',
    value: 1
  },
  {
    label: 'Русский',
    value: 2
  }
]
const data = ref({
  source: {
    id: 0,
    text: 'Şimdi bunı yapam', // 'Men bala ekende, qartanamnıñ küçük teneke sandıçığı olğanını hatırlayım. Şu mavı-zumrut renklerge boyalanğan qutuçıqnıñ üstü tıpqı balaban sandıqlarda kibi, dögme köşeçiklerinen yaraştırılğan edi.',
    language_id: 1
  },
  target: {
    id: 0,
    text: 'Я сейчас это делаю', // 'Когда я была ребенком, у моей бабушки был небольшой жестяной сундучок, выкрашенный синe-изумрудными полосками, c декоративными выпуклостями, изображающими уголки-ковки, как у больших деревянных сундуков.'
    language_id: 2
  }
})
const trainingAnalysis = ref({})
const tokens = ref({})
const tokenRelations = ref([])
const activeGroup = ref(null)
const activeGroupIsCompleted = ref(false)


const loadData = async function () {
  const sentencePairResponse = await api.sentence.getPair({ source_language_id: data.value.source.language_id, target_language_id: data.value.target.language_id })
  if (sentencePairResponse.error) {
    data.value = {}
    return
  }
  data.value.source.id = sentencePairResponse.source_id
  data.value.source.text = sentencePairResponse.source_text
  data.value.target.id = sentencePairResponse.target_id
  data.value.target.text = sentencePairResponse.target_text
  analyze()
}

const analyze = async function () {
  await getTokens()
  await getTokenRelations()
}

const feed = async function () {
  const resp = await api.sentence.feed({})
  if (trainingAnalysisResponse.error) {
    return
  }
}

const getTokens = async function () {
  const tokenResponse = await api.token.getList({ source: data.value.source, target: data.value.target })
  if (tokenResponse.error) {
    tokens.value = {}
    return
  }
  let tokenList = groupBy(tokenResponse, 'language_id')
  tokens.value = tokenList
}
const getTokenRelations = async function () {
  const tokenRelationResponse = await api.token.predictList({ source: data.value.source, target: data.value.target })
  if (tokenRelationResponse.error) {
    tokenRelations.value = {}
    return
  }
  let tokenRelationList = tokenRelationResponse
  for(var i in tokenRelationList){
    tokenRelationList[i] = groupBy(tokenRelationList[i], 'language_id')
  }
  tokenRelations.value = tokenRelationList
}
const train = async function () {
  const isTrained = await api.tokenRelation.saveList(tokenRelations.value)
  if (isTrained) {
    tokens.value = {}
    tokenRelations.value = {}
    await api.sentence.setTrained({ id: data.value.source.id })
    await api.sentence.setTrained({ id: data.value.target.id })
  }
  await loadData()
}


const relate = function (tokenId, langId) {

  if (tokenId === null || activeGroup.value == null) return
  if (tokenRelations.value[activeGroup.value][langId].find(relation => relation.token_id == tokenId) === undefined) {
    // ADD MATCHED
    var token = tokens.value[langId].find(token => token.id == tokenId)
    token.token_id = token.id
    tokenRelations.value[activeGroup.value][langId].push(token)
  } else {
    // REMOVE MATCHED
    const matches = []
    for (const i in tokenRelations.value[activeGroup.value][langId]) {
      if (tokenRelations.value[activeGroup.value][langId][i].token_id != tokenId) {
        matches.push(tokenRelations.value[activeGroup.value][langId][i])
      }
    }
    tokenRelations.value[activeGroup.value][langId] = matches
  }
  if (tokenRelations.value[activeGroup.value][langId].length > 0 &&
    tokenRelations.value[activeGroup.value][langId].length > 0) {
    activeGroupIsCompleted.value = true
  } else {
    activeGroupIsCompleted.value = false
  }
}
const setActiveGroup = function (tokenId, langId) {

  if (tokenId === null || activeGroup.value !== null) return
  for (const i in tokenRelations.value) {
    if (tokenRelations.value[i][langId]?.find(relation => relation.token_id == tokenId)) {
      activeGroup.value = i
      return
    }
  }
  if (!activeGroup.value) {
    activeGroup.value = createGroup(langId)
    relate(tokenId, langId)
  }
}

const deleteGroup = function (groupIndex) {
  let groups = []
  for (const i in tokenRelations.value) {
    if (groupIndex != i) {
      groups.push(tokenRelations.value[i])
    }
  }
  if(groups.length == 0) activeGroup.value = null
  tokenRelations.value = groups
}
const createGroup = function (langId) {
  var keys = Object.keys(tokenRelations.value);
  var lastKey = 0
  if(keys.length > 0) lastKey = Math.max.apply(Math, keys)*1+1;
  tokenRelations.value[lastKey] = {}
  tokenRelations.value[lastKey][data.value.source.language_id] = []
  tokenRelations.value[lastKey][data.value.target.language_id] = []
  return lastKey
}

const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

const checkChipColor = function(tokenId, langIndex){
  var result = {
    color: 'transparent',
    text: 'black'
  }
  if (activeGroup.value && tokenRelations.value[activeGroup.value][langIndex]?.find(relation => relation?.token_id == tokenId)){
    result.color = 'primary'
    result.text = 'white'
  }
  return result
}

watch(() => data.value.source.language_id, async (currentValue, oldValue) => {
  if (data.value.source.language_id === data.value.target.language_id) {
    data.value.target.language_id = oldValue
  }
})
onMounted(async () => {
  // get initial data from server (1st page)
  await loadData()
})

</script>
