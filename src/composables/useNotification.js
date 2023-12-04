import { useQuasar } from 'quasar'


export function useNotification () {

  const $q = useQuasar()

  function error (message) {
    $q.notify({
      message: message,
      color: 'negative'
    })
  }
  function warning (message) {
    $q.notify({
      message: message,
      color: 'warning'
    })
  }
  function success (message) {
    $q.notify({
      message: message,
      color: 'positive'
    })
  }
  return {
    error,
    warning,
    success
  }
}
