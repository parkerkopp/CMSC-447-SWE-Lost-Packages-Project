<template>
  <div>
    Lost Packages Page
    <div v-if="loading">Loading database...</div>
    <div v-if="error" class="error">Error: {{ error }}</div>
    <div v-else>
      <button @click="loadData">Load Data</button>
      <ul>
        <li v-for="item in data" :key="item.id">
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useDatabase } from "../composables/AccessDatabase.js";

const { initDatabase, query, loading, error } = useDatabase();
const data = ref([]);

onMounted(async () => {
  await initDatabase();
});

const loadData = () => {
  try {
    // Example query - adjust table name and columns to match your database
    data.value = query("SELECT * FROM department_info");
    console.log(query("SELECT * FROM department_info"));
  } catch (err) {
    console.error("Failed to load data:", err);
  }
};
</script>
