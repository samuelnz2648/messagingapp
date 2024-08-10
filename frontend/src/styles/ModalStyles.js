// messagingapp/frontend/src/styles/ModalStyles.js

import styled from "styled-components";

export const Modal = styled.div.attrs({
  className: "fixed inset-0 z-50 flex items-center justify-center",
})``;

export const ModalOverlay = styled.div.attrs({
  className: "absolute inset-0 bg-black opacity-50",
})``;

export const ModalContent = styled.div.attrs({
  className:
    "bg-white rounded-lg shadow-xl z-50 overflow-y-auto max-w-md w-full mx-4",
})``;

export const ModalHeader = styled.div.attrs({
  className: "bg-blue-600 text-white px-4 py-3 text-lg font-semibold",
})``;

export const ModalBody = styled.div.attrs({
  className: "p-4",
})``;

export const ModalFooter = styled.div.attrs({
  className: "bg-gray-100 px-4 py-3 flex justify-end space-x-2",
})``;

export const Input = styled.input.attrs({
  className:
    "w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
})``;

export const Button = styled.button.attrs((props) => ({
  className: `px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    props.$primary
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "bg-gray-300 text-gray-800 hover:bg-gray-400"
  }`,
}))``;

export const Label = styled.label.attrs({
  className: "block text-sm font-medium text-gray-700 mb-1",
})``;

export const FormField = styled.div.attrs({
  className: "mb-4",
})``;

export const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-right: 10px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #2196f3;
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }
`;

export const Select = styled.div`
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;

  input {
    margin-right: 8px;
  }
`;
