<template>
  <q-card flat bordered class="q-my-sm"  >
      <q-card-section class="full-width q-pa-none">
        <q-list>
          <q-item  v-for="(translationGroup, translationGroupIndex) in translations" :key="translationGroupIndex">
            <q-item-section>
              <div class="row items-center">
                <b v-if="translations.length > 1">{{ translationGroup.sourceWord }}</b>
                <span v-for="(lemma, lemmaIndex) in translationGroup.lemmas" :key="lemmaIndex" >
                  <span v-if="lemma.is_lemma">
                    <q-chip clickable>
                      {{lemma.targetLemma}}
                      <q-menu>
                        <div class="row no-wrap q-pa-md">
                          <q-chip color="secondary" v-for="(inflection, inflectionIndex) in lemma.inflections" :key="inflectionIndex">
                            <q-avatar >{{ inflection.frequency }}</q-avatar>
                            {{inflection.word}}
                          </q-chip>
                        </div>
                      </q-menu>
                    </q-chip>
                  </span>
                  <span v-else>
                    <q-chip color="secondary" text-color="white">
                      <q-avatar>{{ lemma.frequency }}</q-avatar>
                      {{lemma.targetLemma}}
                    </q-chip>
                  </span>
                </span>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
  </q-card>
</template>

<script setup>
import { api } from '../services/index'
import { ref, watch, onActivated } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  source_language_id: String,
  target_language_id: String
});
const translations = ref([])

const getTranslations = async function () {
  translations.value = []
  if(!route.params.word) return
  const translationListResponse = await api.word.getTranslations({
    query: route.params.word,
    source_language_id: route.params.source_language_id,
    target_language_id: route.params.target_language_id,
  })
  if (translationListResponse.error) {
    translations.value = []
    return
  }
  translations.value = prepareTranslations(translationListResponse)
}

const prepareTranslations = function (translationList) {
  var result = []
  let groups = groupBy(translationList, 'source_word')
  for(var i in groups){
    let group = {
      sourceWord: groups[i][0].source_word,
      lemmas: []
    };
    let lemmas = groupBy(groups[i], 'lemma_id')
    let lemmaObject = {
      targetLemma: '',
      inflections: [],
      inflectionsActive: false
    }
    for(var j in lemmas){
      for(var o in lemmas[j]){
        console.log(lemmas[j][o])
        if(lemmas[j][o].is_lemma == '1'){
          lemmaObject.targetLemma = lemmas[j][o].word
          lemmaObject.frequency = lemmas[j][o].frequency
          lemmaObject.is_lemma = true
        }
        lemmaObject.inflections.push(lemmas[j][o])
      }
      if(!lemmas[j].find(lemma => lemma.is_lemma == '1')){
        lemmaObject.targetLemma = lemmas[j][0].word
        lemmaObject.frequency = lemmas[j][0].frequency
      }
      group.lemmas.push(lemmaObject)
    }
    result.push(group)
  }
  return result
}

const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

onActivated(() => {
  getTranslations()
})
watch(() => route.params.word, (currentValue, oldValue) => {
  getTranslations()
})

</script>
