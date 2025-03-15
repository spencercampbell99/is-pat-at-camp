'use client'

import React, { useState } from "react";
import LoginModal from "@/Components/Auth/LoginModal";
import RegisterModal from "@/Components/Auth/RegisterModal";
import { useAuth } from "@/hooks/useAuth";
import { useTemporaryMessage } from "@/Contexts/TemporaryMessage.context";
import { _getAllData, _insertData } from '@/lib/firebase/firebase';
import moment from "moment";
import EnterNewArrivalModal from "@/Components/Modals/EnterNewArrivalModal";

const BasicButton: React.FC<{ onClick: any, children: any, className?: string }> = ({ onClick, children, className="" }) => (
  <button
    onClick={onClick}
    className={"bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 " + className}
  >
    {children}
  </button>
);

interface Trip {
    arrival: string;
    days_at_camp: number;
}

export default function Home() {
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [isEnterNewArrivalModalOpen, setEnterNewArrivalModalOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const { showMessage } = useTemporaryMessage();
    const [data, setData] = React.useState<any[]>([]);
    const [isSomeoneAtCamp, setIsSomeoneAtCamp] = React.useState(false);
    const [daysRemaining, setDaysRemaining] = React.useState<number>(0);
    const [isAdmin, setIsAdmin] = React.useState(false);

    React.useEffect(() => {
        if (!currentUser) return;
        const fetchData = async () => {
            let res = await _getAllData('trips');
            let now = parseInt(moment().format('YYYYMMDD'));
            let filteredRes = Object.values(res).filter((trip: any) => trip.arrival > now - 30);
            setData(filteredRes);
            console.log(filteredRes);
        }
        fetchData();

        if (currentUser) {
            checkIsAdmin();
        }
    }, []);

    React.useEffect(() => {
        // loop through data, each item has "days_at_camp" and "arrival", if arrival is within "days_at_camp" of now, then set isSomeoneAtCamp to true
        if (data.length) {
            const now = moment();
            for (let i = 0; i < data.length; i++) {
                const trip = data[i];
                const arrival = moment(trip.arrival, 'YYYYMMDD');
                const daysAtCamp = trip.days_at_camp;
                if (now.isBefore(arrival.add(daysAtCamp, 'days'))) {
                    setIsSomeoneAtCamp(true);
                    setDaysRemaining(arrival.diff(now, 'days'));
                    break;
                }
            }
        }
    }, [data]);

    React.useEffect(() => {
        if (isAdmin) {
            showMessage("You are an admin", "success", 5);
        }
    }, [isAdmin]);

    React.useEffect(() => {
        checkIsAdmin();
    }, [currentUser]);

    const checkIsAdmin = () => {
        if (currentUser) {
            if (currentUser.uid === 'FbmRegQtzpTrkyofB8pUHpAWb5d2') {
                setIsAdmin(true);
            }
        }
    }

    const handleNewArrivalEntered = async (arrival: string, days_at_camp: number) => {
        try {
            // remove slashes from arrival
            arrival = arrival.replace(/\//g, '');
            arrival = arrival.replace(/-/g, '');

            // cast both as numbers
            days_at_camp = Number(days_at_camp);
            let _arrival = parseInt(arrival);

            let res = await _insertData('trips', { arrival: _arrival, days_at_camp }, true );
            console.log(res);
            setData([...data, { arrival, days_at_camp }]);
        } catch (error: any) {
            console.error(error);
            showMessage("Couldn't enter new arrival. Sorry.", "failure", 5);
        }
        setEnterNewArrivalModalOpen(false);
    }

    return (
        <>
        {currentUser ? 
            <div>
                <div className="position-absolute top-0 left-0 right-0 p-4 text-center cursor-pointer bg-slate-300 text-white">
                    <div className="text-white text-2xl p-4">Welcome, {currentUser.email}</div>
                    <BasicButton onClick={logout}>Logout</BasicButton>
                </div>
                <div className="bg-slate-500 min-h-screen flex items-center justify-center flex-col">
                    {isSomeoneAtCamp ? 
                        <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Pat is at camp!</h2>
                        </div>
                    : <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Pat is not at camp</h2>
                        </div>
                    }
                    {isAdmin ?
                        <>
                            <BasicButton onClick={() => setEnterNewArrivalModalOpen(true)} className="mt-2">Enter New Arrival</BasicButton>
                            <EnterNewArrivalModal isOpen={isEnterNewArrivalModalOpen} onClose={() => setEnterNewArrivalModalOpen(false)} onSubmit={handleNewArrivalEntered} />
                        </>
                    : null}
                </div>
            </div>
        : <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <BasicButton onClick={() => setLoginModalOpen(true)}>Login</BasicButton>
                <BasicButton onClick={() => setRegisterModalOpen(true)}>Register</BasicButton>
                <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
                <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} />
            </div>
        }
        </>
    );
}
