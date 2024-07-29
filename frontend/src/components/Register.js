// messagingapp/frontend/src/components/Register.js

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const RegisterContainer = styled.div.attrs({
  className:
    "flex flex-col items-center justify-center min-h-screen bg-gray-100",
})``;

const RegisterForm = styled.form.attrs({
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
    "bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full",
})``;

const LoginLink = styled.p.attrs({
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

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/api/register", {
        username,
        email,
        password,
      });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error", error.response.data);
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
