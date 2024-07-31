import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useChatContext } from "../contexts/ChatContext";
import axios from "axios";
import {
  LoginContainer,
  LoginForm,
  Title,
  Input,
  Button,
  RegisterLink,
  ErrorMessage,
} from "../styles/LoginStyles";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { dispatch } = useChatContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Login form submitted");

    try {
      console.log("Attempting to login with:", { email });

      const response = await axios.post(
        "http://localhost:5001/api/auth/login",
        {
          email,
          password,
        }
      );

      console.log("Login response:", response.data);

      const { token } = response.data;
      localStorage.setItem("token", token);
      dispatch({ type: "SET_TOKEN", payload: token });
      navigate("/chat");
    } catch (error) {
      console.log("An error occurred during login");
      console.error("Full error object:", error);
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      console.log("Login attempt completed");
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Title>Login</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
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
