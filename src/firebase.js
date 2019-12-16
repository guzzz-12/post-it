import firebase from "firebase/app";
import "firebase/firebase-firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3ZNeEj8I0SnC7CfkkeHSlcero4MAA7pQ",
  authDomain: "think-piece-ad813.firebaseapp.com",
  databaseURL: "https://think-piece-ad813.firebaseio.com",
  projectId: "think-piece-ad813",
  storageBucket: "think-piece-ad813.appspot.com",
  messagingSenderId: "741708670112",
  appId: "1:741708670112:web:f4996083de9b0153a395c5"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

export const firestore = firebase.firestore()

export default firebase