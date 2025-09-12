import { createRouter, createWebHistory } from "vue-router";

// importing components
import HomePage from "./components/HomePage.vue";
import HistoryPage from "./components/HistoryPage.vue";
import LostPackagesPage from "./components/LostPackagesPage.vue";
import ProfilePage from "./components/ProfilePage.vue";
import ReportsPage from "./components/ReportsPage.vue";

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
