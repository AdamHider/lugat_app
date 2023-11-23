<template>
  <q-page class="bg-white q-pa-sm">
    <q-card flat bordered class="q-my-sm" v-if="tokenRelations">
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="loadData()">
          Reload
        </q-btn>
        <q-btn flat color="primary" @click="feed()">
          Reset All
        </q-btn>
        <q-btn flat color="primary" @click="train()" :disable="tokenRelations.length === 0">
          Reset
        </q-btn>
        <q-btn  color="primary" @click="train()" icon="check" :disable="tokenRelations.length === 0">
          Save
        </q-btn>
      </q-card-actions>
    </q-card>
    <q-card flat bordered class="q-my-sm">
      <q-card-section>
        <q-card-section horizontal>
          <q-card-section class="full-width">
            <div class="text-caption">Source text</div>
            <div class="text-h6">{{ data.source.text }}</div>
          </q-card-section>
          <q-card-section  class="full-width">
            <div class="text-caption">Target text</div>
            <div class="text-h6">{{ data.target.text }}</div>
          </q-card-section>
        </q-card-section>
      </q-card-section>
      <q-separator />
      <q-card-section  v-if="tokens">
        <q-card-section horizontal>
          <q-card-section bordered class="full-width" v-for="(language, langId) in tokens" :key="langId">
              <q-chip
                v-for="(token, tokenIndex) in language" :key="tokenIndex"
                clickable
                @mouseover="lightUpGroup(token.id, langId)"
                @mouseout="tokenRelationsHighlighted={}"
                @click="(activeGroup === null) ? setActiveGroup(token.id, langId) : relate(token.id, langId)"
                :text-color="(activeGroup !== null && tokenRelations[activeGroup][langId]?.find(t => token?.id == t.token_id) ) ? 'white' : 'gray-7'"
                :color="(activeGroup !== null && tokenRelations[activeGroup][langId]?.find(t => token?.id == t.token_id) ) ? tokenRelationsColors[activeGroup] : 'transparent'"
              >
                <b>{{ token.word }}</b>
                <q-badge v-if="tokenCount[token.id]" floating rounded color="red" :label="tokenCount[token.id]" />
              </q-chip>
          </q-card-section>
        </q-card-section>
      </q-card-section>
      <q-separator  />
      <q-card-section v-if="tokenRelations">
        <q-card-section  class="q-pa-none">
          <q-list separator>
            <q-item v-for="(languages, relationIndex) in tokenRelations" :key="relationIndex"
              v-show="!tokenRelationsHidden[relationIndex]"
              :active="activeGroup == relationIndex"
              :class="(tokenRelationsHighlighted[relationIndex]) ? `bg-${tokenRelationsHighlighted[relationIndex]}` : ''"
              active-class="bg-teal-1 text-green-8">
              <q-item-section avatar >
                <q-avatar icon="fiber_manual_record" :text-color="tokenRelationsColors[relationIndex]" />
              </q-item-section>
              <q-item-section v-for="(tokens, langIndex) in languages" :key="langIndex">
                <div>
                  <q-chip  v-for="(token, tokenIndex) in tokens" :key="tokenIndex"
                    :outline="(activeGroup != relationIndex)"
                    :color="tokenRelationsColors[relationIndex]"
                    :text-color="(activeGroup != relationIndex) ? tokenRelationsColors[relationIndex] : 'white'"
                  >
                    <b>{{token.word}}</b>
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
        </q-card-section>
      </q-card-section>
      <q-card-actions>
        <q-btn class="full-width" flat color="primary" @click="createGroup()" icon="add">
          New group
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

const colors = ref([
  'red-7',
  'pink-7',
  'purple-7',
  'deep-purple-7',
  'indigo-7',
  'light-blue-7',
  'cyan-7',
  'teal-10',
  'green-7',
  'light-green-7',
  'lime-7',
  'yellow-9',
  'orange-7',
  'deep-orange-7',
  'brown-7',
])
const tokenRelationsColors = ref({})
const tokenRelationsHidden = ref({})
const tokenRelationsHighlighted = ref({})
const tokenCount = ref({})


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
    tokenRelations.value = []
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
    tokenRelations.value[activeGroup.value][langId].sort((a, b) => parseFloat(a.index) - parseFloat(b.index));
    tokenCount.value[tokenId]++
  } else {
    // REMOVE MATCHED
    const matches = []
    for (const i in tokenRelations.value[activeGroup.value][langId]) {
      if (tokenRelations.value[activeGroup.value][langId][i].token_id != tokenId) {
        matches.push(tokenRelations.value[activeGroup.value][langId][i])
      }
    }
    tokenRelations.value[activeGroup.value][langId] = matches
    tokenCount.value[tokenId]--
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
    }
  }
  if (!activeGroup.value) {
    activeGroup.value = createGroup(langId)
    relate(tokenId, langId)
  }
}


const deleteGroup = function (groupIndex) {
  let groups = []
  let colors = []
  for (const i in tokenRelations.value) {
    if (groupIndex != i) {
      groups.push(tokenRelations.value[i])
      colors.push(tokenRelationsColors.value[i])
    }
  }
  activeGroup.value = null
  tokenRelations.value = groups
  tokenRelationsColors.value = colors

}
const createGroup = function (langId) {
  var keys = Object.keys(tokenRelations.value);
  var lastKey = 0
  if(keys.length > 0) lastKey = Math.max.apply(Math, keys)*1+1;
  tokenRelations.value[lastKey] = {}
  tokenRelations.value[lastKey][data.value.source.language_id] = []
  tokenRelations.value[lastKey][data.value.target.language_id] = []
  activeGroup.value = lastKey
  return lastKey
}

const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

const colorizeRelations = function(){
  for(var index in tokenRelations.value){
    if(!tokenRelationsColors.value[index]){
      let colorIndex = Math.floor(Math.random() * colors.value.length)
      var color = colors.value[colorIndex]
      colors.value.splice(colorIndex, 1);
    } else {
      var color = tokenRelationsColors.value[index]
    }
    tokenRelationsColors.value[index] = color
  }
}

const lightUpGroup = function (tokenId, langId) {
  tokenRelationsHighlighted.value = {}
  for (const i in tokenRelations.value) {
    if (tokenRelations.value[i][langId]?.find(relation => relation.token_id == tokenId)) {
      var colorChunks = tokenRelationsColors.value[i].split('-')
      colorChunks.pop()
      tokenRelationsHighlighted.value[i] = colorChunks.join('-')+'-1'
    } else {
      tokenRelationsHighlighted.value[i] = false
    }
  }
}
const countTokens = function () {
  tokenCount.value = {}
  for (const t in tokenRelations.value) {
    for (const langId in tokenRelations.value[t]) {
      var group = tokenRelations.value[t][langId]
      for (const i in tokens.value[langId]) {
        var token = tokens.value[langId][i]
        if(!tokenCount.value[token.id] ) tokenCount.value[token.id] = 0
        if (group?.find(relation => relation.token_id === token.id)) {
          console.log(token.id)
          tokenCount.value[token.id] = tokenCount.value[token.id]+1
        }
      }
    }
  }
}




watch(() => tokenRelations.value, async (currentValue, oldValue) => {
  colorizeRelations()
  countTokens()
}, { deep: true })

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

<style scoped>
.q-badge{
  top: -10px;
  right: -8px;
}
.highlighted{
  background-color: black;
}
</style>
