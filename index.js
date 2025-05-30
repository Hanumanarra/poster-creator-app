// This is a simplified example.
// You'd need proper setup, imports, and error handling.
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(); // Initializes the Admin SDK

exports.createPosterCallable = functions.https.onCall(async (data, context) => {
  // Optional: Check authentication if needed in the function
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');
  // }

  const posterData = data; // The data sent from the client

  try {
    // Write to Firestore using the Admin SDK - this bypasses client rules!
    const docRef = await admin.firestore().collection('posters').add({
      ...posterData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log("Poster saved with ID: ", docRef.id);
    return { id: docRef.id, message: "Poster created successfully!" };

  } catch (error) {
    console.error("Error creating poster in function: ", error);
    // Re-throw as an HttpsError to send a structured error back to the client
    throw new functions.https.HttpsError('internal', 'Failed to create poster', error.message);
  }
});
