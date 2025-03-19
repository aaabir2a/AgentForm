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
} from "@mui/material";

// Custom notification component that doesn't use Snackbar
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
        sx={{ width: "100%", boxShadow: "0 3px 10px rgba(0,0,0,0.2)" }}
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
  const [countryCode, setCountryCode] = useState("+880");
  const [phoneNumber, setPhoneNumber] = useState("");

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
      const response = await fetch(
        "http://192.168.68.129:8002/member/api/v1/member/all/"
      );
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

        const response = await fetch(
          "http://192.168.68.129:8002/member/api/v1/member/create/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(submitData),
          }
        );

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

          // Auto-hide success message after 6 seconds
          setTimeout(() => {
            setSuccessMessage("");
          }, 6000);
        } else {
          const errorData = await response.json();
          setErrorMessage(
            errorData.message || "Failed to create member. Please try again."
          );

          // Auto-hide error message after 6 seconds
          setTimeout(() => {
            setErrorMessage("");
          }, 6000);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setErrorMessage("An error occurred. Please try again.");

        // Auto-hide error message after 6 seconds
        setTimeout(() => {
          setErrorMessage("");
        }, 6000);
      }
    }

    setLoading(false);
  };

  const handleCloseNotification = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="first_name"
          label="Name"
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
          label="User Name"
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

        <Box sx={{ display: "flex", mt: 2 }}>
          <FormControl sx={{ width: "30%", mr: 1 }}>
            <InputLabel id="country-code-label">Country Code</InputLabel>
            <Select
              labelId="country-code-label"
              id="country-code"
              value={countryCode}
              label="Country Code"
              onChange={handleCountryCodeChange}
            >
              <MenuItem value="+880">+880 (Bangladesh)</MenuItem>
              <MenuItem value="+91">+91 (India)</MenuItem>
              <MenuItem value="+1">+1 (USA)</MenuItem>
              <MenuItem value="+44">+44 (UK)</MenuItem>
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

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.is_active}
              onChange={handleCheckboxChange}
              name="is_active"
            />
          }
          label="Is active"
          sx={{ mt: 1 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Register"}
        </Button>

        {/* Custom notifications instead of Snackbar */}
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
