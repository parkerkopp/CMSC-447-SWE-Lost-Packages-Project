<template>
  <div>
    <nav class="nav-bar">
      <div class="title-container">
        <img
          src="./assets/UMBC-vertical-logo-1C-black.png"
          alt="package"
          class="icon"
        />
        <h1 class="title">UMBC Lost Package Services</h1>
      </div>
      <div class="link-container">
        <router-link to="/" class="link">Home</router-link>
        <router-link to="/reports" class="link">Reports</router-link>
        <router-link to="/lost-packages" class="link">Packages</router-link>
        <router-link to="/profile" class="link">Profile</router-link>
        
        <!-- NEW: Updated Sign Out Link -->
        <router-link v-if="!user" to="/signin" class="link">Sign In</router-link>
        <a v-else @click.prevent="showSignOutModal = true" class="link" href="#">Sign Out</a>
      </div>
    </nav>
    <span class="divider"></span>
    <!-- This is where the pages load -->
    <router-view />

    <!-- NEW: Confirm Sign Out Pop Up -->
    <div
      v-if="showSignOutModal"
      class="confirm-modal-overlay"
      @click.self="cancelSignOut"
    >
      <div class="confirm-modal-content">
        <h3 class="confirm-modal-title">Confirm Sign Out</h3>
        <p class="confirm-modal-text">Are you sure you want to sign out?</p>
        <div class="confirm-modal-buttons">
          <button @click="cancelSignOut" class="confirm-btn-cancel">Cancel</button>
          <button @click="handleSignOut" class="confirm-btn-confirm">Sign Out</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from './composables/supabase'; // Assumes composables is at src/composables
import { useRouter } from 'vue-router';

const user = ref(null);
const router = useRouter();

// NEW: Ref to control sign up pop up modal
const showSignOutModal = ref(false);

// Check the auth state when the app loads and when it changes
onMounted(() => {
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null;
  });
});

// NEW: Close sign out pop up modal
const cancelSignOut = () => { showSignOutModal.value = false; }

// Handle sign out (now called from modal)
const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
  } else {
    // On successful sign out, redirect to home
    showSignOutModal.value = false;
    router.push('/');
  }
};
</script>

<!-- No style block needed, all styles are in global.css -->

