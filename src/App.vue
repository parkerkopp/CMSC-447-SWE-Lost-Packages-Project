<template>
  <div>
    <img
      src="./assets/UMBC-primary-logo.png"
      alt="UMBC logo"
      width="400"
      height="100"
      class="logo"
    />
    <nav class="nav-bar">
      <router-link to="/" class="link">Home</router-link>
      <router-link to="/profile" class="link">Profile</router-link>
      <router-link to="/reports" class="link">Reports</router-link>
      <router-link to="/lost-packages" class="link">Lost Packages</router-link>
      <router-link to="/history" class="link">History</router-link>
    </nav>
    <!-- This is where the pages load -->
    <router-view />
  </div>
</template>

<style scoped>
.logo {
  display: flex;
  margin: auto;
}
</style>
