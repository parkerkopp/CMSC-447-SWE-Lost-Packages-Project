<template>
  <div class="reports-container">
    <h1>Package Info</h1>
    <form @submit.prevent="reportFormSubmit" class="report-form">
      <div class="form-group">
        <label for="tracking-num">Tracking Number:</label>
        <input
          type="text"
          id="tracking-num"
          v-model="trackingNumber"
          required
        />
      </div>
      <div class="form-group">
        <label for="recipiant-name">Name on label:</label>
        <input
          type="text"
          id="recipiant-name"
          v-model="recipiantName"
          required
        />
      </div>
      <div class="form-group">
        <label for="building">What building was it found:</label>
        <input type="text" id="building" v-model="buildingInfo" required />
      </div>
      <div class="form-group">
        <label for="room">What is the current room (if any):</label>
        <input type="text" id="room" v-model="roomInfo" />
      </div>

      <button type="submit">Submit Package Info</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

// reactive variables to hold the package info data
const trackingNumber = ref("");
const recipiantName = ref("");
const buildingInfo = ref("");
const roomInfo = ref("");

/// 'emits' sends data to the parent component
const emit = defineEmits(["formSubmit"]);

const reportFormSubmit = () => {
  // package object with the current package form data
  const packageData = {
    tracking: trackingNumber.value,
    recipiant: recipiantName.value,
    building: buildingInfo.value,
    room: roomInfo.value,
    collected: false,
  };

  // Emits the data to the parent component
  emit("formSubmit", packageData);

  // Clear the form after submission
  trackingNumber.value = "";
  recipiantName.value = "";
  buildingInfo.value = "";
  roomInfo.value = "";

  console.log(packageData);
};
</script>
