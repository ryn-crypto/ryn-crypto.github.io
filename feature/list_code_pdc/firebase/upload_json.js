// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  // Your Firebase credentials here
  apiKey: "AIzaSyC7RgiZIIugvmMAyF8TwjUP1-1LKSDDwb4",
  authDomain: "code-list-pdc.firebaseapp.com",
  projectId: "code-list-pdc",
  storageBucket: "code-list-pdc.firebasestorage.app",
  messagingSenderId: "313665311782",
  appId: "1:313665311782:web:c2d4786ff01f3707be82e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load JSON data from the global variable or use fetch to load it
// We'll assume the JSON data is available
const jsonData = window.jsonData || {};

// Function to fetch and parse JSON file
async function loadJsonData() {
  try {
    const response = await fetch('./list_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading JSON data:', error);
    return {};
  }
}

// Function to upload JSON data to Firestore
async function uploadJsonToFirestore(data) {
  try {
    // Create a top-level collection called "Job Costing 2"
    const jobCostingCollectionRef = collection(db, "Job Costing 2");

    // Loop through each location (TOYOTA SUNTER, LEXUS, etc.)
    for (const location in data) {
      const locationData = data[location];

      // Create a document for this location
      const locationDocRef = doc(jobCostingCollectionRef, location);

      // Create a batch number field and a vehicles subcollection
      await setDoc(locationDocRef, {
        batchNumber: locationData.batchNumber || ""
      });

      // Create a subcollection for vehicles at this location
      const vehiclesCollectionRef = collection(locationDocRef, "vehicles");

      // Add each vehicle model as a document in the subcollection
      for (const vehicleModel in locationData) {
        // Skip the batchNumber field as it's not a vehicle
        if (vehicleModel === "batchNumber") continue;

        const vehicleData = locationData[vehicleModel];

        // Add the vehicle document to the vehicles subcollection
        await setDoc(doc(vehiclesCollectionRef, vehicleModel), {
          describe: vehicleData.describe || "",
          code: vehicleData.code || []
        });
      }

      console.log(`Added location: ${location} with its vehicle models`);
    }

    console.log("JSON data successfully uploaded to Firestore!");
  } catch (error) {
    console.error("Error uploading JSON data to Firestore:", error);
  }
}

// Alternative approach: Upload each location as a separate document in one collection
async function uploadAsDocuments(data) {
  try {
    // Create references to our collections
    const jobCostingRef = collection(db, "Job Costing 2");

    // Upload each location as a document
    for (const location in data) {
      const locationData = data[location];

      // Create a document with the location name
      await setDoc(doc(jobCostingRef, location), {
        batchNumber: locationData.batchNumber,
        vehicles: Object.entries(locationData)
          .filter(([key]) => key !== "batchNumber")
          .reduce((acc, [model, data]) => {
            acc[model] = data;
            return acc;
          }, {})
      });

      console.log(`Added document for location: ${location}`);
    }

    console.log("All data uploaded successfully!");
  } catch (error) {
    console.error("Error uploading data:", error);
  }
}

// Example function to retrieve the data back
async function retrieveData() {
  try {
    const querySnapshot = await getDocs(collection(db, "Job Costing 2"));
    querySnapshot.forEach((doc) => {
      console.log(`Location: ${doc.id}`);
      console.log("Data:", doc.data());
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
  }
}

// Initialize the app
async function init() {
  try {
    console.log("Firebase initialized successfully");

    // Check if we have a button in the DOM
    const uploadButton = document.getElementById("uploadButton");
    if (uploadButton) {
      uploadButton.addEventListener("click", async () => {
        console.log("Upload button clicked");

        // Load JSON data from file
        const data = await loadJsonData();

        // Choose which upload method to use
        await uploadJsonToFirestore(data);
        // Or use the alternative method
        // await uploadAsDocuments(data);
      });
    } else {
      console.log("Upload button not found in DOM");
    }
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

// Call the init function when the document is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}