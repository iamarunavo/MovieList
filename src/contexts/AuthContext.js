import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    auth,
    db 
} from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password) {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            // Create a user document in Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                email: result.user.email,
                favorites: []
            });
            return result;
        } catch (error) {
            throw error;
        }
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            // Check if user document exists, if not create one
            const userDoc = doc(db, 'users', result.user.uid);
            const docSnap = await getDoc(userDoc);
            
            if (!docSnap.exists()) {
                await setDoc(userDoc, {
                    email: result.user.email,
                    favorites: []
                });
            }
            
            return result;
        } catch (error) {
            throw error;
        }
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout,
        signInWithGoogle
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
} 