import firebase from "firebase/app";
import "firebase/firebase-firestore";
import "firebase/auth";
import "firebase/storage";

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
export const auth = firebase.auth()
export const storage = firebase.storage()

export const provider = new firebase.auth.GoogleAuthProvider()
export const signInWithGoogle = async () => {
  try {
    const credentials = await auth.signInWithPopup(provider)
    return credentials;
  } catch (error) {
    console.log(error)
    // throw new Error(error.message)
  }
}

export const createUserProfileDoc = async (user, data) => {
  //Chequear si el usuario existe, si no existe, retornar
  if(!user) {
    return null
  }

  //Referencia al documento del usuario
  const userRef = firestore.collection("users").doc(user.uid)

  //Si el documento no existe, crearlo
  const userSnapshot = await userRef.get()
  if(!userSnapshot.exists) {
    const createdAt = Date.now()
    try {
      await userRef.set({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL,
        posts: [],
        securityPassword: "",
        createdAt,
        ...data
      })
    } catch (error) {
      console.log(`Error creating user profile: ${error}`)
    }
  }

  return getUserDoc(user.uid)
}

export const getUserDoc = async (uid) => {
  if(!uid) {
    return null
  }

  try {
    const userDoc = await firestore.collection("users").doc(uid).get()
    const userData = userDoc.data()

    return {
      uid,
      ...userData
    }

  } catch (error) {
    console.log(`Error fetching user data: ${error}`)
  }
}

export default firebase