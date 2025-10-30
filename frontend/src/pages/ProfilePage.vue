<template>
  <div class="profile-page-container">
    <div class="profile-page-content">
      <!-- Page Header -->
      <div class="profile-header">
        <img src="../assets/user.png" alt="employee" />
        <h1>Employee Profile</h1>
      </div>
      <p class="subtitle">
        View and manage your profile information and system access.
      </p>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading profile data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
      </div>

      <!-- Profile Content Grid -->
      <div v-else-if="employeeProfile" class="profile-content-grid">
        <!-- Left Column -->
        <div class="profile-column-left">
          <div class="profile-card">
            <!-- Avatar, Name, and Position -->
            <div class="profile-summary">
              <div class="profile-avatar">{{ initials }}</div>
              <h2 class="profile-name">
                {{ employeeProfile.worker_first_name }}
                {{ employeeProfile.worker_last_name }}
              </h2>
              <p class="profile-position">{{ employeeProfile.position }}</p>
            </div>

            <!-- Contact Details List -->
            <ul class="contact-list">
              <li class="contact-item">
                <span class="contact-icon"
                  ><img src="../assets/mail.png" alt="email"
                /></span>
                <span class="contact-text">{{
                  employeeProfile.worker_email
                }}</span>
              </li>
              <li class="contact-item">
                <span class="contact-icon">
                  <img src="../assets/telephone.png" alt="phone" />
                </span>
                <span class="contact-text">{{
                  employeeProfile.worker_phone
                }}</span>
              </li>
              <!-- NOTE: The fields below are from Figma but NOT in your 'worker' table schema -->
              <li class="contact-item">
                <span class="contact-icon"
                  ><img src="../assets/business-and-trade.png" alt="building"
                /></span>
                <span class="contact-text">Student Services Building</span>
              </li>
              <li class="contact-item">
                <span class="contact-icon"
                  ><img src="../assets/calendar.png" alt="start date"
                /></span>
                <span class="contact-text">Started 2022-03-15</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right Column -->
        <div class="profile-column-right">
          <!-- Employment Details Card -->
          <div class="profile-card">
            <h3 class="card-title">Employment Details</h3>
            <div class="details-grid">
              <div class="detail-item">
                <label class="detail-label">Employee ID</label>
                <p class="detail-value">{{ employeeProfile.worker_id }}</p>
              </div>
              <div class="detail-item">
                <!-- NOTE: This field is from Figma but NOT in your 'worker' table schema -->
                <label class="detail-label">Department</label>
                <p class="detail-value">Mail Services</p>
              </div>
              <div class="detail-item">
                <label class="detail-label">Position</label>
                <p class="detail-value">{{ employeeProfile.position }}</p>
              </div>
              <div class="detail-item">
                <!-- NOTE: This field is from Figma but NOT in your 'worker' table schema -->
                <label class="detail-label">Start Date</label>
                <p class="detail-value">2022-03-15</p>
              </div>
            </div>
          </div>

          <!-- System Permissions Card -->
          <div class="profile-card">
            <h3 class="card-title">System Permissions</h3>
            <div class="permission-tags-container">
              <span class="permission-tag">Package Entry</span>
              <span class="permission-tag">Report Generation</span>
              <span class="permission-tag">Status Updates</span>
            </div>
          </div>

          <!-- Reports Card (Replaces Work Schedule) -->
          <div class="profile-card">
            <h3 class="card-title">Reports</h3>

            <div v-if="reports.length > 0" class="report-list-container">
              <ul class="report-list">
                <li
                  v-for="report in reports"
                  :key="report.report_num"
                  class="report-list-item"
                >
                  <div class="report-info">
                    <p class="report-number">Report #{{ report.report_num }}</p>
                    <p class="report-tracking">
                      Tracking: {{ report.tracking_num }}
                    </p>
                  </div>
                  <span
                    :class="[
                      'status-badge',
                      report.completed_status === 'Completed'
                        ? 'status-completed'
                        : 'status-pending',
                    ]"
                  >
                    {{ report.completed_status }}
                  </span>
                </li>
              </ul>
            </div>

            <div v-else class="empty-state">
              <p>No reports found for this worker.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "../composables/supabase";
// import { useRouter } from 'vue-router'; // Not needed for the temporary fix

// --- Reactive Data ---
const employeeProfile = ref(null);
const reports = ref([]);
const loading = ref(true); // Start in loading state
const error = ref(null); // For storing error messages
// const router = useRouter(); // Not needed for the temporary fix

// --- Computed Properties ---
const initials = computed(() => {
  if (
    employeeProfile.value &&
    employeeProfile.value.worker_first_name &&
    employeeProfile.value.worker_last_name
  ) {
    const first = employeeProfile.value.worker_first_name[0] || "";
    const last = employeeProfile.value.worker_last_name[0] || "";
    return `${first}${last}`.toUpperCase();
  }
  return "";
});

/**
 * Fetches the profile and reports for a given worker ID.
 */
async function fetchProfileData(workerId) {
  loading.value = true;
  error.value = null;

  if (!workerId) {
    error.value = "No worker ID provided.";
    loading.value = false;
    return;
  }

  try {
    // 1. Fetch worker data from 'worker' table
    // We use .limit(1) to get an array with just one row.
    const { data: workerData, error: workerError } = await supabase
      .from("worker")
      .select("*")
      .eq("worker_id", workerId) // Use the dynamic workerId
      .limit(1); // Get only one record

    if (workerError) {
      console.error("Error fetching worker profile:", workerError.message);
      throw new Error(workerError.message);
    }

    // Check if the array is empty (this is what's happening now)
    if (!workerData || workerData.length === 0) {
      throw new Error(`Worker profile not found (ID: ${workerId}).`);
    }

    // Assign the *first item* from the array (index 0)
    employeeProfile.value = workerData[0];

    // 2. Fetch reports data from 'report' table
    const { data: reportsData, error: reportsError } = await supabase
      .from("report")
      .select("*")
      .eq("worker_id", workerId)
      .order("report_num", { ascending: false }); // Order reports

    if (reportsError) {
      console.error("Error fetching reports:", reportsError.message);
      // Don't throw, just log it. We can still show the profile.
      error.value = "Could not load reports.";
    }

    reports.value = reportsData || [];
  } catch (err) {
    console.error("Error in fetchProfileData:", err.message);
    error.value = err.message;
    employeeProfile.value = null; // Clear profile on error
  } finally {
    loading.value = false; // Stop loading state
  }
}

/**
 * Gets the current authenticated user session.
 * --- TEMPORARILY COMMENTED OUT ---
 * This is the correct long-term solution, but it requires
 * you to have a /login route and working authentication.
 */
/*
async function getUserSession() {
  loading.value = true;
  error.value = null;

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      error.value = "You are not logged in.";
      router.push('/login'); 
      return;
    }

    const userWorkerId = user.user_metadata?.worker_id; 

    if (!userWorkerId) {
      throw new Error("Your user account is not linked to a worker profile.");
    }

    await fetchProfileData(userWorkerId);

  } catch (err) {
    console.error("Auth error:", err.message);
    error.value = err.message;
    loading.value = false;
    if (err.message !== "Your user account is not linked to a worker profile.") {
      router.push('/login');
    }
  }
}
*/

// --- Lifecycle Hooks ---
onMounted(() => {
  // --- TEMPORARY FIX ---
  // We are bypassing the login check and loading a static ID
  // to let you see the page.
  // Replace 'DD01234' with one of your real worker IDs.
  fetchProfileData("DD01345");

  // --- REAL FIX (use this later) ---
  // Once you have a /login route and auth is working,
  // comment out the line above and uncomment this one:
  // getUserSession();
});
</script>
