<template>
  <div class="reports-container">
    <h1>Package Info</h1>
    <form @submit.prevent="reportFormSubmit" class="report-form">
      <div class="form-group">
        <label for="tracking-num">Tracking Number:</label>
        <input type="text" id="tracking-num" v-model="trackingNumber" maxlength="22" required
          placeholder="Enter tracking number" />
      </div>
      <div class="form-group">
        <label for="recipiant-name">Name on label:</label>
        <input type="text" id="recipiant-name" v-model="recipiantName" maxlength="40" required
          placeholder="Name as it appears on the package" />
      </div>
      <div class="form-group">
        <label for="building">What building was it found:</label>
        <select v-model="buildingInfo" id="building" required>
          <option value="">Select building...</option>
          <option v-for="building in availableBuildings" :key="building" :value="building">
            {{ building }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="collected_status">Collection Status:</label>
        <select id="collected-status" v-model="collectedStatus" required>
          <option value="">Select status...</option>
          <option value="NO">Not Collected</option>
          <option value="YES">Collected</option>
          <option value="TBD">To Be Determined</option>
        </select>
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

      <div class="form-group">
        <label for="date-found">Date Found:</label>
        <input type="date" id="date-found" v-model="dateFound" :max="today" required />
      </div>
      <div class="form-group">
        <label for="notes">Additional Notes (optional):</label>
        <textarea id="notes" v-model="notes" rows="3"
          placeholder="Any additional information about the package condition, location details, etc."></textarea>
      </div>

      <button type="submit" :disabled="!isFormValid">
        Submit Package Info
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// reactive variables to hold the package info data
const trackingNumber = ref("");
const recipiantName = ref("");
const buildingInfo = ref("");
const collectedStatus = ref("");
const carrier = ref("");
const dateFound = ref("");
const notes = ref("");

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
    recipiantName.value.trim() !== "" &&
    buildingInfo.value !== "" &&
    collectedStatus !== "" &&
    dateFound.value !== ""
  );
});

/// 'emits' sends data to the parent component
const emit = defineEmits(["formSubmit"]);

const reportFormSubmit = () => {
  if (!isFormValid.value) {
    alert("Please fill in all required fields.");
    return;
  }
  // package object with the current package form data
  const packageData = {
    tracking_num: trackingNumber.value.trim(),
    recipiant_name: recipiantName.value.trim(),
    current_building: buildingInfo.value,
    collected_status: collectedStatus.value,
    carrier: carrier.value || null,
    date_found: dateFound.value,
    notes: notes.value.trim() || null,
  };

  // Emits the data to the parent component
  emit("formSubmit", packageData);

  clearForm();
};

const clearForm = () => {
  trackingNumber.value = "";
  recipiantName.value = "";
  buildingInfo.value = "";
  collectedStatus.value = "";
  carrier.value = "";
  dateFound.value = "";
  notes.value = "";
};
</script>
