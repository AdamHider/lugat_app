import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })


  Router.beforeEach((to, from, next) => {
    const IsItABackButton = window.popStateDetected
    window.popStateDetected = false

    // Check transitions
    if (from.meta.transition === 'slide-in' && to.meta.transition === 'slide-in' && IsItABackButton) {
      to.meta.transition = 'slide-out'
    } else
    if (from.meta.transition === 'slide-out' && to.meta.transition !== 'slide-in' && IsItABackButton) {
      to.meta.transition = 'slide-out'
    } else
    if (from.meta.transition === 'slide-in' && to.meta.transition !== 'slide-in') {
      to.meta.transition = 'slide-out'
    }


    /*
    const IsItABackButton = window.popStateDetected
    window.popStateDetected = false

    const fromSplitted = from.fullPath.split('/')
    const toSplitted = to.fullPath.split('/')

    console.log(fromSplitted)
    console.log(toSplitted)
    const fromRoot = fromSplitted.length == 2
    const toRoot = toSplitted.length == 2
    if (!fromRoot && IsItABackButton && toSplitted[1] !== fromSplitted[1]) {
      fromSplitted.pop()
      const parentRoute = fromSplitted.join('/')
      next({ path: parentRoute })
    }

    if (fromRoot && toRoot) {
      //next({ path: to.fullPath, replace: true })
      next(false)
    } */
    /*
    if (!fromRoot && IsItABackButton) {
      routerHistory.stack[0] = to.fullPath
      next({ path: '/' + from.fullPath.split('/')[1] })
    } */
/*
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!user.active.data.id) {
        next({ path: '/authorization' })
      } else {
        next() // go to wherever I'm going
      }
    } else {
      next() // does not require auth, make sure to always call next()!
    }*/

    next()
    /*
      routerHistory.stack.unshift(to.fullPath);
      if(routerHistory.stack.length > 10){
        routerHistory.stack.pop();
      } */
  })

  return Router
})
