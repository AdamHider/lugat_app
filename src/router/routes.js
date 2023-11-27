import MainLayout from 'layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'training',
        component: () => import('pages/TrainingPage.vue'),
        meta: { pageTitle: 'Training', bottomBarEnabled: true }
      },
      {
        path: 'prediction',
        component: () => import('pages/PredictionPage.vue'),
        meta: { pageTitle: 'Prediction', bottomBarEnabled: true }
      },
      {
        path: 'books',
        component: () => import('pages/BooksPage.vue'),
        meta: { pageTitle: 'Books', bottomBarEnabled: true }
      },
      {
        path: 'book-:book_id',
        component: () => import('pages/BookPage.vue'),
        meta: { pageTitle: 'Book' }
      },
      {
        path: 'chapter-:chapter_id',
        component: () => import('pages/ChapterPage.vue'),
        meta: { pageTitle: 'Chapter' }
      },
      {
        path: 'lemmatization',
        component: () => import('pages/LemmatizationPage.vue'),
        meta: { pageTitle: 'Words', bottomBarEnabled: true }
      }
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
