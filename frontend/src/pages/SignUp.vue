<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="title-container">
        <h1 class="auth-title">Create Your Account</h1>
      </div>
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
import { ref, computed } from "vue";
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
const errorMessage = ref(null); // for catch block

// Some regex patterns for validation
// phoneRegex and umbcIdRegex follow "allow" logic
// nameRegex follows "deny" logic
// this impacts the tests for validation below
const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
const umbcIdRegex = /^[A-Za-z]{2}\d{5}$/;
const nameRegex = /[0-9!@#$%^&*()_+=<>?/\\|~\[\]{}]/;

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

  if (nameRegex.test(firstName.value))
    firstNameError.value = "Name cannot contain numbers or special characters.";

  if (nameRegex.test(lastName.value))
    lastNameError.value = "Name cannot contain numbers or special characters.";

  if (password.value.length < 6)
    passwordError.value = "Password must be at least 6 characters.";

  if (!phoneRegex.test(phone.value))
    phoneError.value =
      "Please enter valid phone number in format (XXX-XXX-XXXX)";

  if (!email.value.endsWith("@umbc.edu"))
    emailError.value = "Please enter valid UMBC email (...@umbc.edu)";

  if (!umbcIdRegex.test(workerId.value))
    workerIdError.value = "Please enter valid UMBC ID (AB12345)";

  /*
  const validationErrors = [];

  // no specific format validation, just making sure they're not empty
  if (!firstName.value) validationErrors.push("First name is required.");
  if (!lastName.value) validationErrors.push("Last name is required.");
  if (!password.value) validationErrors.push("Password is required.");

  // Now for the format-specific validation
  if (!phone.value) validationErrors.push("Phone number is required.");
  else if (!phoneRegex.test(phone.value))
    validationErrors.push(
      "Please enter valid phone number format (XXX-XXX-XXXX)",
    );

  if (!email.value) validationErrors.push("UMBC email is required.");
  else if (!email.value.endsWith("@umbc.edu"))
    validationErrors.push("Please enter valid UMBC email (...@umbc.edu)");

  if (!workerId.value) validationErrors.push("UMBC ID is required.");
  else if (!umbcIdRegex.test(workerId.value))
    validationErrors.push("Please enter valid UMBC ID (AB12345)");

  if (validationErrors.length > 0) {
    errorMessage.value = validationErrors.join("\n");
    isSubmitting.value = false;
    return;
  }

  */

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

    if (authError) {
      errorMessage.value = authError;
    }
    authUser = authData.user;

    // Create the worker profile
    const { error: profileError } = await supabase.from("worker").insert([
      {
        worker_id: workerId.value.trim().toUpperCase(),
        worker_first_name: firstName.value.trim(),
        worker_last_name: lastName.value.trim(),
        worker_phone: phone.value.trim(),
        worker_email: email.value.trim(),
      },
    ]);

    if (profileError) {
      errorMessage.value = profileError;
    }

    alert(
      "Account created successfully! You will be redirected to the home page.",
    );
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
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.07),
    0 2px 4px -2px rgba(0, 0, 0, 0.07);
}

.auth-form .form-group {
  margin-bottom: 20px;
}

.auth-footer {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  grid-column: 1 / -1;
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
  color: #991b1b;
  white-space: pre-line;
  text-align: center;
  padding: 16px;
}
.success-message {
  color: #065f46;
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
}

.form-group span::before {
  content: "⚠ ";
}

.form-group span {
  color: #991b1b;
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
}
</style>
