import Vue from 'vue';
import './assets/css/style.less';
import App from './App.vue';

Vue.config.productionTip = false;

new Vue({
    render: h => h(App),
}).$mount('#app');
