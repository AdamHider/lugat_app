<template>
  <q-scroll-area class="row notepad"
      @scroll="onScroll"
      visible
      ref="notepadScroll"
      :vertical-thumb-style="{
        right: '2px',
        borderRadius: '2px',
        backgroundColor: 'lightgray',
        width: '8px',
        opacity: 1
      }"
      :vertical-bar-style="{
        right: '0px',
        borderRadius: '0px',
        backgroundColor: '#f2f2f2',
        width: '12px',
        opacity: 1
      }"
      :horizontal-thumb-style="{
        bottom: '2px',
        borderRadius: '2px',
        backgroundColor: 'lightgray',
        height: '8px',
        opacity: 1
      }"
      :horizontal-bar-style="{
        bottom: '0px',
        borderRadius: '0px',
        backgroundColor: '#f2f2f2',
        height: '12px',
        opacity: 1
      }"
  >
        <div class="lines-container">
            <div v-for="line in formData.totalLines" :key="line">
            {{ line }}
            </div>
        </div>
        <div class="textbox-container" >
            <div class="shadow-text">{{ formData.text }}</div>
            <q-input
              borderless
              :readonly="formData.readonly"
              v-model="formData.text"
              @update:model-value="countLines(); emits('update-value', formData.text)"
              type="textarea"
              autogrow
              input-style="white-space: pre; min-height: 300px; font-size: 12px; overflow: visible;"
            />
        </div>
  </q-scroll-area>
</template>

<script setup >
import { ref, onActivated, onMounted, reactive, watch } from 'vue'

const emits = defineEmits(['update-value', 'update-scroll'])

const props = defineProps({
  value: String,
  readonly: Boolean,
  scrollSync: Object
})
const notepadScroll = ref(null)
const formData = reactive({
  text: '',
  totalLines: 1,
  readonly: null
})
onMounted(() => {
  if (props.value) formData.text = props.value
  if (props.value) formData.readonly = props.readonly
  countLines()
})
onActivated(() => {
  if (props.value) formData.text = props.value
  if (props.value) formData.readonly = props.readonly
  countLines()
})
const onScroll = function (position) {
  // when this method is invoked then it means user
  // has scrolled the page to `position`
  //
  // `position` is an Integer designating the current
  // scroll position in pixels.
  emits('update-scroll', position)
}

const countLines = function () {
  formData.totalLines = formData.text.split(/\r\n|\r|\n/).length
}

watch(() => props.value, async (currentValue, oldValue) => {
  formData.text = currentValue
  countLines()
})
watch(() => props.readonly, async (currentValue, oldValue) => {
  formData.readonly = currentValue
})
watch(() => props.scrollSync, async (currentValue, oldValue) => {
  notepadScroll.value.setScrollPosition('vertical', currentValue.verticalPosition)
  notepadScroll.value.setScrollPosition('horizontal', currentValue.horizontalPosition)
})
</script>
<style scoped>
.notepad{
  font-family: Consolas;
  border: 1px solid lightgray;
  position: relative;
  height: calc(-72px + 100vh);
  width: 50vw;
  padding-right: 12px;
  padding-bottom: 12px;
}
.notepad .lines-container{
  text-align: right;
  padding-top: 19px;
  padding-right: 10px;
  min-height: 52px;
  line-height: 18px;
  color: gray;
  font-size: 13px;
  border-right: 1px solid #f2f2f2;
  width: 50px;
  min-height: 300px;
  position: absolute;
}
.notepad .q-field {
  padding-left: 10px !important;
}
.notepad .textbox-container{
  padding-left: 50px;
}
.notepad .shadow-text{
  padding-left: 50px;
  color: white;
  white-space: pre;
  height: 0px;
  font-size: 12px;
}
</style>
