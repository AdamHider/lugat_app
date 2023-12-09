const languages = [
  {
    title: 'Qirimtatar',
    id: 1
  },
  {
    title: 'Russian',
    id: 2
  }
]

export function useLanguage () {
  function getLanguage (value, key) {
    return languages.find(language => language[key] == value)
  }
  return {
    getLanguage,
    languages
  }
}
