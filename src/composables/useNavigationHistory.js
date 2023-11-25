import { reactive } from 'vue'

const routes = reactive({
  prediction: '/prediction',
  training: '/training',
  books: '/books'
})

export function useNavigationHistory () {
  function watchRoute (route) {
    const currentRoot = (route.fullPath.split('/')[1])
    routes[currentRoot] = route.fullPath
  }
  return {
    watchRoute,
    routes
  }
}
