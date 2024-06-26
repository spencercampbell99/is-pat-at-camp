'use client'

import React, { useState } from "react";

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (arrivalDate: string, daysAtCamp: number) => void;
}

const EnterNewArrivalModal: React.FC<EntryModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [arrivalDate, setArrivalDate] = useState<string>("");
    const [daysAtCamp, setDaysAtCamp] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            setArrivalDate("");
            setDaysAtCamp(0);
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!arrivalDate || daysAtCamp <= 0) {
            setError("Please enter a valid date and a positive number of days.");
            return;
        }
        setError(null);
        onSubmit(arrivalDate, daysAtCamp);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4">Enter Camp Details</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="mb-4 text-black">
                    <label className="block text-black">Arrival Date</label>
                    <input
                        type="date"
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div className="mb-4 text-black">
                    <label className="block text-black">Days at Camp</label>
                    <input
                        type="number"
                        value={daysAtCamp}
                        onChange={(e) => setDaysAtCamp(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                        min="1"
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                    Submit
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

export default EnterNewArrivalModal;