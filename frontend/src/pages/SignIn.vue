<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Sign In</h1>
      <p class="auth-subtitle">Enter your credentials to access your account</p>
    </div>

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
        <span v-if="emailError">{{ emailError }}</span>
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
        <span v-if="passwordError">{{ passwordError }}</span>
      </div>

      <div class="button-group">
        <button
          class="submit-btn"
          type="submit"
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? "Signing In..." : "Sign In" }}
        </button>
      </div>

      <div class="auth-footer">
        <p>
          Don't have an account?
          <router-link to="/signup" class="auth-link">Sign Up</router-link>
        </p>
        <p style="margin-top: 10px;">
          <a href="#" @click.prevent="openForgotModal" class="auth-link">Forgot Password?</a>
        </p>
      </div>
    </form>

    <div class="error-message" v-if="errorMessage">
      {{ errorMessage }}
    </div>

    <div v-if="showForgotModal" class="modal-overlay" @click.self="closeForgotModal">
      <div class="modal-content forgot-modal-content">
        <h2 class="auth-title" style="margin-bottom: 1rem; font-size: 1.5rem;">Reset Password</h2>
        
        <div v-if="forgotSuccessMessage" class="success-message">
          {{ forgotSuccessMessage }}
        </div>
        
        <div v-else>
          <p class="auth-subtitle" style="margin-bottom: 1.5rem;">
            Enter your email and new password details.
          </p>

          <form @submit.prevent="handleForgotPassword" novalidate>
            <div class="form-group">
              <label for="resetEmail" style="text-align: left; display: block;">Email Address *</label>
              <input
                type="email"
                id="resetEmail"
                v-model="resetEmail"
                placeholder="Enter your work email"
                required
              />
              <span v-if="resetEmailError">{{ resetEmailError }}</span>
            </div>

            <div class="form-group">
              <label for="newPassword" style="text-align: left; display: block;">New Password *</label>
              <input
                type="password"
                id="newPassword"
                v-model="newPassword"
                placeholder="Enter new password"
                required
              />
              <span v-if="newPasswordError">{{ newPasswordError }}</span>
            </div>

            <div class="form-group">
              <label for="confirmPassword" style="text-align: left; display: block;">Confirm New Password *</label>
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                placeholder="Confirm new password"
                required
              />
              <span v-if="confirmPasswordError">{{ confirmPasswordError }}</span>
            </div>

            <div class="error-message" v-if="forgotErrorMessage" style="margin-top: 1rem;">
              {{ forgotErrorMessage }}
            </div>

            <div class="button-group" style="margin-top: 1.5rem;">
              <button class="clear-btn" type="button" @click="closeForgotModal" :disabled="isResetting">
                Cancel
              </button>
              <button class="submit-btn" type="submit" :disabled="isResetting">
                {{ isResetting ? "Updating..." : "Update Password" }}
              </button>
            </div>
          </form>
        </div>
        
        <div v-if="forgotSuccessMessage" class="button-group" style="justify-content: center;">
             <button class="submit-btn" @click="closeForgotModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { supabase } from "../composables/supabase";
import { useRouter } from "vue-router";

const router = useRouter();

// --- Sign In State ---
const email = ref("");
const password = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

// Validation Refs
const emailError = ref(null);
const passwordError = ref(null);

// Regex
const emailRegex = /^[A-Za-z0-9]+@umbc\.edu$/;

// Computed: Button is disabled unless fields are filled
const isFormValid = computed(() => {
  return (
    email.value.trim() !== "" &&
    password.value.trim() !== ""
  );
});

// --- Forgot Password State ---
const showForgotModal = ref(false);
const resetEmail = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const isResetting = ref(false);
const forgotErrorMessage = ref("");
const forgotSuccessMessage = ref("");

const resetEmailError = ref(null);
const newPasswordError = ref(null);
const confirmPasswordError = ref(null);

const isForgotFormValid = computed(() => {
  return (
    resetEmail.value.trim() !== "" &&
    newPassword.value.trim() !== "" &&
    confirmPassword.value.trim() !== ""
  );
});

// --- Sign In Logic ---
const handleSignIn = async () => {
  isSubmitting.value = true;
  errorMessage.value = "";
  emailError.value = null;
  passwordError.value = null;

  // 1. Client-side Validation (Inline)
  if (!emailRegex.test(email.value)) {
    emailError.value = "Please enter valid UMBC email (...@umbc.edu)";
  }

  // If any field errors exist, stop here.
  if (emailError.value || passwordError.value) {
    isSubmitting.value = false;
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) throw error;

    router.push("/");
  } catch (error) {
    console.error("Sign in error:", error);
    // General errors (like "Invalid login credentials") stay at the bottom
    errorMessage.value =
      error.message || "Failed to sign in. Please check your credentials.";
  } finally {
    isSubmitting.value = false;
  }
};

// --- Forgot Password Logic ---
const openForgotModal = () => {
  showForgotModal.value = true;
  resetEmail.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
  forgotErrorMessage.value = "";
  forgotSuccessMessage.value = "";
  resetEmailError.value = null;
  newPasswordError.value = null;
  confirmPasswordError.value = null;
};

const closeForgotModal = () => {
  showForgotModal.value = false;
};

const handleForgotPassword = async () => {
  isResetting.value = true;
  forgotErrorMessage.value = "";
  resetEmailError.value = null;
  newPasswordError.value = null;
  confirmPasswordError.value = null;

  let hasError = false;

  if (!resetEmail.value) {
    resetEmailError.value = "Email is required.";
    hasError = true;
  } else if (!emailRegex.test(resetEmail.value)) {
    resetEmailError.value = "Please enter valid UMBC email (...@umbc.edu)";
    hasError = true;
  }

  if (!newPassword.value) {
    newPasswordError.value = "New password is required.";
    hasError = true;
  } else if (newPassword.value.length < 6) {
    newPasswordError.value = "Password must be at least 6 characters.";
    hasError = true;
  }

  if (newPassword.value !== confirmPassword.value) {
    confirmPasswordError.value = "Passwords do not match.";
    hasError = true;
  }

  if (hasError) {
    isResetting.value = false;
    return;
  }

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail.value, {
      redirectTo: window.location.origin + '/reset-password',
    });

    if (error) throw error;

    forgotSuccessMessage.value = "Success! A password reset link has been sent to your email.";
    
  } catch (error) {
    console.error("Reset password error:", error);
    forgotErrorMessage.value = error.message || "Failed to initiate password reset.";
  } finally {
    isResetting.value = false;
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

.auth-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #6b7280;
}

.auth-link {
  color: #4f46e5; 
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
  cursor: pointer;
}

.auth-link:hover {
  color: #4338ca;
  text-decoration: underline;
}

/* Generic Error/Success Messages */
.error-message,
.success-message {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 1.5rem auto;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  border-radius: 8px;
  box-sizing: border-box;
}
.auth-form + .error-message {
  max-width: 400px;
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

/* Modal Specific Overrides */
.forgot-modal-content {
  text-align: left;
  max-width: 450px;
}

.forgot-modal-content .form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  background-color: #f4f4f4;
  box-sizing: border-box;
  margin-bottom: 8px;
}

/* Inline Error Styles (Same as SignUp) */
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