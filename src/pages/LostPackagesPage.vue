<template>
  <div>
    Lost Packages Page
    <div v-if="loading">Loading database...</div>
    <div v-if="error" class="error">Error: {{ error }}</div>
    <div v-else>
      <button @click="loadData">Load Data</button>
      <ul class="label-info" v-for="(item, index) in data" :key="index">
        <li>
          {{ item.tracking_num }}
        </li>
        <li>
          {{ item.recipient_name }}
        </li>
        <li>
          {{ item.building }}
        </li>
        <li>
          {{ item.room_num }}
        </li>

        <li>
          {{ item.date }}
        </li>
        <li>
          {{ item.carrier }}
        </li>
        <li>
          {{ item.delivered_status }}
        </li>
        <span class="divider"></span>
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
    data.value = query("SELECT * FROM package_info");
    console.log(data.value);
  } catch (err) {
    console.error("Failed to load data:", err);
  }
};
</script>
