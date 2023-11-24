<template>
  <q-infinite-scroll @load="onLoad" ref="infiniteScroll">
      <template v-slot:loading>
          <div class="row justify-center q-my-md">
          <q-spinner color="primary" name="dots" size="40px" />
          </div>
      </template>
    <slot/>
  </q-infinite-scroll>
</template>

<script setup>
import { ref, onActivated, onDeactivated, watch } from 'vue'

const emits = defineEmits(['onLoaded'])
const props = defineProps({
loadMore: Function,
reloadTrigger: Boolean,
reset: Boolean
})
const infiniteScroll = ref()
const isLoaded = ref(false)
const list = ref([])
const limit = 8

const onLoad = async function (index, done) {
let offset = 0
if (list.value.length > 0) offset = limit * (index - 1)
const listResponse = await props.loadMore({ limit, offset })
if (listResponse.length == limit) {
  isLoaded.value = false
  done(false)
} else {
  isLoaded.value = true
  done(true)
}
if (offset > 0) {
  list.value = list.value.concat(listResponse)
} else {
  list.value = listResponse
}
emits('onLoaded', list.value)
}

onActivated(async () => {
if (props.reset) {
  list.value = []
  infiniteScroll.value.resume()
  return
}
if (list.value.length > 0) {
  list.value = await props.loadMore({ limit: list.value.length, offset: 0 })
  const currentIndex = Math.floor(list.value.length / limit)
  infiniteScroll.value.setIndex(currentIndex)
  if (currentIndex > 0) {
    list.value = list.value.slice(0, currentIndex * limit)
  }
}
infiniteScroll.value.resume()
emits('onLoaded', list.value)
})

onDeactivated(() => {
if (props.reset) list.value = []
if (infiniteScroll.value) { infiniteScroll.value.stop() }
})
watch(() => props.reloadTrigger, async (currentValue, oldValue) => {
list.value = await props.loadMore({ limit: list.value.length, offset: 0 })
emits('onLoaded', list.value)
})

</script>
