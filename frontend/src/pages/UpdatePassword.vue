<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Set New Password</h1>
      <p class="auth-subtitle">Please enter your new password below.</p>
    </div>

    <form @submit.prevent="handleUpdatePassword" class="auth-form" novalidate>
      <div class="form-group">
        <label for="password">New Password *</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          placeholder="Enter new password"
        />
        <span v-if="passwordError">{{ passwordError }}</span>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password *</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          required
          placeholder="Confirm new password"
        />
        <span v-if="confirmPasswordError">{{ confirmPasswordError }}</span>
      </div>

      <div class="button-group">
        <button
          class="submit-btn"
          type="submit"
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? "Updating..." : "Update Password" }}
        </button>
      </div>
    </form>

    <div class="error-message" v-if="errorMessage">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { supabase } from "../composables/supabase";
import { useRouter } from "vue-router";

const router = useRouter();

const password = ref("");
const confirmPassword = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

const passwordError = ref(null);
const confirmPasswordError = ref(null);

// Validation: Button disabled until fields are filled
const isFormValid = computed(() => {
  return password.value.trim() !== "" && confirmPassword.value.trim() !== "";
});

const handleUpdatePassword = async () => {
  isSubmitting.value = true;
  errorMessage.value = "";
  passwordError.value = null;
  confirmPasswordError.value = null;

  let hasError = false;

  if (password.value.length < 6) {
    passwordError.value = "Password must be at least 6 characters.";
    hasError = true;
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = "Passwords do not match.";
    hasError = true;
  }

  if (hasError) {
    isSubmitting.value = false;
    return;
  }

  try {
    // This function works because the user is currently logged in
    // via the link they clicked in their email.
    const { error } = await supabase.auth.updateUser({
      password: password.value,
    });

    if (error) throw error;

    alert("Password updated successfully! Redirecting to home...");
    router.push("/"); 
  } catch (error) {
    console.error("Update password error:", error);
    errorMessage.value = error.message || "Failed to update password.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Re-using styles from SignIn/SignUp to match perfectly */
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
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
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
  border: 1px solid #f4f4f4;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.07),
    0 2px 4px -2px rgba(0, 0, 0, 0.07);
}

.auth-form .form-group {
  margin-bottom: 20px;
}

.auth-form .button-group {
  margin-top: 24px;
}

.error-message {
  width: 100%;
  max-width: 400px;
  margin: 1.5rem auto;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  border-radius: 8px;
  box-sizing: border-box;
  color: #991b1b;
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
}

.form-group span {
  color: #991b1b;
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
  display: block;
}
.form-group span::before {
  content: "⚠ ";
}
</style>