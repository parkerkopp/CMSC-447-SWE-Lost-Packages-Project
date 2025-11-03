<template>
  <div class="profile-page">
    <div class="homepage-header">
      <h1 class="homepage-title">Packge Tacking System</h1>
      <p class="homepage-subtitle">
        Efficiently manage and track packages for UMBC campus. Report new
        packages, monitor lost items, and maintain delivery records.
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Active Packages</span>
          <div class="stat-icon">
            <img src="../assets/package.png" alt="package" />
          </div>
        </div>
        <div class="stat-value">{{ stats.activePackages }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Pending Reports</span>
          <div class="stat-icon">
            <img src="../assets/file.png" alt="reports" />
          </div>
        </div>
        <div class="stat-value">{{ stats.pendingReports }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">Active Staff</span>
          <div class="stat-icon">
            <img src="../assets/user.png" alt="staff" />
          </div>
        </div>
        <div class="stat-value">{{ stats.activeStaff }}</div>
      </div>
    </div>

    <!-- Action Cards -->
    <div class="action-grid">
      <div class="action-card">
        <div class="action-icon">
          <img src="../assets/file.png" alt="report" />
          <h2 class="action-title">Submit Package Report</h2>
          <p class="action-description">
            Record new package arrivals with tracking information, recipient
            details, and delivery location.
          </p>
          <button class="action-button" @click="navigateTo('/reports')">
            Create Report
          </button>
        </div>
      </div>

      <div class="action-card">
        <div class="action-icon">
          <img src="../assets/package.png" alt="packages" />
        </div>
        <h2 class="action-title">View Packages</h2>
        <p class="action-description">
          Browse and filter through packages that need attention or have
          delivery issues.
        </p>
        <button class="action-button" @click="navigateTo('/lost-packages')">
          View Packages
        </button>
      </div>

      <div class="action-card">
        <div class="action-icon">
          <img src="../assets/user.png" alt="employee" />
        </div>
        <h2 class="action-title">Employee Profile</h2>
        <p class="action-description">
          View your profile information, work shedule, and system access
          permissions.
        </p>
        <button class="action-button" @click="navigateTo('/profile')">
          View Profile
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../composables/supabase";

const router = useRouter();

const stats = ref({
  activePackages: 0,
  pendingReports: 0,
  activeStaff: 0,
});

const navigateTo = (path) => {
  router.push(path);
};

const fetchStats = async () => {
  try {
    // Get active packages (not delivered)
    const { count: activeCount, error: activeError } = await supabase
      .from("lost_package")
      .select("*", { count: "exact", head: true });

    if (!activeError) {
      stats.value.activePackages = activeCount || 0;
    }

    stats.value.activePackages = activeCount;

    // Get pending reports (assuming reports with specific status)
    const { count: pendingCount, error: pendingError } = await supabase
      .from("report")
      .select("*", { count: "exact", head: true })
      .eq("completed_status", "Not Delivered");

    if (!pendingError) {
      stats.value.pendingReports = pendingCount || 0;
    }

    stats.value.pendingReports = pendingCount;

    // Get active staff count
    const { count: staffCount, error: staffError } = await supabase
      .from("worker")
      .select("*", { count: "exact", head: true });

    if (!staffError) {
      stats.value.activeStaff = staffCount || 0;
    }

    stats.value.activeStaff = staffCount;
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
};

onMounted(() => {
  fetchStats();
});
</script>
