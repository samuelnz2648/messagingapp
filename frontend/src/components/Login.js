// messagingapp/frontend/src/components/Login.js

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  LoginContainer,
  LoginForm,
  Title,
  Input,
  Button,
  RegisterLink,
} from "../styles/LoginStyles";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/api/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      navigate("/chat");
    } catch (error) {
      console.error("Login error", error.response.data);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Title>Login</Title>
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
        <Button type="submit">Login</Button>
      </LoginForm>
      <RegisterLink>
        Don't have an account? <Link to="/register">Register here</Link>
      </RegisterLink>
    </LoginContainer>
  );
}

export default Login;
