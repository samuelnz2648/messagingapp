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
} from "../styles/RegisterStyles";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/api/auth/register", {
        username,
        email,
        password,
      });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error", error.response?.data);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <RegisterContainer>
      <RegisterForm onSubmit={handleSubmit}>
        <Title>Register</Title>
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
        <Button type="submit">Register</Button>
      </RegisterForm>
      <LoginLink>
        Already have an account? <Link to="/login">Login here</Link>
      </LoginLink>
    </RegisterContainer>
  );
}

export default Register;
