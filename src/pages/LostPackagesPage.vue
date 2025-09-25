<template>
  <div>
    Lost Packages Page
    <div v-if="loading">Loading database...</div>
    <div v-if="error" class="error">Error: {{ error }}</div>
    <div v-else>
      <button @click="loadData">Load Data</button>
      <ul>
        <pre>
          <li v-for="(item, index) in data" :key="index">
            {{ item.tracking_num.padEnd(24) }}{{ item.recipient_name.padEnd(42)}}{{item.building.padEnd(47)}}{{ item.room_num.padEnd(5)}}{{ item.date.padEnd(12) }}{{ item.carrier.padEnd(8) }}{{ item.delivered_status.padEnd(20) }}
          </li>
        </pre>
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
