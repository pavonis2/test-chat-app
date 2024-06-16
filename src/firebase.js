import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import {getStorage} from "firebase/storage"
import firebaseCredentials from "./firebasecredentials";


const firebaseConfig = {
  apiKey: firebaseCredentials.api_Key,
  authDomain: firebaseCredentials.auth_Domain,
  projectId: firebaseCredentials.project_Id,
  storageBucket: firebaseCredentials.storage_Bucket,
  messagingSenderId: firebaseCredentials.messaging_SenderId,
  appId: firebaseCredentials.app_Id
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore(app);