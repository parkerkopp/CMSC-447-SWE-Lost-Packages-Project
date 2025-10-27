<template>
  <div>
    Lost Packages Page
    <div v-if="loading">Loading database...</div>
    <div v-if="error" class="error">Error: {{ error }}</div>
    <div v-else>
      <ul class="packages-list">
        <li v-for="item in packages" :key="item.id" class="package-item">
          <div class="label-info">
            <p><strong>Tracking #:</strong> {{ item.tracking_num }}</p>
            <p><strong>Recipient:</strong> {{ item.recipient_name }}</p>
            <p><strong>Building:</strong> {{ item.building }}</p>
            <p><strong>Room:</strong> {{ item.room_num }}</p>
            <p><strong>Date:</strong> {{ item.date }}</p>
            <p><strong>Carrier:</strong> {{ item.carrier }}</p>
            <p><strong>Notes:</strong> {{ item.notes }}</p>
          </div>
          <span class="divider"></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../composables/supabase";

const packages = ref([]);
const loading = ref(false);
const error = ref(null); // Must be declared

onMounted(async () => {
  loading.value = true;
  error.value = null;

  const { data, error: fetchError } = await supabase
    .from("lost_package")
    .select("*");

  if (fetchError) {
    error.value = fetchError.message;
    console.error("Error fetching data:", fetchError);
  } else {
    packages.value = data;
    console.log(data);
  }

  loading.value = false;
});
</script>
