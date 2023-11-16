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
            class="q-my-sm"
          />
          <q-input
            v-model="data.source.text"
            outlined
            clearable
            type="textarea"
          />
        </q-card-section>
        <q-card-section  class="full-width">
          <div class="text-h6">Target text</div>
          <q-select
            filled
            v-model="data.target.language_id"
            :options="options"
            emit-value
            map-options
            label="Language"
            class="q-my-sm"
          />
            <q-input
              v-model="data.target.text"
              filled
              readonly
              type="textarea"
            />
        </q-card-section>
      </q-card-section>

      <q-card-actions>
        <q-btn flat color="primary" @click="predict()">
          Translate!
        </q-btn>
      </q-card-actions>
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
  source: {
    text: 'I love you', // 'Men bala ekende, qartanamnıñ küçük teneke sandıçığı olğanını hatırlayım. Şu mavı-zumrut renklerge boyalanğan qutuçıqnıñ üstü tıpqı balaban sandıqlarda kibi, dögme köşeçiklerinen yaraştırılğan edi.',
    language_id: 4
  },
  target: {
    text: '',
    language_id: 5
  }
})

const predict = async function () {
  const translationResponse = await api.translator.predict(data)
  if (translationResponse.error) {
    translationResponse.value = ''
    return
  }
  data.target.text = translationResponse.text
}

watch(() => data.source.language_id, async (currentValue, oldValue) => {
  if (data.source.language_id === data.target.language_id) {
    data.target.language_id = oldValue
  }
})

</script>
