<template>
  <div class="reports-container">
    <div class="report-title-container">
      <img src="../assets/package.png" alt="package" class="icon" />
      <h1 class="report-title">Package Report</h1>
    </div>
    <p class="subtitle">
      Enter package information for tracking and delivery management
    </p>
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
          <button type="submit" class="submit-btn" :disabled="!isFormValid">
            Submit Package Info
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

const reportFormSubmit = async () => {
  if (!isFormValid.value) {
    alert("Please fill in all required fields.");
    return;
  }

  // Reset messages
  submitSuccess.value = false;
  submitError.value = null;
  isSubmitting.value = true;

  // package object with the current package form data
  const packageData = {
    tracking_num: trackingNumber.value.trim(),
    recipient_name: recipientName.value.trim(),
    building: buildingInfo.value,
    room_num: roomNum.value.trim(),
    carrier: carrier.value || null,
    date: dateFound.value,
    notes: notes.value.trim() || null,
  };

  try {
    // Insert data into Supabase
    const { data, error } = await supabase
      .from("lost_package")
      .insert([packageData])
      .select(); // returns the new row(s) from the DB

    if (error) {
      throw error;
    }

    console.log("Package inserted successfully:", data);
    submitSuccess.value = true;

    // Clear form after successful Submission
    clearForm();

    // Hide success message after 3 seconds
    setTimeout(() => {
      submitSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error("Error submitting package:", error.message);
    alert(`Error submitting report: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const validateTrackingNum = (trackingNum) => {};
const validateRecipiant = (recipiant) => {};
const carrierAPICheck = (carrier) => {};

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
