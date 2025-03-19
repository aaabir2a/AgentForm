"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Paper,
  Typography,
} from "@mui/material";
import { API_ENDPOINTS } from "@/constants/const";
import countryCodes from "@/constants/countryCodes";

// Update the Notification component to make success messages more visible
function Notification({ message, severity, onClose }) {
  if (!message) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        maxWidth: "90%",
        width: "400px",
      }}
    >
      <Alert
        severity={severity}
        onClose={onClose}
        sx={{
          width: "100%",
          boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
          ...(severity === "success" && {
            backgroundColor: "#e6f7e6",
            border: "1px solid #4caf50",
            fontSize: "1.1rem",
            fontWeight: "bold",
          }),
        }}
      >
        {message}
      </Alert>
    </Box>
  );
}

export default function MemberRegistrationForm() {
  const [formData, setFormData] = useState({
    first_name: "",
    username: "",
    email: "",
    primary_phone: "",
    permanent_address: "",
    is_active: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [countryCode, setCountryCode] = useState("+44");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Find the country object for the current country code
  const selectedCountry =
    countryCodes.find((country) => country.value === countryCode) ||
    countryCodes.find((country) => country.code === "BD");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      is_active: e.target.checked,
    });
  };

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
    setFormData({
      ...formData,
      primary_phone: countryCode + e.target.value,
    });

    // Clear error when user types
    if (errors.primary_phone) {
      setErrors({
        ...errors,
        primary_phone: undefined,
      });
    }
  };

  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    setFormData({
      ...formData,
      primary_phone: newCode + phoneNumber,
    });
  };

  const validateForm = async () => {
    const newErrors = {};

    // Basic validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!phoneNumber.trim()) {
      newErrors.primary_phone = "Phone number is required";
    }

    // Check if there are any validation errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    // Check for existing username, email, and phone
    try {
      const response = await fetch(API_ENDPOINTS.GET_ALL_MEMBERS);
      const data = await response.json();

      const members = data.members || [];

      const existingUsername = members.find(
        (member) =>
          member.username.toLowerCase() === formData.username.toLowerCase()
      );

      if (existingUsername) {
        setErrors({ ...newErrors, username: "Username already exists" });
        return false;
      }

      const existingEmail = members.find(
        (member) => member.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (existingEmail) {
        setErrors({ ...newErrors, email: "Email already exists" });
        return false;
      }

      const existingPhone = members.find(
        (member) => member.primary_phone === formData.primary_phone
      );

      if (existingPhone) {
        setErrors({
          ...newErrors,
          primary_phone: "Phone number already exists",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking existing data:", error);
      setErrorMessage("Error validating form data. Please try again.");
      return false;
    }
  };

  // Update the handleSubmit function to show API error messages
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const isValid = await validateForm();

    if (isValid) {
      try {
        // Add default password
        const submitData = {
          ...formData,
          password: "123456",
        };

        const response = await fetch(API_ENDPOINTS.CREATE_MEMBER, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });

        const responseData = await response.json();

        if (response.ok) {
          setSuccessMessage("Member created successfully!");
          // Reset form
          setFormData({
            first_name: "",
            username: "",
            email: "",
            primary_phone: "",
            permanent_address: "",
            is_active: false,
          });
          setPhoneNumber("");

          // Auto-hide success message after 10 seconds (increased from 6)
          setTimeout(() => {
            setSuccessMessage("");
          }, 10000);
        } else {
          // Show the specific error message from the API
          setErrorMessage(
            responseData.message ||
              responseData.error ||
              "Failed to create member. Please try again."
          );

          // Auto-hide error message after 8 seconds
          setTimeout(() => {
            setErrorMessage("");
          }, 8000);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setErrorMessage("An error occurred. Please try again.");

        // Auto-hide error message after 8 seconds
        setTimeout(() => {
          setErrorMessage("");
        }, 8000);
      }
    }

    setLoading(false);
  };

  // Add a function to reset the form
  const resetForm = () => {
    setFormData({
      first_name: "",
      username: "",
      email: "",
      primary_phone: "",
      permanent_address: "",
      is_active: false,
    });
    setPhoneNumber("");
    setErrors({});
  };

  const handleCloseNotification = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Update the return statement to include the "Add Another Agent" button
  // Replace the Button and notification section with this:
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="first_name"
          label="First Name"
          name="first_name"
          autoComplete="name"
          value={formData.first_name}
          onChange={handleChange}
          error={!!errors.first_name}
          helperText={errors.first_name}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Last Name"
          name="username"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
          error={!!errors.username}
          helperText={errors.username}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />

        <Box
          sx={{
            display: "flex",
            mt: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <FormControl
            sx={{
              width: { xs: "100%", sm: "40%" },
              mb: { xs: 2, sm: 0 },
              mr: { sm: 1 },
            }}
          >
            <InputLabel id="country-code-label">Country Code</InputLabel>
            <Select
              labelId="country-code-label"
              id="country-code"
              value={countryCode}
              label="Country Code"
              onChange={handleCountryCodeChange}
              renderValue={(value) => {
                const country = countryCodes.find(
                  (option) => option.value === value
                );
                return (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      loading="lazy"
                      width="20"
                      src={`https://flagcdn.com/w20/${country?.code?.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w40/${country?.code?.toLowerCase()}.png 2x`}
                      alt=""
                    />
                    <Typography sx={{ ml: 1 }}>{country?.value}</Typography>
                  </Box>
                );
              }}
            >
              {countryCodes.map((country) => (
                <MenuItem key={country.code} value={country.value}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      loading="lazy"
                      width="20"
                      src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png 2x`}
                      alt=""
                    />
                    <Typography sx={{ ml: 1 }}>
                      {country.label} ({country.value})
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            required
            fullWidth
            id="phone"
            label="Phone"
            name="phone"
            autoComplete="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            error={!!errors.primary_phone}
            helperText={errors.primary_phone}
          />
        </Box>

        <TextField
          margin="normal"
          fullWidth
          id="permanent_address"
          label="Permanent Address"
          name="permanent_address"
          multiline
          rows={2}
          value={formData.permanent_address}
          onChange={handleChange}
        />

        {/* Update the buttons section */}
        <Box sx={{ mt: 3, mb: 2 }}>
          {successMessage ? (
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={resetForm}
              sx={{
                mb: 2,
                py: 1.5,
                fontSize: "1rem",
                backgroundColor: "#e8f5e9",
                "&:hover": {
                  backgroundColor: "#c8e6c9",
                },
              }}
            >
              Add Another Agent
            </Button>
          ) : (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Register"}
            </Button>
          )}
        </Box>

        {/* Custom notifications */}
        {successMessage && (
          <Notification
            message={successMessage}
            severity="success"
            onClose={handleCloseNotification}
          />
        )}

        {errorMessage && (
          <Notification
            message={errorMessage}
            severity="error"
            onClose={handleCloseNotification}
          />
        )}
      </Box>
    </Paper>
  );
}
