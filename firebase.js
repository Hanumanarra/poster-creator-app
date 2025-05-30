// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//import { getFirestore } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
/*const firebaseConfig = {
  apiKey: "AIzaSyAZFd1L2fwp5seZaytfNTYOszhFJ-Bg3H8",
  authDomain: "tenzies-aa196.firebaseapp.com",
  projectId: "tenzies-aa196",
  storageBucket: "tenzies-aa196.firebasestorage.app",
  messagingSenderId: "167090307831",
  appId: "1:167090307831:web:1b8c7042712e19af4409f2",
  measurementId: "G-RE0XZB8BNM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // or getDatabase(app)

export { db };*/

// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
//import { getFirestore,serverTimestamp } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
/*const firebaseConfig = {
  apiKey: "AIzaSyCSG9vc8xztm-BM1MTD9U_4cVkXaYVurQU",
  authDomain: "poster-demo-d2d6b.firebaseapp.com",
  projectId: "poster-demo-d2d6b",
  storageBucket: "poster-demo-d2d6b.firebasestorage.app",
  messagingSenderId: "573044919613",
  appId: "1:573044919613:web:9438c3b89a1a4b02720954",
  measurementId: "G-5V02SQCCNV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db= getFirestore(app);
const timestamp=serverTimestamp();

export{db,timestamp}
*/
import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage";
import{getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8p7wI6cxWi9DmhevXlBzwloNVozJ9tA8",
  authDomain: "sharpsell-demo.firebaseapp.com",
  projectId: "sharpsell-demo",
  storageBucket: "sharpsell-demo.firebasestorage.app",
  messagingSenderId: "1056535284431",
  appId: "1:1056535284431:web:541e38889f464d442885ba"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage=getStorage(app);
const db=getFirestore(app);

export{storage,db};
