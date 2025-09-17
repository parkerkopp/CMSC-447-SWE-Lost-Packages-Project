<template>
  <div>
    <img
      src="./assets/UMBC-primary-logo.png"
      alt="UMBC logo"
      width="300"
      height="75"
      class="logo"
    />
    <h1 id="welcome-title" :style="{ textAlign: 'center' }">
      Welcome To UMBC Lost Package Services
    </h1>
    <nav class="nav-bar">
      <router-link to="/" class="link" @click="addWelcome">Home</router-link>
      <router-link to="/profile" class="link" @click="removeWelcome"
        >Profile</router-link
      >
      <router-link to="/reports" class="link" @click="removeWelcome"
        >Reports</router-link
      >
      <router-link to="/lost-packages" class="link" @click="removeWelcome"
        >Lost Packages</router-link
      >
      <router-link to="/history" class="link" @click="removeWelcome"
        >History</router-link
      >
    </nav>
    <!-- This is where the pages load -->
    <router-view />
  </div>
</template>

<script>
export default {
  methods: {
    removeWelcome() {
      document.getElementById("welcome-title").style.display = "none";
    },
    addWelcome() {
      document.getElementById("welcome-title").style.display = "block";
    },
  },
};
</script>
