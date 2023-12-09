import { reactive } from 'vue'

const routes = reactive({
  translation: '/translation',
  training: '/training',
  words: '/words',
  books: '/books'
})

export function useNavigationHistory () {
  function watchRoute (to, from) {
    to = checkRoute(to, from)
    console.log(to)
    const currentRoot = (to.split('/')[1])
    const fromRoot = (from.split('/')[1])
    routes[fromRoot] = from
    routes[currentRoot] = to
  }
  function checkRoute (to, from) {
    const toSplitted = to.split('/')
    const fromSplitted = from.split('/')
    const toRoot = toSplitted[1]
    const fromRoot = fromSplitted[1]
    console.log(toSplitted)
    console.log(fromSplitted)
    if(toRoot == fromRoot && toSplitted.length > fromSplitted.length) to = '/'+toRoot
    return to
  }
  return {
    watchRoute,
    routes
  }
}
