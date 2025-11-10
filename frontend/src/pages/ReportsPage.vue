<template>
  <div class="reports-container">
    <div class="report-title-container">
      <img src="../assets/package.png" alt="package" class="icon" />
      <h1 class="report-title">Package Report</h1>
    </div>
    <p class="subtitle">
      Enter package information for tracking and delivery management
    </p>

    <div v-if="submitSuccess" class="success-message">
      Package reported successfully!    
    </div>

    <div v-if="submitError" class="modal-overlay" @click.self="clearError">
      <div class="modal-content">
        <h2 class="modal-error-title">Submission Error</h2>
        <p class="modal-error-message">{{ submitError }}</p>
        <button @click="clearError" class="modal-close-btn">Close</button>
      </div>
    </div>

    <div class="reports-form-container">
      <p class="form-section-title">New Package Entry</p>
      <form @submit.prevent="reportFormSubmit" class="report-form">
        <div class="form-group">
          <label for="tracking-num">Tracking Number *</label>
          <input
            type="text"
            id="tracking-num"
            v-model="trackingNumber"
            maxlength="22"
            minlength="8"
            required
            placeholder="Enter tracking number"
          />
        </div>
        <div class="form-group">
          <label for="recipient-name">Recipient Name *</label>
          <input
            type="text"
            id="recipient-name"
            v-model="recipientName"
            maxlength="40"
            required
            placeholder="Name as it appears on the package"
          />
        </div>
        <div class="form-group">
          <label for="building">Building *</label>
          <select v-model="buildingInfo" id="building" required>
            <option value="">Select building</option>
            <option
              v-for="building in availableBuildings"
              :key="building"
              :value="building"
            >
              {{ building }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="room-num">Room Number</label>
          <input
            type="text"
            id="room-num"
            v-model="roomNum"
            maxlength="8"
            placeholder="Room number"
          />
        </div>

        <div class="form-group">
          <label for="date-found">Date Found *</label>
          <input
            type="date"
            id="date-found"
            v-model="dateFound"
            :max="today"
            required
          />
        </div>

        <!-- Typical package labels -->
        <div class="form-group">
          <label for="carrier">Shipping Carrier (optional):</label>
          <select id="carrier" v-model="carrier">
            <option value="">Select carrier...</option>
            <option value="UPS">UPS</option>
            <option value="FedEx">FedEx</option>
            <option value="USPS">USPS</option>
            <option value="DHL">DHL</option>
            <option value="Amazon">Amazon</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="form-group full-width">
          <label for="notes">Additional Notes (optional):</label>
          <textarea
            id="notes"
            v-model="notes"
            rows="3"
            placeholder="Any additional information about the package condition, location details, etc."
          ></textarea>
        </div>

        <div class="button-group full-width">
          <button
            type="submit"
            class="submit-btn"
            :disabled="!isFormValid || isSubmitting"
          >
            {{ isSubmitting ? "Submitting..." : "Submit Package Info" }}
          </button>
          <button type="button" class="clear-btn" @click="clearForm">
            Clear Form
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { supabase } from "../composables/supabase";

// reactive variables to hold the package info data
const trackingNumber = ref("");
const recipientName = ref("");
const buildingInfo = ref("");
const roomNum = ref("");
const carrier = ref("");
const dateFound = ref("");
const notes = ref("");

// Submission state
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref(null);

const availableBuildings = ref([
  "Academic Services",
  "Administration",
  "Alumni House",
  "Apartment Community Center",
  "Army ROTC",
  "Biological Sciences",
  "Central Plant",
  "The Commons",
  "Engineering",
  "Facilities Management",
  "Fine Arts",
  "Greenhouse",
  "Information Technology/Engineering (ITE)",
  "Library & Gallery, Albin O. Kuhn",
  "Mathematics & Phychology",
  "Meyerhoff Chemistry",
  "Naval ROTC",
  "Performing Arts and Humanities",
  "Physics",
  "Preschool Center",
  "Public Policy",
  "Retriever Activies Center (RAC)",
  "Satellite Utility Plant",
  "Sherman Hall",
  "Sonheim Hall",
  "Student Development & Success Center (SDSC)",
  "Technology Research Center (TRC)",
  "Tech 2",
  "True Grit's",
  "University Center",
  "UMBC Stadium Complex",
  "Warehouse",
]);

// Todays date
const today = new Date().toISOString().split("T")[0];

// Form validation
const isFormValid = computed(() => {
  return (
    trackingNumber.value.trim() !== "" &&
    recipientName.value.trim() !== "" &&
    buildingInfo.value !== "" &&
    dateFound.value !== ""
  );
});

const getErrorMessage = (error) => {
  if (!error || !error.message) {
    return "An unknown error occurred. Please try again.";
  }

  console.error("Raw Supabase Error:", error); // Logs the original error to the console for debugging

  // Duplicate tracking_num
  if (error.code === "23505") {
    if (error.message && error.message.includes("package_tracking_num_key")) {
      return "This tracking number has already been reported. Please check the number.";
    }
    return "A database conflict occurred. Please check your inputs.";
  }

  const message = error.message ? error.message.toLowerCase() : "";
  console.error("Raw Supbase Error:", message);

  // This check remains as a backup
  if (
    message.includes("duplicate key value") &&
    message.includes("package_tracking_num_key")
  ) {
    return "This tracking number has already been reported. Please check the number.";
  }

  // Network error
  if (
    message.includes("failed to fetch") ||
    message.includes("network error")
  ) {
    return "Could not connect to the server. Please check your internet connection.";
  }

  // RLS (Row Level Security) violation
  if (message.includes("violates row-level security policy")) {
    return "You do not have permission to submit this report.";
  }

  // Fallback for any other error
  return "An unexpected error occurred. Please try again later.";
};

const clearError = () => {
  submitError.value = null;
};

const reportFormSubmit = async () => {
  if (!isFormValid.value) {
    submitError.value = "Please fill in all required fields.";
    return;
  }

  if (!validateRecipiantName(recipientName.value)) {
    submitError.value =
      "Please enter a valid recipient name. Names cannot be just single letters separated by spaces (e.g., 'J o h n').";
    return;
  }

  const normalizeRecipientName = recipientName.value
    .trim()
    .split(/\s+/)
    .join(" ");

  // Reset messages
  submitSuccess.value = false;
  submitError.value = null;
  isSubmitting.value = true;

  // package object with the current package form data
  const packageData = {
    p_tracking_num: trackingNumber.value.trim(),
    p_recipient_name: normalizeRecipientName,
    p_building: buildingInfo.value,
    p_room_num: roomNum.value.trim(),
    p_carrier: carrier.value || null,
    p_date: dateFound.value,
    p_notes: notes.value.trim() || null,
  };

  try {
    // Insert data into Supabase
    const { data, error } = await supabase.rpc(
      "submit_package_report",
      packageData,
    );

    if (error) {
      submitError.value = getErrorMessage(error);
      return;
    }

    console.log("Package and report inserted successfully:", data);
    submitSuccess.value = true;

    // Clear form after successful Submission
    clearForm();

    // Hide success message after 3 seconds
    setTimeout(() => {
      submitSuccess.value = false;
    }, 3000);
  } catch (error) {
    submitError.value = getErrorMessage(error);
  } finally {
    isSubmitting.value = false;
  }
};

const validateRecipiantName = (name) => {
  const trimmedName = name.trim();

  const words = trimmedName.split(/\s+/);

  if (words.length <= 1) return true;

  if (words.length >= 5) return false;

  const allAreSingleLetters = words.every((word) => word.length === 1);

  return !allAreSingleLetters;
};

const clearForm = () => {
  trackingNumber.value = "";
  recipientName.value = "";
  buildingInfo.value = "";
  roomNum.value = "";
  carrier.value = "";
  dateFound.value = "";
  notes.value = "";
};
</script>

<!-- No <style scoped> block. All styles from global.css -->
