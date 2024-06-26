// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
const analytics = getAnalytics(app);