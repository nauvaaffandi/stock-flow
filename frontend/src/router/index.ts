import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [],
})

router.beforeEach((to) => {
    document.title = to.meta.title as string || 'Stock-flow'
})

export default router
