<template>
  <div class="reports-container">
    <div class="report-title-container">
      <img src="../assets/package.png" alt="package" class="icon" />
      <h1 class="report-title">Package Report</h1>
    </div>
    <p class="subtitle">
      Enter package information for tracking and delivery management
    </p>

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
          <span v-if="trackingError">{{ trackingError }}</span>
          <!-- NEW -->
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
          <span v-if="recipientError">{{ recipientError }}</span>
          <!-- NEW -->
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
          <label for="room-num">Room Number (Optional)</label>
          <input
            type="text"
            id="room-num"
            v-model="roomNum"
            maxlength="8"
            placeholder="Room number"
          />
          <span v-if="roomNumError">{{ roomNumError }}</span>
          <!-- NEW -->
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
          <label for="carrier">Shipping Carrier (Optional)</label>
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

        <div v-if="submitSuccess" class="success-message">
          Package reported successfully!    
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

// NEW: Refs for my inline error messages
const trackingError = ref(null);
const recipientError = ref(null);
const roomNumError = ref(null);

// NEW: Regex expresssion for tracking num and room num
const alphaNumericRegex = /^[A-Za-z0-9]+$/;

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
  "Sondheim Hall",
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
  submitSuccess.value = false;
  submitError.value = null;
  trackingError.value = null;
  recipientError.value = null;
  roomNumError.value = null;

  if (!isFormValid.value) {
    submitError.value = "Please fill in all required fields.";
    return;
  }

  const normalizeRecipientName = recipientName.value
    .trim()
    .split(/\s+/)
    .join(" ");

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

  let hasError = false;
  try {
    const { data: existingPackage } = await supabase
      .from("lost_package")
      .select("id")
      .eq("tracking_num", trackingNumber.value.trim())
      .maybeSingle();

    if (
      !alphaNumericRegex.test(trackingNumber.value.trim()) ||
      trackingNumber.value.trim().length < 8
    ) {
      trackingError.value = "Please enter a valid tracking number.";
      hasError = true;
    }

    if (existingPackage) {
      trackingError.value =
        "This tracking number has already been reported. Please check the number.";
      hasError = true;
    }

    if (!validateRecipiantName(recipientName.value)) {
      recipientError.value = "Please enter a valid recipient name.";
      hasError = true;
    }

    if (
      roomNum.value.trim() !== "" &&
      !alphaNumericRegex.test(roomNum.value.trim())
    ) {
      roomNumError.value = "Room number can only contain letters and numbers.";
      hasError = true;
    }

    if (hasError) return;

    // Insert data into Supabase
    const { data, error } = await supabase.rpc(
      "submit_package_report",
      packageData,
    );

    if (error) throw error;

    // console.log("Package and report inserted successfully:", data);
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

// NEW: Updated to include regex and space check
const validateRecipiantName = (name) => {
  const trimmedName = name.trim();
  const invalidChars = /[0-9!@#$%^&*()_+=<>?/\\|~\[\]{}]/;
  const maxSpaces = 1;

  if (invalidChars.test(trimmedName)) return false;
  const spaceCount = (trimmedName.match(/\s/g) || []).length;
  if (spaceCount > maxSpaces) return false;

  return true;
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
