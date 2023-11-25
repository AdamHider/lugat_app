import AppHeader from '../components/AppHeader.vue'
import AppPageWrapper from '../components/AppPageWrapper.vue'
import AppInfiniteList from '../components/AppInfiniteList.vue'

// we globally register our component with Vue
export default ({ app }) => {
  app.component('q-app-header', AppHeader)
  app.component('q-page-wrapper', AppPageWrapper)
  app.component('q-infinite-list', AppInfiniteList)
}
