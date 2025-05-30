import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from './firebase'; // Your Firebase config file

export const createPoster = async (posterData) => {
  try {
    // Add the new poster to the "posters" collection
    const docRef = await addDoc(collection(db, "posters"), {
      ...posterData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id; // Return the new poster ID
  } catch (error) {
    console.error("Error creating poster:", error);
    throw error;
  }
};