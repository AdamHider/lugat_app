<template withBackground="true">
  <div class="q-gutter-xs cursor-pointer">
    <div class="row justify-between items-center">
      <div class="col-5">
        <q-chip :class="`bg-transparent ${(props.transparent) ? 'text-white' : ''} no-shadow`" clickable @click="currentLanguage=sourceLanguage;dialog=true"><b>{{ sourceLanguage?.title }}</b></q-chip>
      </div>
      <div class="col-2 text-center">
        <q-btn round flat unelevated :color="(props.transparent) ? 'white' : ''"  icon="sync_alt" @click="data.source_language_id = data.target_language_id"/>
      </div>
      <div class="col-5">
      <div class="col-5 ">
        <q-chip  :class="`bg-transparent ${(props.transparent) ? 'text-white' : ''} no-shadow`" clickable @click="currentLanguage=targetLanguage;dialog=true"><b>{{ targetLanguage?.title }}</b></q-chip>
      </div>
      </div>
    </div>
  </div>
  <q-dialog v-model="dialog" position="bottom" allow-focus-outside>
    <q-card>
      <q-card-section>
        <div class="text-h6" v-if="sourceLanguage.id == currentLanguage.id">Source language</div>
        <div class="text-h6" v-else>Target language</div>
      </q-card-section>
      <q-card-section class="q-pt-none full-width">
        <q-list>
          <q-item v-for="(language, languageIndex) in languages" :key="languageIndex" clickable :disable="language.id == currentLanguage.id"
          @click="dialog = false; ((sourceLanguage.id == currentLanguage.id) ? data.source_language_id = language.id : data.target_language_id = language.id); ">
            <q-item-section avatar>
              <q-avatar  size="md">
                <img :src="language.flag">
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ language.title }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-icon v-if="language.id == currentLanguage.id" color="positive" text-color="white" name="check" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { watch, ref, onActivated, reactive, computed, toRefs} from "vue";
import { useLanguage } from '../composables/useLanguage'

const { languages, getLanguage } = useLanguage()

const emit = defineEmits(["update:dialogOpened", "onChange"]);

const props = defineProps({
  transparent: Boolean,
  dialogOpened: Boolean,
  source_language_id: String,
  target_language_id: String,
});

const currentLanguage = ref({})

const data = reactive({
  source_language_id: "1",
  target_language_id: "2"
})

const sourceLanguage = computed(() => {
  return getLanguage(data.source_language_id, 'id')
})
const targetLanguage = computed(() => {
  return getLanguage(data.target_language_id, 'id')
})
const targetLanguages = computed(() => {
  return languages.value.filter(language => language.id != data.source_language_id)
})

const dialog = ref(false);

if (props.dialogOpened) dialog.value = true;

watch(() => data.source_language_id, async (currentValue, oldValue) => {
  if(currentValue == data.target_language_id){
    data.target_language_id = oldValue
  }
})
watch(() => data.target_language_id, async (currentValue, oldValue) => {
  if(currentValue == data.source_language_id){
    data.source_language_id = oldValue
  }
})

watch(props, () => {
  if (props.dialogOpened) dialog.value = true;
  if(props.source_language_id) data.source_language_id = props.source_language_id
  if(props.target_language_id) data.target_language_id = props.target_language_id
});

watch(data, (currentValue, oldValue) => {
  emit("onChange", currentValue);
});

watch(dialog, (currentValue, oldValue) => {
  emit("update:dialogOpened", dialog);
});
</script>
