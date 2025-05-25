// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  getDoc,
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

async function getAllJobCostingData(collectionName) {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    const allData = [];

    for (const docSnap of snapshot.docs) {
      const docData = docSnap.data();
      const docId = docSnap.id;

      // Ambil subcollection 'vehicles' jika ada
      const vehiclesRef = collection(db, collectionName, docId, "vehicles");
      const vehiclesSnap = await getDocs(vehiclesRef);
      const vehicles = vehiclesSnap.docs.map((v) => ({
        id: v.id,
        ...v.data(),
      }));

      // Ambil subcollection 'detail_list' jika ada
      const detailListRef = collection(db, collectionName, docId, "detail_list");
      const detailSnap = await getDocs(detailListRef);
      const detailList = detailSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Gabungkan semua data ke dalam objek
      allData.push({
        id: docId,
        ...docData,
        vehicles,
        detail_list: detailList,
      });
    }

    return allData;
  } catch (error) {
    console.error("Error getting Job Costing data:", error);
    throw error;
  }
}

async function addNewPDC(pdcName, batchNumber, vehicles = [], rootCollection, kodeGudang = "") {
  try {
    // Validasi parameter
    if (!pdcName || typeof pdcName !== 'string') {
      throw new Error(`Nama PDC tidak valid: ${pdcName}`);
    }

    // PERBAIKAN: Validasi rootCollection
    if (!rootCollection) {
      throw new Error('Root collection tidak boleh kosong');
    }

    // Sanitasi PDC name - hapus karakter ilegal dalam path Firestore
    const sanitizedPdcName = pdcName.replace(/[\/\.#$\[\]]/g, "_");

    console.log(`Creating PDC: ${sanitizedPdcName} in ${rootCollection} with batch ${batchNumber}, kodeGudang: ${kodeGudang}`);
    console.log('Vehicles data received:', vehicles);

    // Buat dokumen PDC dengan batchNumber dan kodeGudang
    const pdcRef = doc(db, rootCollection, sanitizedPdcName);
    await setDoc(pdcRef, {
      batchNumber,
      kodeGudang: kodeGudang || "", // Pastikan kodeGudang disimpan
      createdAt: new Date()
    });

    // PERBAIKAN: Proses setiap kendaraan dengan validasi yang lebih baik
    for (const vehicle of vehicles) {
      console.log('Processing vehicle:', vehicle);

      if (!vehicle.name) {
        console.warn('Skipping vehicle without name:', vehicle);
        continue;
      }

      // Sanitasi vehicle name - pastikan sebagai string
      const sanitizedVehicleName = String(vehicle.name).replace(/[\/\.#$\[\]]/g, "_");
      console.log(`Adding vehicle: ${sanitizedVehicleName} to PDC: ${sanitizedPdcName} in collection: ${rootCollection}`);

      const vehicleRef = doc(collection(db, rootCollection, sanitizedPdcName, "vehicles"), sanitizedVehicleName);

      // PERBAIKAN: Struktur data berbeda berdasarkan tipe Job Costing dengan validasi lebih ketat
      if (rootCollection === 'Job Costing 1') {
        // Job Costing 1: menggunakan productData (object dengan key-value pairs)
        const vehicleData = {
          productData: vehicle.productData || {}, // Struktur { key: value }
          describe: vehicle.describe || ""
        };
        console.log(`Job Costing 1 - Vehicle data for ${sanitizedVehicleName}:`, vehicleData);
        await setDoc(vehicleRef, vehicleData);
      } else if (rootCollection === 'Job Costing 2') {
        // PERBAIKAN: Job Costing 2: menggunakan code array dengan validasi yang lebih baik
        const vehicleData = {
          code: Array.isArray(vehicle.code) ? vehicle.code : [],
          describe: vehicle.describe || ""
        };
        console.log(`Job Costing 2 - Vehicle data for ${sanitizedVehicleName}:`, vehicleData);
        console.log('Original vehicle.code:', vehicle.code);
        console.log('Original vehicle.describe:', vehicle.describe);
        await setDoc(vehicleRef, vehicleData);
      } else {
        throw new Error(`Root collection tidak dikenali: ${rootCollection}`);
      }
    }

    console.log(`PDC ${sanitizedPdcName} berhasil ditambahkan ke koleksi ${rootCollection}.`);
    return true;
  } catch (error) {
    console.error(`Error saat menambahkan PDC ${pdcName}:`, error);
    throw error;
  }
}

// PERBAIKAN: Fungsi update dengan parameter validation yang lebih baik
async function updatePDC(pdcName, batchNumber, vehicles = [], rootCollection, kodeGudang = "") {
  try {
    // Validasi parameter
    if (!pdcName || typeof pdcName !== 'string') {
      throw new Error(`Nama PDC tidak valid: ${pdcName}`);
    }

    // PERBAIKAN: Validasi rootCollection
    if (!rootCollection) {
      throw new Error('Root collection tidak boleh kosong');
    }

    // Sanitasi PDC name
    const sanitizedPdcName = pdcName.replace(/[\/\.#$\[\]]/g, "_");

    console.log(`Updating PDC: ${sanitizedPdcName} in ${rootCollection} with batch ${batchNumber}, kodeGudang: ${kodeGudang}`);

    // Reference ke dokumen PDC
    const pdcRef = doc(db, rootCollection, sanitizedPdcName);

    // Periksa apakah dokumen PDC ada
    const docSnap = await getDoc(pdcRef);

    if (!docSnap.exists()) {
      console.log(`PDC ${sanitizedPdcName} tidak ditemukan di ${rootCollection}, membuat dokumen baru`);
      // Dokumen tidak ada, buat baru
      await setDoc(pdcRef, {
        batchNumber,
        kodeGudang: kodeGudang || "",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Update dokumen yang ada
      console.log(`Updating existing PDC ${sanitizedPdcName} di ${rootCollection}`);
      await updateDoc(pdcRef, {
        batchNumber,
        kodeGudang: kodeGudang || "",
        updatedAt: new Date()
      });
    }

    for (const vehicle of vehicles) {
      if (!vehicle.name) {
        console.warn('Skipping vehicle without name:', vehicle);
        continue;
      }

      // Sanitasi vehicle name
      const sanitizedVehicleName = String(vehicle.name).replace(/[\/\.#$\[\]]/g, "_");
      console.log(`Updating vehicle: ${sanitizedVehicleName} in PDC: ${sanitizedPdcName} in collection: ${rootCollection}`);

      const vehicleRef = doc(collection(db, rootCollection, sanitizedPdcName, "vehicles"), sanitizedVehicleName);

      // Cek apakah dokumen kendaraan sudah ada
      const vehicleDoc = await getDoc(vehicleRef);

      if (rootCollection === 'Job Costing 1') {
        // Job Costing 1 format
        const vehicleData = {
          productData: vehicle.productData || {},
          describe: vehicle.describe || ""
        };
        console.log(`Job Costing 1 Update - Vehicle data for ${sanitizedVehicleName}:`, vehicleData);

        if (vehicleDoc.exists()) {
          // Update existing document
          await updateDoc(vehicleRef, vehicleData);
        } else {
          // Create new document
          await setDoc(vehicleRef, vehicleData);
        }
      } else if (rootCollection === 'Job Costing 2') {
        // PERBAIKAN: Job Costing 2 format dengan validasi yang lebih baik
        const vehicleData = {
          code: Array.isArray(vehicle.code) ? vehicle.code : [],
          describe: vehicle.describe || ""
        };
        console.log(`Job Costing 2 Update - Vehicle data for ${sanitizedVehicleName}:`, vehicleData);

        if (vehicleDoc.exists()) {
          // Update existing document
          await updateDoc(vehicleRef, vehicleData);
        } else {
          // Create new document
          await setDoc(vehicleRef, vehicleData);
        }
      } else {
        throw new Error(`Root collection tidak dikenali: ${rootCollection}`);
      }
    }

    console.log(`PDC ${sanitizedPdcName} berhasil diupdate di koleksi ${rootCollection}.`);
    return true;
  } catch (error) {
    console.error(`Error saat mengupdate PDC ${pdcName}:`, error);
    throw error;
  }
}

export { getAllJobCostingData, addNewPDC, updatePDC };