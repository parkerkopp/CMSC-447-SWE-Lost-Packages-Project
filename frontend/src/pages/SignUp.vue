<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="title-container">
        <h1 class="auth-title">Create Your Account</h1>
      </div>
      <p class="auth-subtitle">Link your employee ID to create a secure login.</p>
    </div>

    <form @submit.prevent="handleSignUp" class="auth-form">
      <div class="form-group">
        <label for="first_name">First Name *</label>
        <input
          type="text"
          id="first_name"
          v-model="firstName"
          required
          placeholder="Enter your first name"
        />
      </div>

      <div class="form-group">
        <label for="last_name">Last Name *</label>
        <input
          type="text"
          id="last_name"
          v-model="lastName"
          required
          placeholder="Enter your last name" 
        />
      </div>

      <div class="form-group">
        <label for="phone">Phone Number *</label>
        <input 
          type="phone"
          id="phone"
          v-model="phone"
          required
          placeholder="Enter work phone (XXX-YYY-ZZZZ)"
        />
      </div>

      <div class="form-group">
        <label for="email">Email Address *</label>
        <input
          type="email"
          id="email"
          v-model="email"
          required
          placeholder="Enter your work email"
        />
      </div>

      <div class="form-group">
        <label for="worker_id">UMBC ID *</label>
        <input
          type="text"
          id="worker_id"
          v-model="workerId"
          required
          placeholder="Enter your Employee ID (e.g., DD01345)"
        />
      </div>

      <div class="form-group">
        <label for="password">Password *</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          placeholder="Create a new password"
        />
      </div>

      <div class="button-group">
        <button class="submit-btn" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Creating Account..." : "Sign Up" }}
        </button>
      </div>

      <div class="auth-footer">
        <p>
          Already have an account?
          <router-link to="/signin" class="auth-link">Sign In</router-link>
        </p>
      </div>

    </form>

    <!-- Shows an error message if login fails -->
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
const workerId = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

/**
 * Handles the user sign-up process.
 */
const handleSignUp = async () => {
  if (!email.value || !password.value || !workerId.value) {
    errorMessage.value = "Please fill in all fields";
    return;
  }
  
  // We check if a worker profile already exists for this ID.
  const { data: worker, error: workerError } = await supabase
    .from('worker')
    .select('worker_id')
    .eq('worker_id', workerId.value.trim())
    .eq('worker_email', email.value.trim())
    .single();

  if (workerError || !worker) {
    errorMessage.value = "No worker profile found matching that ID and Email. Please contact your administrator.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    // Create the user in the 'auth.users' table
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        // Pass the worker_id into the user's metadata
        data: {
          worker_id: workerId.value.trim()
        }
      }
    });

    if (error) throw error;

    // If sign-up is successful, redirect to the home page.
    alert('Sign up successful! You will be redirected to the home page.');
    router.push("/");

  } catch (error) {
    console.error("Sign up error:", error);
    errorMessage.value = error.message || "Failed to create account.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 4rem;
}

.auth-card {
  text-align: center;
  margin-bottom: 24px;
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.auth-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin-top: 8px;
}

.auth-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 32px;
}

.auth-form .form-group {
  margin-bottom: 20px;
}

.auth-form .button-group { /* Use button-group for consistency */
  margin-top: 24px;
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #6b7280;
}

.auth-link {
  color: #4f46e5; /* Using a generic blue */
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.auth-link:hover {
  color: #4338ca;
  text-decoration: underline;
}

/* Generic Error/Success Messages */
.error-message, .success-message {
  width: 100%;
  max-width: 1200px; /* Match reports container */
  margin: 0 auto 1.5rem auto;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  border-radius: 8px;
  box-sizing: border-box;
}
.auth-form + .error-message {
  max-width: 400px; /* For signin page */
}

.error-message {
  color: #991b1b;
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
}
.success-message {
  color: #065f46;
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
}
</style>