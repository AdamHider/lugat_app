<template  withBackground="true">
  <q-chip
    class="transparent no-shadow"
    style="color: inherit"
    clickable
    @click="dialog = true"
  >
    <div class="ellipsis" style="max-width: 100px">
      <b>{{ data.source_language_id }}  {{ data.target_language_id }}</b>
    </div>
    <q-icon name="expand_more" size="sm"></q-icon>
  </q-chip>
  <q-dialog v-model="dialog" position="bottom" allow-focus-outside>
    <q-card>
      <q-card-section>
        <div class="text-h6">Choose course</div>
      </q-card-section>
      <q-card-section class="q-pt-none q-px-none" horizontal>
        <q-card-section class="full-width">
          <q-select
            v-model="data.source_language_id"
            :options="languages"
            emit-value
            map-options
            option-value="id"
            option-label="title"
            option-disable="inactive"
            label="From"
            bg-color="white"
            standout
            outlined
          />
        </q-card-section>
        <q-card-section class="full-width">
          <q-select
            v-model="data.target_language_id"
            :options="targetLanguages"
            emit-value
            map-options
            option-value="id"
            option-label="title"
            option-disable="inactive"
            label="To"
            bg-color="white"
            standout
            outlined
          />
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { watch, ref, onActivated, reactive } from "vue";

const emit = defineEmits(["update:dialogOpened"]);

const props = defineProps({
  dialogOpened: Boolean,
  sourceLang: Number,
  targetLang: Number,
});

const data = reactive({
  source_language_id: 1,
  target_language_id: 2,
});

const languages = [
  {
    title: 'qirimtatar',
    id: 1
  },
  {
    title: 'russian',
    id: 2
  }
]
const targetLanguages = ref([])

const dialog = ref(false);
if (props.dialogOpened) dialog.value = true;


const targetLangsRecalc = function(){
  targetLanguages.value = []
  for(var i in languages){
    if(data.source_language_id == languages[i].id) continue
    targetLanguages.value.push(languages[[i]])
  }
}
watch(() => data.source_language_id, async (currentValue, oldValue) => {
  if(currentValue == data.target_language_id){
    data.target_language_id = oldValue
  }
})
const select = () => {
  dialog.value = false;
};

onActivated(() => {
  targetLangsRecalc()
})
watch(props, () => {
  if (props.dialogOpened) dialog.value = true;
});
watch(dialog, () => {
  emit("update:dialogOpened", dialog);
});
</script>
