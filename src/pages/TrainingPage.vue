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
        <q-btn flat color="primary" @click="analyze()">
          Analyze
        </q-btn>
        <q-btn flat color="primary" @click="feed()">
          Feed
        </q-btn>
      </q-card-actions>
    </q-card>
    <q-card flat bordered class="q-my-sm" v-if="trainingAnalysis.matches">
      <q-card-section horizontal>
        <q-card-section class="full-width">
          <div class="text-h6">Source Text</div>
          <div v-if="trainingAnalysis?.tokens[data.source.language_id]">
            <q-chip
              v-for="(sourceToken, sourceTokenIndex) in trainingAnalysis?.tokens[data.source.language_id]" :key="sourceTokenIndex"
              clickable
              @click="(activeMatchGroup === null) ? setActiveGroup(sourceTokenIndex, data.source.language_id) : relate(sourceTokenIndex, data.source.language_id)"
              :color="(trainingAnalysis.matches[activeMatchGroup]?.[data.source.language_id].neurons?.find(group => group.index === sourceTokenIndex)) ? 'primary' : 'transparent'"
              :text-color="(trainingAnalysis.matches[activeMatchGroup]?.[data.source.language_id].neurons?.find(group => group.index === sourceTokenIndex)) ? 'white' : ''"
            >
              {{ sourceToken }}
            </q-chip>
          </div>
        </q-card-section>
        <q-card-section  class="full-width">
          <div class="text-h6">Target text</div>
            <div v-if="trainingAnalysis?.tokens[data.target.language_id]">
              <q-chip
                v-for="(targetSentenceToken, targetTokenIndex) in trainingAnalysis?.tokens[data.target.language_id]" :key="targetTokenIndex"
                clickable
                @click="(activeMatchGroup === null) ? setActiveGroup(targetTokenIndex, data.target.language_id) : relate(targetTokenIndex, data.target.language_id)"
                :color="(trainingAnalysis.matches[activeMatchGroup]?.[data.target.language_id].neurons?.find(group => group.index === targetTokenIndex)) ? 'primary' : 'transparent'"
                :text-color="(trainingAnalysis.matches[activeMatchGroup]?.[data.target.language_id].neurons?.find(group => group.index === targetTokenIndex)) ? 'white' : ''"
              >
                {{ targetSentenceToken }}
              </q-chip>
            </div>
        </q-card-section>
      </q-card-section>
      <q-card-section v-if="activeMatchGroup != null" >
        <q-btn :disable="!activeMatchGroupIsCompleted" class="full-width" icon="done" color="positive" label="Confirm" @click="activeMatchGroup = null"  />
      </q-card-section>

      <q-card-section>
        <q-list separator>
          <q-item v-for="(match, matchIndex) in trainingAnalysis?.matches" :key="matchIndex"
            :active="activeMatchGroup == matchIndex"
            active-class="bg-teal-1 text-green-8">
            <q-item-section v-for="(neuronGroup, languageId) in match" :key="languageId">
              <div>
                <q-chip  v-for="(neuron, neuronIndex) in neuronGroup.neurons" :key="neuronIndex"
                  :color="(activeMatchGroup == matchIndex) ? 'primary' : ''"
                  :text-color="(activeMatchGroup == matchIndex) ? 'white' : ''"
                >
                  {{neuron.core}}
                </q-chip>
              </div>
              <div>
                <span>
                  <q-checkbox v-if="neuronGroup.neurons.length > 1"
                    v-model="neuronGroup.isFixedPosition"
                    size="sm"
                    :disable="activeMatchGroup != matchIndex"
                    checked-icon="lock"
                    unchecked-icon="lock_open"
                    label="Position"
                  />
                </span>
              </div>
            </q-item-section>
            <q-item-section side>
              <div class="q-gutter-sm" >
                <q-btn v-if="activeMatchGroup != matchIndex" flat round icon="edit" @click="activeMatchGroup = matchIndex"  />
                <q-btn v-if="activeMatchGroup == matchIndex" flat round color="positive" icon="done" @click="activeMatchGroup = null" />
                <q-btn flat  round color="negative" icon="delete_outline" @click="deleteGroup(matchIndex)" />
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
    language_id: 4
  },
  target: {
    id: 0,
    text: 'Я сейчас это делаю', // 'Когда я была ребенком, у моей бабушки был небольшой жестяной сундучок, выкрашенный синe-изумрудными полосками, c декоративными выпуклостями, изображающими уголки-ковки, как у больших деревянных сундуков.'
    language_id: 2
  }
})
const trainingAnalysis = ref({})
const activeMatchGroup = ref(null)
const activeMatchGroupIsCompleted = ref(false)

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
}

const analyze = async function () {
  const trainingAnalysisResponse = await api.translator.analyze(data.value)
  if (trainingAnalysisResponse.error) {
    trainingAnalysis.value = {}
    return
  }
  trainingAnalysis.value = trainingAnalysisResponse
}
const feed = async function () {
  const feedResponse = await api.translator.feed(1)
}
const relate = function (tokenIndex, languageId) {
  if (tokenIndex === null || activeMatchGroup.value == null) return
  if (trainingAnalysis.value.matches[activeMatchGroup.value][languageId].neurons.find(group => group.index === tokenIndex) === undefined) {
    // ADD MATCHED
    trainingAnalysis.value.matches[activeMatchGroup.value][languageId].neurons.push({
      core: trainingAnalysis.value.tokens[languageId][tokenIndex],
      position: null,
      index: tokenIndex
    })
  } else {
    // REMOVE MATCHED
    const matches = []
    for (const i in trainingAnalysis.value.matches[activeMatchGroup.value][languageId].neurons) {
      if (trainingAnalysis.value.matches[activeMatchGroup.value][languageId].neurons[i].index !== tokenIndex) {
        matches.push(trainingAnalysis.value.matches[activeMatchGroup.value][languageId].neurons[i])
      }
    }
    trainingAnalysis.value.matches[activeMatchGroup.value][languageId].neurons = matches
  }
  if (trainingAnalysis.value.matches[activeMatchGroup.value][data.value.source.language_id].neurons.length > 0 &&
      trainingAnalysis.value.matches[activeMatchGroup.value][data.value.target.language_id].neurons.length > 0) {
    activeMatchGroupIsCompleted.value = true
  } else {
    activeMatchGroupIsCompleted.value = false
  }
}
const setActiveGroup = function (tokenIndex, languageId) {
  if (tokenIndex === null || activeMatchGroup.value !== null) return
  for (const i in trainingAnalysis.value.matches) {
    if (trainingAnalysis.value.matches[i][languageId].neurons.find(neuron => neuron.index === tokenIndex)) {
      activeMatchGroup.value = i
      return
    }
  }
  if (!activeMatchGroup.value) {
    activeMatchGroup.value = createGroup() - 1
    relate(tokenIndex, languageId)
  }
}

const deleteGroup = function (groupIndex) {
  const groups = []
  for (const i in trainingAnalysis.value.matches) {
    if (groupIndex != i * 1) {
      groups.push(trainingAnalysis.value.matches[i])
    }
  }
  trainingAnalysis.value.matches = groups
}
const createGroup = function () {
  const group = {}
  group[data.value.source.language_id] = { neurons: [], isFixedPosition: false }
  group[data.value.target.language_id] = { neurons: [], isFixedPosition: false }
  return trainingAnalysis.value.matches.push(group)
}
const train = async function () {
  trainingAnalysis.value.source_id = data.value.source.id
  trainingAnalysis.value.target_id = data.value.target.id
  const isTrained = await api.translator.train(trainingAnalysis.value)
  if (isTrained) {
    trainingAnalysis.value = {}
    await api.sentence.setTrained({ id: data.value.source.id })
    await api.sentence.setTrained({ id: data.value.target.id })
  }
  await loadData()
}

watch(() => data.value.source.language_id, async (currentValue, oldValue) => {
  if (data.value.source.language_id === data.value.target.language_id) {
    data.value.target.language_id = oldValue
  }
})
onMounted(async () => {
  // get initial data from server (1st page)
  // await loadData()
})

</script>
