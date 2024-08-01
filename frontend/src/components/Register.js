// messagingapp/frontend/src/components/Register.js

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  RegisterContainer,
  RegisterForm,
  Title,
  Input,
  Button,
  LoginLink,
  ErrorMessage,
  PasswordRequirements,
} from "../styles/RegisterStyles";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Registration form submitted");

    try {
      console.log("Attempting to register with:", { username, email });

      const response = await axios.post(
        "http://localhost:5001/api/auth/register",
        {
          username,
          email,
          password,
        }
      );

      console.log("Registration response:", response.data);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.log("An error occurred during registration");
      console.error("Full error object:", error);
      setError(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      console.log("Registration attempt completed");
    }
  };

  return (
    <RegisterContainer>
      <RegisterForm onSubmit={handleSubmit}>
        <Title>Register</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordRequirements>
          Password must:
          <ul>
            <li>Be at least 8 characters long</li>
            <li>Contain at least one uppercase letter</li>
            <li>Contain at least one lowercase letter</li>
            <li>Contain at least one number</li>
            <li>Contain at least one symbol ($@#&!)</li>
          </ul>
        </PasswordRequirements>
        <Button type="submit">Register</Button>
      </RegisterForm>
      <LoginLink>
        Already have an account? <Link to="/login">Login here</Link>
      </LoginLink>
    </RegisterContainer>
  );
}

export default Register;