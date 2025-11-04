<template>
  <div class="packages-container">
    <div class="page-header">
      <img src="../assets/package.png" alt="packages" />
      <h1>Lost Packages</h1>
    </div>
    <p class="subtitle">View and manage package delivery status</p>
    <div v-if="error" class="error">Error: {{ error }}</div>
    <div v-if="loading" class="loading">Loading database...</div>
    <div v-else-if="!error">
      <!-- Filter Section -->
      <div class="card filter-card">
        <div class="filter-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-filter"
          >
            <polygon
              points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
            ></polygon>
          </svg>
          <h3>Filters</h3>
        </div>
        <div class="filter-grid">
          <div class="filter-group">
            <label for="search-tracking">Search</label>
            <input
              id="search-tracking"
              v-model="filters.trackingNum"
              placeholder="Search by tracking # or name"
              class="filter-input"
            />
          </div>
          <div class="filter-group">
            <label for="filter-carrier">Carrier</label>
            <select
              id="filter-carrier"
              v-model="filters.carrier"
              class="filter-select"
            >
              <option value="">All carriers</option>
              <option
                v-for="carrier in uniqueCarriers"
                :key="carrier"
                :value="carrier"
              >
                {{ carrier }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filter-building">Building</label>
            <select
              id="filter-building"
              v-model="filters.building"
              class="filter-select"
            >
              <option value="">All buildings</option>
              <option
                v-for="building in uniqueBuildings"
                :key="building"
                :value="building"
              >
                {{ building }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filter-status">Status</label>
            <select
              id="filter-status"
              v-model="filters.status"
              class="filter-select"
            >
              <option value="">All statuses</option>
              <option
                v-for="statusOption in uniqueStatuses"
                :key="statusOption"
                :value="statusOption"
              >
                {{ statusOption }}
              </option>
            </select>
          </div>
        </div>
        <button @click="clearFilters" class="clear-filters-btn">
          Clear Filters
        </button>
      </div>

      <div class="card package-list-card">
        <div class="package-list-header">
          <h3>Package List ({{ filteredPackages.length }} packages)</h3>
        </div>
        <div class="table-responsive">
          <table class="packages-table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Recipient</th>
                <th>Building</th>
                <th>Room</th>
                <th>Date</th>
                <th>Carrier</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredPackages" :key="item.id">
                <td>{{ item.tracking_num }}</td>
                <td>{{ item.recipient_name }}</td>
                <td>{{ item.building }}</td>
                <td>{{ item.room_num }}</td>
                <td>{{ item.date }}</td>
                <td>{{ item.carrier }}</td>
                <td>
                  <span
                    :class="['status-badge', getStatusClass(item.status)]"
                    >{{ item.status }}</span
                  >
                </td>
                <td>{{ item.notes }}</td>
              </tr>
            </tbody>
          </table>
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
  trackingNum: "",
  carrier: "",
  building: "",
  status: "",
});

const clearFilters = () => {
  filters.value = {
    trackingNum: "",
    carrier: "",
    building: "",
    status: "",
  };
};

// Computed properties for unique filter options (for dropdowns)
const uniqueCarriers = computed(() => {
  const carriers = new Set(
    packages.value.map((pkg) => pkg.carrier).filter(Boolean),
  );
  return Array.from(carriers);
});

const uniqueBuildings = computed(() => {
  const buildings = new Set(
    packages.value.map((pkg) => pkg.building).filter(Boolean),
  );
  return Array.from(buildings);
});

const uniqueStatuses = computed(() => {
  // Assuming 'status' is a field in your package data, e.g., 'Pending', 'Delivered', 'Lost'
  const statuses = new Set(
    packages.value.map((pkg) => pkg.status).filter(Boolean),
  );
  return Array.from(statuses);
});

// Helper to get status class for styling
const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "status-pending";
    case "delivered":
      return "status-delivered";
    case "lost":
      return "status-lost";
    default:
      return "";
  }
};

// Computed property for filtered packages
const filteredPackages = computed(() => {
  return packages.value.filter((pkg) => {
    const tracking = (pkg.tracking_num || "").toString().toLowerCase();
    const recipient = (pkg.recipient_name || "").toString().toLowerCase(); // Add recipient to search
    const carrier = (pkg.carrier || "").toString().toLowerCase();
    const building = (pkg.building || "").toString().toLowerCase();
    const status = (pkg.status || "").toString().toLowerCase();

    const searchFilter = filters.value.trackingNum.toLowerCase();

    const trackingOrRecipientMatch =
      tracking.includes(searchFilter) || recipient.includes(searchFilter);

    const carrierMatch =
      filters.value.carrier === "" ||
      carrier === filters.value.carrier.toLowerCase();

    const buildingMatch =
      filters.value.building === "" ||
      building === filters.value.building.toLowerCase();

    const statusMatch =
      filters.value.status === "" ||
      status === filters.value.status.toLowerCase();

    return (
      trackingOrRecipientMatch && carrierMatch && buildingMatch && statusMatch
    );
  });
});

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
      // Ensure 'status' field exists or set a default if not present in your actual data
      packages.value = data.map((pkg) => ({
        ...pkg,
        status: pkg.status || "Pending", // Default status if not provided by Supabase
      }));
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