<template>
  <q-card  style="width: 700px; max-width: 80%">
    <q-card-section>
      <div class="text-h6">Build book</div>
    </q-card-section>
    <q-card-section>
      <div class="row justify-between">
        <div class="col">
          <b>{{ currentPercentage*100 }}%</b>
        </div>
        <div class="col text-right">
          <b>{{ currentProgress }}/{{ totalProgress }}</b>
        </div>
      </div>
      <q-linear-progress rounded  size="15px" animation-speed="300" :value="currentPercentage" :color="progressColor"/>
    </q-card-section>
    <q-card-actions align="right" class="text-primary">
      <q-btn flat label="Close" v-close-popup />
      <q-btn color="primary" label="Build" icon="delete_outline" :loading="isBuilding" @click="buildStart()" />
    </q-card-actions>
  </q-card>
</template>

<script setup >
import { api } from '../services/index'
import { ref, computed, toRefs} from 'vue'
import { useRoute } from 'vue-router'
import { useNotification } from '../composables/useNotification'

const { error, warning, success } = useNotification()
const route = useRoute()

const props = defineProps({
  bookId: String
})
const { bookId: bookId } = toRefs(props)

const emits = defineEmits(['onUpdated'])

const isBuilding = ref(false)
const progressColor = ref('primary')
const currentProgress = ref(0)
const totalProgress = ref(0)
const currentPercentage = computed(() => ((totalProgress.value) ? currentProgress.value / totalProgress.value : 0) )

const buildStart = async function () {
  isBuilding.value = true
  const buildStartResponse = await api.book.buildStart({id: bookId.value})
  if (buildStartResponse.error) {
    return
  }
  progressColor.value = 'positive'
  totalProgress.value = buildStartResponse
  return buildProcess()
}

const buildProcess = async function () {
  const buildProcessResponse = await api.book.buildProcess({id: bookId.value})
  if (buildProcessResponse.error) {
    if(buildProcessResponse.error == 404)  return buildFinish()
    progressColor.value = 'negative'
    error('Something went wrong while the build')
    return
  }
  currentProgress.value++
  buildProcess()
}

const buildFinish = async function () {
  const buildFinishResponse = await api.book.buildFinish({id: bookId.value})
  if (buildFinishResponse.error) {
    buildFinishResponse.value = []
  }
  setTimeout(() => {
    success('Build completed successfully')
    totalProgress.value = 0
    isBuilding.value = false
    emits('onUpdated')
  }, 1000)
}

</script>
