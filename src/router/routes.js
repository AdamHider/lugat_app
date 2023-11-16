import MainLayout from 'layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'training',
        component: () => import('pages/TrainingPage.vue'),
        meta: { pageTitle: 'Training' }
      },
      {
        path: 'prediction',
        component: () => import('pages/PredictionPage.vue'),
        meta: { pageTitle: 'Prediction' }
      },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
