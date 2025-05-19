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

async function getAllJobCostingData() {
  const jobCostingRef = collection(db, "Job Costing 2");
  const jobCostingSnapshot = await getDocs(jobCostingRef);
  const jobCostingData = [];

  for (const docSnap of jobCostingSnapshot.docs) {
    const pdcData = docSnap.data();
    const pdcName = docSnap.id;

    const vehiclesRef = collection(db, "Job Costing 2", pdcName, "vehicles");
    const vehiclesSnap = await getDocs(vehiclesRef);
    const vehicles = vehiclesSnap.docs.map(vehicleDoc => ({
      id: vehicleDoc.id,
      ...vehicleDoc.data()
    }));

    jobCostingData.push({
      pdcName,
      batchNumber: pdcData.batchNumber || null,
      vehicles
    });
  }
  return jobCostingData;
}

async function addNewPDC(pdcName, batchNumber, vehicles = [], rootCollection) {
  const pdcRef = doc(db, rootCollection, pdcName);

  await setDoc(pdcRef, {
    batchNumber
  });

  for (const vehicle of vehicles) {
    const vehicleRef = doc(collection(db, rootCollection, pdcName, "vehicles"), vehicle.name);
    await setDoc(vehicleRef, {
      code: vehicle.code || [],
      describe: vehicle.describe || ""
    });
  }

  console.log(`PDC ${pdcName} ditambahkan ke koleksi ${rootCollection}.`);
}

async function updatePDCData(pdcName, newBatchNumber, oldVehicleName, newVehicleName, newCode) {
  const pdcRef = doc(db, "Job Costing 2", pdcName);

  // Update batchNumber
  if (newBatchNumber !== undefined) {
    await setDoc(pdcRef, { batchNumber: newBatchNumber }, { merge: true });
  }

  const vehicleRef = doc(collection(db, "Job Costing 2", pdcName, "vehicles"), oldVehicleName);

  // Jika nama kendaraan berubah
  if (oldVehicleName !== newVehicleName) {
    const newVehicleRef = doc(collection(db, "Job Costing 2", pdcName, "vehicles"), newVehicleName);

    // Ambil data lama dan hapus dokumen lama
    const oldVehicleSnap = await getDocs(vehicleRef);
    await setDoc(newVehicleRef, { code: newCode });
    await vehicleRef.delete();
  } else {
    // Jika hanya kode yang berubah
    await setDoc(vehicleRef, { code: newCode }, { merge: true });
  }

  console.log(`PDC ${pdcName} updated.`);
}

// setelah semua fungsi dideklarasikan
export { getAllJobCostingData, addNewPDC, updatePDCData };


// const uploadButton = document.getElementById("uploadButton");
// if (uploadButton) {
//   uploadButton.addEventListener("click", async () => {
//     const data = getAllJobCostingData();
//     console.log("Data retrieved:", data);
//   });
// }
