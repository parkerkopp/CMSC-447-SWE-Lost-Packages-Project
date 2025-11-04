<template>
  <div>
    <nav class="nav-bar">
      <div class="title-container">
        <img src="./assets/package.png" alt="package" class="icon" />
        <h1 class="title">Lost Package Services</h1>
      </div>
      <div class="link-container">
        <router-link to="/" class="link">Home</router-link>
        <router-link to="/reports" class="link">Reports</router-link>
        <router-link to="/lost-packages" class="link">Packages</router-link>
        <router-link to="/profile" class="link">Profile</router-link>
        
        <!-- NEW: Dynamic Sign In / Sign Out Links -->
        <router-link v-if="!user" to="/signin" class="link">Sign In</router-link>
        <a v-else @click="handleSignOut" class="link" href="#">Sign Out</a>
      </div>
    </nav>
    <span class="divider"></span>
    <!-- This is where the pages load -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from './composables/supabase'; // Assumes composables is at src/composables
import { useRouter } from 'vue-router';

const user = ref(null);
const router = useRouter();

// Check the auth state when the app loads and when it changes
onMounted(() => {
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null;
  });
});

// Handle sign out
const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
  } else {
    // On successful sign out, redirect to home
    router.push('/');
  }
};
</script>

<!-- No style block needed, all styles are in global.css -->

