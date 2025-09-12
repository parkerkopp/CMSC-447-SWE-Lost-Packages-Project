<script setup>
import { ref, computed } from "vue";
import HomePage from "./components/HomePage.vue";
import LostPackagesPage from "./components/LostPackagesPage.vue";
import ProfilePage from "./components/ProfilePage.vue";
import ReportsPage from "./components/ReportsPage.vue";
import HistoryPage from "./components/HistoryPage.vue";
</script>

<template>
  <div>
    <router-link to="/">Home</router-link>
    <router-link to="/profile">Profile</router-link>
    <router-link to="/reports">Reports</router-link>
    <router-link to="/lost-packages">Lost Packages</router-link>
    <router-link to="/history">History</router-link>
  </div>
  <HomePage />
  <HistoryPage />
  <LostPackagesPage />
  <ProfilePage />
  <ReportsPage />
</template>
