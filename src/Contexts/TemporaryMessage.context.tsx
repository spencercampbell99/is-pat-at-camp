'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TemporaryMessage {
  message: string;
  type: "success" | "failure";
}

interface TemporaryMessageContextProps {
  showMessage: (message: string, type: "success" | "failure", timeout?: number) => void;
}

const TemporaryMessageContext = createContext<TemporaryMessageContextProps | undefined>(undefined);

export const useTemporaryMessage = (): TemporaryMessageContextProps => {
  const context = useContext(TemporaryMessageContext);
  if (context === undefined) {
    throw new Error("useTemporaryMessage must be used within a TemporaryMessageProvider");
  }
  return context;
};

export const TemporaryMessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<TemporaryMessage | null>(null);
  const [visible, setVisible] = useState(false);

  const showMessage = (message: string, type: "success" | "failure", timeout = 3) => {
    setMessage({ message, type });
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
      setMessage(null);
    }, timeout * 1000);
  };

  const handleClose = () => {
    setVisible(false);
    setMessage(null);
  };

  return (
    <TemporaryMessageContext.Provider value={{ showMessage }}>
      {children}
      {visible && message && (
        <div
          onClick={handleClose}
          className={`fixed top-0 left-0 right-0 p-4 text-center cursor-pointer ${
            message.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {message.message}
        </div>
      )}
    </TemporaryMessageContext.Provider>
  );
};
