<template>
  <div>
    <div class="page-header">
      <h1>Lost Packages</h1>
      <p class="subtitle">View and manage package delivery status</p>
    </div>
    <div v-if="error" class="error">Error: {{ error }}</div>
    <div v-if="loading" class="loading">Loading database...</div>
    <div v-else-if="!error">
      <!-- Filter Section -->
      <div class="filter-section">
        <input 
          v-model="filters.trackingNum"
          placeholder="Filter by tracking number"
          class="filter-input"
        />
        <input 
          v-model="filters.carrier"
          placeholder="Filter by carrier"
          class="filter-input"
        />
        <input 
          v-model="filters.building"
          placeholder="Filter by building"
          class="filter-input"
        />
        <input 
          v-model="filters.status"
          placeholder="Filter by status"
          class="filter-input"
        />
        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>
      <div class="packages-table">
        <!-- Table Header -->
        <div class="table-header">
          <div>Tracking #</div>
          <div>Recipient</div>
          <div>Building</div>
          <div>Room</div>
          <div>Date</div>
          <div>Carrier</div>
          <div>Status</div>
          <div>Notes</div>
        </div>
        <!-- Table Body -->
        <div class="table-body">
          <div v-for="item in filteredPackages" :key="item.id" class="table-row">
            <div>{{ item.tracking_num }}</div>
            <div>{{ item.recipient_name }}</div>
            <div>{{ item.building }}</div>
            <div>{{ item.room_num }}</div>
            <div>{{ item.date }}</div>
            <div>{{ item.carrier }}</div>
            <div>Not Delivered</div>
            <div>{{ item.notes }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "../composables/supabase";

const packages = ref([]);
const loading = ref(false);
const error = ref(null);

const filters = ref({
  trackingNum: '',
  carrier: '',
  building: '',
  status: ''
});

const clearFilters = () => {
  filters.value = {
    trackingNum: '',
    carrier: '',
    building: '',
    status: ''
  };
};

// Computed property for filtered packages
const filteredPackages = computed(() => {
  return packages.value.filter(pkg => {
    // Handle null values by converting them to empty strings
    const tracking = (pkg.tracking_num || '').toString();
    const carrier = (pkg.carrier || '').toString();
    const building = (pkg.building || '').toString();
    
    const trackingMatch = tracking.toLowerCase().includes(filters.value.trackingNum.toLowerCase());
    const carrierMatch = carrier.toLowerCase().includes(filters.value.carrier.toLowerCase());
    const buildingMatch = building.toLowerCase().includes(filters.value.building.toLowerCase());
    const statusMatch = filters.value.status === '' || 'Not Delivered'.toLowerCase().includes(filters.value.status.toLowerCase());
    
    return trackingMatch && carrierMatch && buildingMatch && statusMatch;
  });
});

// const loadData = () => {
//   try {
//     // Example query - adjust table name and columns to match your database
//   const { data } = await supabase
//     .from("package")
//     .select("*");
//     console.log(data.value);
//   } catch (err) {
//     console.error("Failed to load data:", err);
//   }
// };
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;
    packages.value = []; // Reset packages before fetching

    const { data, error: fetchError } = await supabase
      .from("lost_package")
      .select("*");

    if (fetchError) {
      throw fetchError;
    }

    if (data) {
      packages.value = data;
      console.log("Fetched packages:", data);
    } else {
      packages.value = [];
      console.log("No data returned from database");
    }
  } catch (err) {
    error.value = err.message;
    console.error("Error fetching data:", err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-header {
  text-align: left;
  padding: 40px 20px;
  margin-bottom: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.page-header h1 {
  font-size: 2.5em;
  margin: 0;
  color: #333;
  font-weight: bold;
}

.page-header .subtitle {
  font-size: 1.2em;
  color: #666;
  margin: 10px 0 0 0;
}

.filter-section {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 200px;
}

.filter-input:focus {
  outline: none;
  border-color: #666;
}

.clear-filters-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-filters-btn:hover {
  background-color: #e0e0e0;
}

.clear-filters-btn:active {
  background-color: #d0d0d0;
}

.packages-table {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  padding: 12px;
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
  font-weight: bold;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.table-row:nth-child(even) {
  background-color: #f9f9f9;
}

.table-row:hover {
  background-color: #f0f0f0;
}

.table-header div,
.table-row div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 8px;
}
</style>
