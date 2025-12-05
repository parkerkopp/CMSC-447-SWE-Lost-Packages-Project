<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Create Your Account</h1>
      <p class="auth-subtitle">
        Link your employee ID to create a secure login.
      </p>
    </div>

    <form @submit.prevent="handleSignUp" class="auth-form" novalidate>
      <div class="form-group">
        <label for="first_name">First Name *</label>
        <input
          type="text"
          id="first_name"
          v-model="firstName"
          required
          placeholder="Enter your first name"
        />
        <span v-if="firstNameError">{{ firstNameError }}</span>
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
        <span v-if="lastNameError">{{ lastNameError }}</span>
      </div>

      <div class="form-group">
        <label for="phone">Phone Number *</label>
        <input
          type="tel"
          id="phone"
          v-model="phone"
          required
          placeholder="Enter work phone (XXX-XXX-XXXX)"
        />
        <span v-if="phoneError">{{ phoneError }}</span>
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
        <span v-if="emailError">{{ emailError }}</span>
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
        <span v-if="workerIdError">{{ workerIdError }}</span>
      </div>

      <div class="form-group">
        <label for="password">Password *</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          placeholder="Create a new password"
          minlength="6"
        />
        <span v-if="passwordError">{{ passwordError }}</span>
      </div>

      <div v-if="errorMessage" class="error-message-container">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <div class="button-group full-width">
        <button
          class="submit-btn"
          type="submit"
          :disabled="!isFormValid || isSubmitting"
        >
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
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import { supabase } from "../composables/supabase";
import { useRouter } from "vue-router";

const router = useRouter();

// fields ref
const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const email = ref("");
const workerId = ref("");
const password = ref("");

// state refs
const isSubmitting = ref(false);
const firstNameError = ref(null);
const lastNameError = ref(null);
const phoneError = ref(null);
const emailError = ref(null);
const workerIdError = ref(null);
const passwordError = ref(null);
const successMessage = ref(null);
const errorMessage = ref(null); // for catch block
let errorTimeout = null;

// Some regex patterns for validation
// phoneRegex and umbcIdRegex follow "allow" logic
// nameRegex follows "deny" logic
// this impacts the tests for validation below
const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
const umbcIdRegex = /^[A-Za-z]{2}\d{5}$/;
const nameRegex = /[0-9!@#$%^&*()_+=<>?/\\|~\[\]{}\s]/;
const emailRegex = /^[A-Za-z0-9]+@umbc\.edu$/;

// Form validation
const isFormValid = computed(() => {
  return (
    firstName.value.trim() !== "" &&
    lastName.value.trim() !== "" &&
    phone.value.trim() !== "" &&
    email.value.trim() !== "" &&
    workerId.value.trim() !== "" &&
    password.value.trim() !== ""
  );
});

// Handles the user sign-up process.
const handleSignUp = async () => {
  isSubmitting.value = true;
  firstNameError.value = null;
  lastNameError.value = null;
  phoneError.value = null;
  emailError.value = null;
  workerIdError.value = null;
  passwordError.value = null;
  errorMessage.value = null;

  if (nameRegex.test(firstName.value.trim()))
    firstNameError.value = "Name cannot contain numbers or special characters.";

  if (nameRegex.test(lastName.value.trim()))
    lastNameError.value = "Name cannot contain numbers or special characters.";

  if (password.value.length < 6)
    passwordError.value = "Password must be at least 6 characters.";

  if (!phoneRegex.test(phone.value))
    phoneError.value =
      "Please enter valid phone number in format (XXX-XXX-XXXX)";

  if (!emailRegex.test(email.value))
    emailError.value = "Please enter valid UMBC email (...@umbc.edu)";

  if (!umbcIdRegex.test(workerId.value))
    workerIdError.value = "Please enter valid UMBC ID (AB12345)";

  // stops form submission in case of any error
  if (
    firstNameError.value ||
    lastNameError.value ||
    phoneError.value ||
    emailError.value ||
    workerIdError.value ||
    passwordError.value
  ) {
    isSubmitting.value = false;
    return;
  }

  let authUser = null; // to hold user in handleSignUp

  try {
    // Create the user in the 'auth.users' table
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        // Pass the worker_id into the user's metadata
        data: {
          worker_id: workerId.value.trim().toUpperCase(),
        },
      },
    });

    if (authError) throw authError;
    authUser = authData.user;

    // Create the worker profile
    const { error: profileError } = await supabase.from("worker").insert([
      {
        worker_id: workerId.value.trim().toUpperCase(),
        worker_first_name: firstName.value.trim(),
        worker_last_name: lastName.value.trim(),
        worker_phone: phone.value.trim(),
        worker_email: email.value.trim().toLowerCase(),
      },
    ]);

    if (profileError) throw profileError;

    successMessage.value =
      "Account created successfully! You will be redirected to the home page.";

    setTimeout(() => {
      router.push("/");
    }, 1500);
  } catch (error) {
    console.error("Sign up error:", error);

    if (error.message.includes("User already registered")) {
      errorMessage.value = "An account with this email already exists.";
    } else {
      errorMessage.value = error.message || "Failed to create account.";
    }

    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }

    errorTimeout = setTimeout(() => {
      errorMessage.value = null;
    }, 3000);
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
  font-size: 2rem;
  font-weight: 700;
  color: var(--umbc-black);
  margin: 0;
  text-align: center;
}

.auth-subtitle {
  font-size: 16px;
  color: var(--umbc-dark-gray);
  margin-top: 8px;
}

.auth-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  background-color: var(--container-background);
  border: 1px solid var(--background-color);
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: var(--box-shadow);
}

.auth-form .form-group {
  margin-bottom: 20px;
}

.auth-footer {
  text-align: center;
  font-size: 14px;
  color: var(--umbc-dark-gray);
  grid-column: 1 / -1;
}

.auth-link {
  color: var(--umbc-aok-teal); /* Using a generic blue */
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.auth-link:hover {
  color: var(--umbc-aok-teal-hover);
  text-decoration: underline;
}

/* Generic Error/Success Messages */
.error-message,
.success-message {
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
  color: var(--umbc-red);
  white-space: pre-line;
  text-align: center;
  padding: 16px;
}
.success-message {
  color: var(--umbc-aok-teal);
  background-color: var(--container-background);
  border: none;
}

.form-group span::before {
  content: "⚠ ";
}

.form-group span {
  color: var(--umbc-red);
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .auth-container {
    padding-top: 2rem;
    padding-left: 1rem;
    padding-right: 1rem;
    width: 100%;
    box-sizing: border-box;
  }

  .auth-form {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: 100%;
    padding: 1.5rem 1rem;
    box-sizing: border-box;
  }

  .auth-title {
    font-size: 1.75rem;
  }

  .form-group input {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
