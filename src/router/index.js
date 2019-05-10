import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import BusinessComponent from '@/components/BusinessComponent';
import BusinessApplication from '@/components/BusinessApplication';
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
      path: '/application',
      name: 'BusinessApplication',
      component: BusinessApplication
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ]
})
