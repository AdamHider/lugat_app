<template>
  <div class="relative-position q-image-uploader">
    <q-field outlined
      :class="(error !== '') ? 'q-pb-xl' : ''"
      :label="props.label"
      stack-label
      :error="error !== ''"
      :error-message="error">
      <q-img
        class="q-my-sm q-mx-auto rounded-borders"
        ratio="1"
        rounded
        height="120px"
        width="120px"
        :src="image">
      </q-img>
      <q-menu v-model="focused">
        <q-list>
          <q-item
            @click="imagePriviewDialog = true"
            v-close-popup
            clickable
          >
            <q-item-section avatar>
              <q-icon name="image" />
            </q-item-section>
            <q-item-section>Open image</q-item-section>
          </q-item>
          <q-item
            v-close-popup
            clickable
          >
            <q-item-section avatar>
              <q-icon name="file_upload" />
            </q-item-section>
            <q-item-section>
              Update image
              <input class="absolute-top full-width full-height"
                type="file"
                name="image"
                accept=".txt, .md5"
                @change="handleUpload($event)"
                style="opacity: 0">
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    <q-dialog v-model="imagePriviewDialog">
      <q-card style="width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Preview</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-img :src="image" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-field>
  </div>
</template>

<script setup>
import { useImage } from '../composables/useImage'
import { ref, toRefs } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const imagePriviewDialog = ref(false)
const focused = ref(false)
const error = ref('')
const props = defineProps({
  image: String,
  label: String
})
const image = toRefs(props).image
const emits = defineEmits(['update'])

const { uploadImage } = useImage()

const handleUpload = async (event) => {
  const data = new FormData()
  data.append('image', event.target.files[0])
  data.set('image_holder_id', 1)
  const imageUploaded = await uploadImage(data)
  if (!imageUploaded.error) {
    error.value = ''
    emits('update', imageUploaded.image)
  } else {
    error.value = imageUploaded.messages.errors.image
    setTimeout(() => { error.value = '' }, 3000)
  }
}
onBeforeRouteLeave((to, from) => {
  if (imagePriviewDialog.value) {
    imagePriviewDialog.value = false
    return false
  }
  return true
})
</script>
<style>
.q-image-uploader .q-field__append.q-anchor--skip{
  position: absolute;
  right: 8px;
  top: -10px;
}
</style>
