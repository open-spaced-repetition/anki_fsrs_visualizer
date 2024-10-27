import './assets/main.css'

import { createApp } from 'vue'
import { createWebHistory, createRouter } from 'vue-router'
import Router from './Router.vue'
import App from './App.vue'

const routes = [
    { path: '/', component: App },
];

const router = createRouter({
    history: createWebHistory('/anki_fsrs_visualizer/'),
    routes,
});

createApp(Router)
    .use(router)
    .mount('#app');
