<template>
  <q-page class="bg-white q-pa-sm">
    <q-card flat bordered class="q-my-sm">
        <q-card-section class="full-width">
          <div class="text-h6">Source Text</div>
          <q-select
            filled
            v-model="data.source_language_id"
            :options="options"
            emit-value
            map-options
            label="Language"
            class="q-my-sm"
          />
        <q-select
            filled
            v-model="data.target_language_id"
            :options="options"
            emit-value
            map-options
            label="Language"
            class="q-my-sm"
          />
          <q-input
            v-model="data.token"
            debounce="500"
            filled
            placeholder="Search"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
      <q-card-actions>
        <q-btn flat color="primary" @click="getTranslations()">
          Translate!
        </q-btn>
      </q-card-actions>
    </q-card>
    <q-card flat bordered class="q-my-sm"  v-if="translations?.length > 0">
        <q-card-section class="full-width">
          <div class="text-h6">Translations</div>
          <q-chip v-for="(translation, translationIndex) in translations" :key="translationIndex" >
            {{translation.core}}
          </q-chip>
        </q-card-section>
    </q-card>
    <q-card flat bordered class="q-my-sm" v-if="translationData?.sentences">
        <q-card-section class="full-width">
          <div class="text-h6">Source Text</div>
            <q-list separator>
              <q-item v-for="(sentenceObject, sentenceObjectIndex) in translationData.sentences" :key="sentenceObjectIndex"  active-class="bg-teal-1 text-green-8">
                <q-item-section>
                  <div v-html="sentenceObject.source_result"></div>
                </q-item-section>
                <q-item-section>
                  <div v-html="sentenceObject.target_result"></div>
                </q-item-section>
              </q-item>
            </q-list>
        </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup >
import { api } from '../services/index'
import { ref, reactive, watch } from 'vue'

const options = [
  {
    label: 'Qirimtatar',
    value: 1
  },
  {
    label: 'Русский',
    value: 2
  },
  {
    label: 'English',
    value: 4
  },
  {
    label: 'French',
    value: 5
  }

]
const data = reactive({
  token: 'estoy',
  source_language_id: 2,
  target_language_id: 1
})

const translationData = ref({})
const translations = ref([])

const predict = async function () {
  const translationResponse = await api.translator.predict(data)
  if (translationResponse.error) {
    translationData.value = {}
    return
  }
  translationData.value = translationResponse
}

const getTranslations = async function () {
  const translationListResponse = await api.translator.getTranslations(data)
  if (translationListResponse.error) {
    translations.value = []
    return
  }
  translations.value = translationListResponse
}

watch(() => data.source_language_id, async (currentValue, oldValue) => {
  if (data.source_language_id === data.target_language_id) {
    data.target_language_id = oldValue
  }
})

</script>
<style>

.tagged{
  color: red;
}

</style>
