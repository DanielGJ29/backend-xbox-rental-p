// Import the functions you need from the SDKs you need

const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChWtjEt5kOVxVvfa9jJM-r43UnOrQtQoM",
  authDomain: "xbox-rental.firebaseapp.com",
  projectId: "xbox-rental",
  storageBucket: "xbox-rental.appspot.com",
  messagingSenderId: "1057333915352",
  appId: "1:1057333915352:web:18c547bebf07d8952831ad",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

module.exports = { storage };
