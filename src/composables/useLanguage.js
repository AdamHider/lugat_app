import { ref } from 'vue'
import { api } from '../services/index'

const languages = ref([])

export function useLanguage () {
  function getLanguage (value, key) {
    return languages.value.find(language => language[key] == value)
  }
  async function loadLanguages() {
    const languageListResponse = await api.language.getList({})
    if (languageListResponse.error) {
      languages.value = []
    } else {
      languages.value = languageListResponse
    }
  }
  return {
    getLanguage,
    loadLanguages,
    languages
  }
}
