'use client'


import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTemporaryMessage } from "@/Contexts/TemporaryMessage.context";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const { signup } = useAuth();
    const { showMessage } = useTemporaryMessage();

    const handleSignup = async () => {
        try {
            await signup(email, password);
            showMessage("Account created successfully, but you'll need to wait for admin approval", "success", 10);
            onClose();
        } catch (error: any) {
            setError(error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4 text-gray-700">
                <label className="block text-gray-700">Email</label>
                <input
                    type="email"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="mb-4 text-gray-700">
                <label className="block text-gray-700">Password</label>
                <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button
                onClick={handleSignup}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
                Register
            </button>
            <button
                onClick={onClose}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 mt-2"
            >
                Cancel
            </button>
        </div>
        </div>
    );
};

export default RegisterModal;