// messagingapp/frontend/src/components/Login.js

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";

const LoginContainer = styled.div.attrs({
  className:
    "flex flex-col items-center justify-center min-h-screen bg-gray-100",
})``;

const LoginForm = styled.form.attrs({
  className: "bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md",
})``;

const Title = styled.h2.attrs({
  className: "text-2xl font-bold mb-6 text-center text-gray-800",
})``;

const Input = styled.input.attrs({
  className:
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4",
})``;

const Button = styled.button.attrs({
  className:
    "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full",
})``;

const RegisterLink = styled.p.attrs({
  className: "text-center mt-4 text-gray-600",
})`
  a {
    color: #3182ce;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

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
