'use client'

import React, { useContext, useEffect, useState, createContext } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  UserCredential,
  User
} from 'firebase/auth';
import { app, _insertData, _searchData, _getDataById, _deleteData } from '@/lib/firebase/firebase';

const auth = getAuth(app);

interface AuthContextProps {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        let res = signInWithEmailAndPassword(auth, email, password);

        let allowed = res.then(async (userCredential) => {
            // if user is not whitelisted, log them out
            let data = await _getDataById('users', userCredential.user.uid);
            if (data && !data.whitelisted) {
                await signOut(auth);
                return false;
            }

            return true;
        });

        return allowed;
    };

    const signup = async (email: string, password: string) => {
        let res = await createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
            return userCredential;
        });

        _insertData(`users/${res.user.uid}`, {
            email: res.user.email,
            whitelisted: false
        });

        // logout the user
        signOut(auth);

        return res;
    };

    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
    };

    export const useAuth = (): AuthContextProps => {
        const context = useContext(AuthContext);
        if (context === undefined) {
            throw new Error('useAuth must be used within an AuthProvider');
        }
    return context;
};
