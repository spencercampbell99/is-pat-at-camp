// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { ref, set, get, query, orderByChild, equalTo, update, remove, startAt, endAt } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA5kxgmxtOurgANf6eUhDYqf9CcMgYF2ts",
    authDomain: "ispatatcamp.firebaseapp.com",
    projectId: "ispatatcamp",
    storageBucket: "ispatatcamp.appspot.com",
    messagingSenderId: "300669944973",
    appId: "1:300669944973:web:2d3ea47106914e9dcf8ec4",
    measurementId: "G-XGLYFG1X3R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

if (process.env.NEXT_PUBLIC_USE_EMULATOR !== 'false') {
    if (!process.env.NEXT_PUBLIC_EMULATOR_PORT_AUTH || !process.env.NEXT_PUBLIC_EMULATOR_PORT_DATABASE) {
        throw new Error('Please set NEXT_PUBLIC_EMULATOR_PORT_AUTH and NEXT_PUBLIC_EMULATOR_PORT_DATABASE in .env.local');
    }
    connectAuthEmulator(auth, `http://127.0.0.1:${process.env.NEXT_PUBLIC_EMULATOR_PORT_AUTH}`);
    connectDatabaseEmulator(db, '127.0.0.1', parseInt(process.env.NEXT_PUBLIC_EMULATOR_PORT_DATABASE));
}

/**
 * Register a new user with email and password
 * @param email - User's email
 * @param password - User's password
 * @returns A promise that resolves with the user credential
 */
const _registerWithEmailAndPassword = async (email: string, password: string): Promise<UserCredential> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        console.error("Error registering with email and password", error);
        throw error;
    }
};

/**
 * Sign in a user with email and password
 * @param email - User's email
 * @param password - User's password
 * @returns A promise that resolves with the user credential
 */
const _signInWithEmailAndPassword = async (email: string, password: string): Promise<UserCredential> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        console.error("Error signing in with email and password", error);
        throw error;
    }
};

/**
 * Insert data into Firebase Realtime Database
 * @param path - The path at which to write the data
 * @param data - The data to write to the database
 * @param genrateId - Whether to generate a random ID for the data
 * @returns A promise that resolves when the data is written
 */
const _insertData = async (path: string, data: any, genrateId: boolean = false): Promise<void> => {
    if (genrateId) {
        path = `${path}/${_generateId()}`;
    }

    const dbRef = ref(db, path);
    try {
      await set(dbRef, data);
      console.log("Data inserted successfully");
    } catch (error) {
      console.error("Error inserting data:", error);
      throw error;
    }
};

/**
 * Search data in Firebase Realtime Database by a specific key and value within a given path
 * @param path - The path to search within the database
 * @param key - The key to search by
 * @param value - The value to match
 * @param comparison - The comparison operator to use (defaulted to '==')
 * @returns A promise that resolves with the search results
 */
const _searchData = async (path: string, key: string, value: any, comparison: string = '=='): Promise<any> => {
    const dbRef = ref(db, path);
    let q;

    switch (comparison) {
        case '==':
            q = query(dbRef, orderByChild(key), equalTo(value));
            break;
        case '<':
            q = query(dbRef, orderByChild(key), endAt(value));
            break;
        case '<=':
            q = query(dbRef, orderByChild(key), endAt(value));
            break;
        case '>':
            q = query(dbRef, orderByChild(key), startAt(value + 1));
            break;
        case '>=':
            q = query(dbRef, orderByChild(key), startAt(value));
            break;
        default:
            throw new Error("Invalid comparison operator. Use '==', '<', '<=', '>', '>='.");
    }

    try {
        const snapshot = await get(q);
        if (snapshot.exists()) {
            const result: Record<string, any> = {};
            snapshot.forEach((childSnapshot) => {
                result[childSnapshot.key!] = childSnapshot.val();
            });
            return result;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error searching data:", error);
        throw error;
    }
};

/**
 * Update data in Firebase Realtime Database
 * @param path - The path to update within the database
 * @param data - The data to update at the specified path
 * @returns A promise that resolves when the data is updated
 */
const _updateData = async (path: string, data: any): Promise<void> => {
    const dbRef = ref(db, path);
    try {
      await update(dbRef, data);
      console.log("Data updated successfully");
    } catch (error) {
      console.error("Error updating data:", error);
      throw error;
    }
};

/**
 * Delete data in Firebase Realtime Database
 * @param path - The path to delete within the database
 * @returns A promise that resolves when the data is deleted
 */
const _deleteData = async (path: string): Promise<void> => {
    const dbRef = ref(db, path);
    try {
      await remove(dbRef);
      console.log("Data deleted successfully");
    } catch (error) {
      console.error("Error deleting data:", error);
      throw error;
    }
};

/**
 * Get data by ID from Firebase Realtime Database
 * @param path - The path to the node where the ID is located
 * @param id - The ID of the data to retrieve
 * @returns A promise that resolves with the retrieved data
 */
const _getDataById = async (path: string, id: string): Promise<any> => {
    const dbRef = ref(db, `${path}/${id}`);
    try {
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting data:", error);
      throw error;
    }
};

/**
 * Get all data at path
 * @param path - The path to the node where the data is located
 * @returns A promise that resolves with the retrieved data
 */
const _getAllData = async (path: string): Promise<any> => {
    const dbRef = ref(db, path);
    try {
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const result: Record<string, any> = {};
        snapshot.forEach((childSnapshot) => {
          result[childSnapshot.key!] = childSnapshot.val();
        });
        return result;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting data:", error);
      throw error;
    }
}

/**
 * Generate a random ID
 * @returns A random ID
 */
const _generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
}

export {
    app,
    _registerWithEmailAndPassword,
    _signInWithEmailAndPassword,
    _insertData,
    _searchData,
    _updateData,
    _deleteData,
    _getDataById,
    _getAllData,
    _generateId
}