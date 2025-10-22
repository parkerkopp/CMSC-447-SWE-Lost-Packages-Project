import { createRouter, createWebHistory } from "vue-router";

// importing components
import LostPackagesPage from "./pages/LostPackagesPage.vue";
import ProfilePage from "./pages/ProfilePage.vue";
import ReportsPage from "./pages/ReportsPage.vue";
import HomePage from "./pages/HomePage.vue";
import SignIn from "./pages/SignIn.vue";
import SignUp from "./pages/SignUp.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/lost-packages", component: LostPackagesPage },
  { path: "/profile", component: ProfilePage },
  { path: "/signin", component: SignIn },
  { path: "/signup", component: SignUp },
  { path: "/reports", component: ReportsPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
