import { createRouter, createWebHistory } from "vue-router";

// importing components
import HomePage from "./pages/HomePage.vue";
import HistoryPage from "./pages/HistoryPage.vue";
import LostPackagesPage from "./pages/LostPackagesPage.vue";
import ProfilePage from "./pages/ProfilePage.vue";
import ReportsPage from "./pages/ReportsPage.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/history", component: HistoryPage },
  { path: "/lost-packages", component: LostPackagesPage },
  { path: "/profile", component: ProfilePage },
  { path: "/reports", component: ReportsPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
