<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="title-container">
        <h1 class="auth-title">Sign In</h1>
      </div>
      <p class="auth-subtitle">Enter your credentials to access your account</p>
    </div>

    <!-- The @submit.prevent calls our handleSignIn function -->
    <form @submit.prevent="handleSignIn" class="auth-form" novalidate>
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

      <div class="button-group">
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
const isSubmitting = ref(false);
const errorMessage = ref("");

/**
 * Handles the user sign-in process.
 */
const handleSignIn = async () => {
  isSubmitting.value = true;
  errorMessage.value = "";

  if (!email.value || !password.value) {
    errorMessage.value = "Please fill in all fields";
    isSubmitting.value = false;
    return;
  }

  if (!email.value.endsWith("@umbc.edu")) {
    errorMessage.value = "Please enter valid UMBC email (...@umbc.edu)";
    isSubmitting.value = false;
    return;
  }

  try {
    // This signs the user in against the 'auth.users' table
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      // Handle auth errors (e.g., "Invalid login credentials")
      throw error;
    }

    // If sign-in is successful, 'data.user' will exist
    router.push("/");

  } catch (error) {
    console.error("Sign in error:", error);
    errorMessage.value = error.message || "Failed to sign in. Please check your credentials.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
  /* Sign In Page Styles */
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
  width: 100%;
  max-width: 400px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07);
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