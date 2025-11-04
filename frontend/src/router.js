import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "./composables/supabase"; // Import Supabase

// importing components
import LostPackagesPage from "./pages/LostPackagesPage.vue";
import ProfilePage from "./pages/ProfilePage.vue";
import ReportsPage from "./pages/ReportsPage.vue";
import HomePage from "./pages/HomePage.vue";
import SignIn from "./pages/SignIn.vue";
import SignUp from "./pages/SignUp.vue";

const routes = [
  { 
    path: "/", 
    name: "Home",
    component: HomePage 
  },
  { 
    path: "/lost-packages", 
    name: "LostPackages",
    component: LostPackagesPage,
    meta: { requiresAuth: true } // This page requires login
  },
  { 
    path: "/profile", 
    name: "Profile",
    component: ProfilePage,
    meta: { requiresAuth: true } // This page requires login
  },
  { 
    path: "/signin", 
    name: "SignIn",
    component: SignIn 
  },
  { 
    path: "/signup", 
    name: "SignUp",
    component: SignUp 
  },
  { 
    path: "/reports", 
    name: "Reports",
    component: ReportsPage,
    meta: { requiresAuth: true } // This page requires login
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- NEW: NAVIGATION GUARD ---
// This function runs before every route change.
router.beforeEach(async (to, from, next) => {
  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  // Check if the route requires authentication
  if (to.meta.requiresAuth && !user) {
    // If user is not logged in and route requires auth, redirect to signin
    next({ name: 'SignIn' });
  } else if (to.name === 'SignIn' && user) {
    // If user is logged in and tries to visit login page, redirect to home
    next({ name: 'Home' });
  } else {
    // Otherwise, allow navigation
    next();
  }
});

export default router;
