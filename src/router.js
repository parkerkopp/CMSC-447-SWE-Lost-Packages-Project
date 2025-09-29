import { createRouter, createWebHistory } from "vue-router";

// importing components
import LostPackagesPage from "./pages/LostPackagesPage.vue";
import ProfilePage from "./pages/ProfilePage.vue";
import ReportsPage from "./pages/ReportsPage.vue";
import HomePage from "./pages/HomePage.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/lost-packages", component: LostPackagesPage },
  { path: "/profile", component: ProfilePage },
  { path: "/reports", component: ReportsPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
