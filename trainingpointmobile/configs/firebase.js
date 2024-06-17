import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGIHD-_vTT_S2d3_N13EPkcjJ-9Urt7Z4",
  authDomain: "qldrl-77e59.firebaseapp.com",
  projectId: "qldrl-77e59",
  storageBucket: "qldrl-77e59.appspot.com",
  messagingSenderId: "694590271865",
  appId: "1:694590271865:web:e9186657367b4b1e6b3fa8"
};



// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


export { db, auth, app };
