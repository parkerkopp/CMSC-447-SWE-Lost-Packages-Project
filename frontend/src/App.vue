<template>
  <div>
    <nav class="nav-bar">
      <div class="title-container">
        <img src="./assets/package.png" alt="package" class="icon" />
        <h1 class="title">Lost Package Services</h1>
      </div>
      <router-link to="/" class="link">Home</router-link>
      <router-link to="/profile" class="link">Profile</router-link>
      <router-link to="/reports" class="link">Reports</router-link>
      <router-link to="/lost-packages" class="link">Lost Packages</router-link>
    </nav>
    <span class="divider"></span>
    <!-- This is where the pages load -->
    <router-view />
  </div>
</template>
