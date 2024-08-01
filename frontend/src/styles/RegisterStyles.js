// messagingapp/frontend/src/styles/RegisterStyles.js

import styled from "styled-components";

export const RegisterContainer = styled.div.attrs({
  className:
    "flex flex-col items-center justify-center min-h-screen bg-gray-100",
})``;

export const RegisterForm = styled.form.attrs({
  className: "bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md",
})``;

export const Title = styled.h2.attrs({
  className: "text-2xl font-bold mb-6 text-center text-gray-800",
})``;

export const Input = styled.input.attrs({
  className:
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4",
})``;

export const Button = styled.button.attrs({
  className:
    "bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full",
})``;

export const LoginLink = styled.p.attrs({
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

export const ErrorMessage = styled.div.attrs({
  className: "text-red-500 text-sm mb-4",
})``;

export const PasswordRequirements = styled.div.attrs({
  className: "text-sm text-gray-600 mb-4",
})`
  ul {
    list-style-type: disc;
    padding-left: 1.5em;
    margin-top: 0.5em;
  }

  li {
    margin-bottom: 0.25em;
  }
`;
