import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import BusinessComponent from '@/components/BusinessComponent';
import NotFound from '@/components/error-pages/NotFound';
Vue.use(Router)
export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/component',
      name: 'BusinessComponent',
      component: BusinessComponent
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ]
})
