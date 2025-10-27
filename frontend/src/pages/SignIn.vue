<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="title-container">
        <h1 class="auth-title">Sign In</h1>
      </div>
      <p class="auth-subtitle">Enter your credentials to access your account</p>
    </div>

    <form @submit.prevent="handleSignIn" class="auth-form">
      <div class="form-group">
        <label for="email">Email Address *</label>
        <input
          type="email"
          id="email"
          v-model="email"
          required
          placeholder="Enter your email"
        />
      </div>

      <div class="form-group">
        <label for="password">Password *</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          placeholder="Enter your password"
        />
      </div>

      <div class="form-actions">
        <button class="submit-btn" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Signing In..." : "Sign In" }}
        </button>
      </div>

      <div class="auth-footer">
        <p>
          Don't have an account?
          <router-link to="/signup" class="auth-link">Sign Up</router-link>
        </p>
      </div>
    </form>

    <div class="error-message" v-if="errorMessage">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { supabase } from "../composables/supabase";
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("");
const password = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

const handleSignIn = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "Please fill in all fields";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    // Fetch worker details from the worker table
    const { data: workerData, error: workerError } = await supabase
      .from("worker")
      .select("*")
      .eq("worker_email", email.value)
      .single();

    if (workerError || !workerData) {
      errorMessage.value =
        "No worker account found with this email. Please contact your administrator.";
      isSubmitting.value = false;
      return;
    }

    router.push("/profile");
  } catch (error) {
    console.error("Sign in error:", error);
    errorMessage.value =
      error.message || "Failed to sing in. Please checn your credentials.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>
