<template withBackground="true">
  <q-chip
    class="transparent no-shadow"
    style="color: white"
    clickable
    @click="dialog = true"
  >
    <div >
      <b>{{ languagePair }}</b>
    </div>
    <q-icon name="expand_more" size="sm"></q-icon>
  </q-chip>
  <q-dialog v-model="dialog" position="bottom" allow-focus-outside>
    <q-card>
      <q-card-section>
        <div class="text-h6">Choose languages</div>
      </q-card-section>
      <q-card-section class="q-pt-none full-width">
        <div class="row justify-between items-center">
          <div class="col-5">
            <q-select
              v-model="data.source_language_id"
              :options="languages"
              emit-value
              map-options
              option-value="id"
              option-label="title"
              option-disable="inactive"
              outlined
            />
          </div>
          <div class="col-2 text-center">
            <q-btn round unelevated color="primary"  icon="sync_alt" @click="data.source_language_id = data.target_language_id"/>
          </div>
          <div class="col-5">
            <q-select
              v-model="data.target_language_id"
              :options="targetLanguages"
              emit-value
              map-options
              option-value="id"
              option-label="title"
              option-disable="inactive"
              standout
              outlined
            />
          </div>
        </div>
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
  dialogOpened: Boolean,
  source_language_id: Number,
  target_language_id: Number,
});

const data = reactive({
  source_language_id: 1,
  target_language_id: 2
})

const languagePair = computed(() => {
  return `${getLanguage(data.source_language_id, 'id').title} - ${getLanguage(data.target_language_id, 'id').title}`
})
const targetLanguages = computed(() => {
  return languages.filter(language => language.id != data.source_language_id)
})

const dialog = ref(false);
if (props.dialogOpened) dialog.value = true;

watch(() => data.source_language_id, async (currentValue, oldValue) => {
  if(currentValue == data.target_language_id){
    data.target_language_id = oldValue
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
