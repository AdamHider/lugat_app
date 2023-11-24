import { reactive } from 'vue'
import { api } from '../services/index'
export function useImage () {
  function uploadImage (file) {
    const data = new FormData()
    data.append('name', 'image')
    data.append('file', file)
    return api.uploader.upload(file)
  }

  return {
    uploadImage
  }
}
