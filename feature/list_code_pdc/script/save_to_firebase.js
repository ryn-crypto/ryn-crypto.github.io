import { addNewPDC, updatePDC } from '../firebase/firebase_setup.js';

// Ambil parameter dari URL
const urlParams = new URLSearchParams(window.location.search);
const pdcName = urlParams.get('pdcName');
const batch = urlParams.get('batch');
const vehicles = urlParams.get('vehicles');
const rootCollection = urlParams.get('root');
const kodeGudang = urlParams.get('gudangCode');
const keterangan = urlParams.get('describe');
const mode = urlParams.get('mode');
const encodedData = urlParams.get('data');

// Element untuk indikator loading
const loadingIndicator = document.getElementById('loadingIndicator');
const loadingText = document.getElementById('loadingText');

// Validasi parameter yang diperlukan
if (!pdcName || !batch || !vehicles || !rootCollection) {
  console.error('Parameter tidak lengkap:', { pdcName, batch, vehicles, rootCollection });
  redirectWithError('Parameter tidak lengkap. Silakan isi form dengan benar!');
} else {
  try {
    // Untuk backward compatibility, cek jika vehicles adalah JSON array atau string
    let vehiclesData;
    try {
      // Coba parse sebagai JSON (format lama)
      vehiclesData = JSON.parse(decodeURIComponent(vehicles));
    } catch (e) {
      // Jika gagal parse, gunakan sebagai string (format baru)
      vehiclesData = decodeURIComponent(vehicles);
      // Pastikan vehiclesData adalah string valid, bukan undefined atau null
      if (vehiclesData === "null" || vehiclesData === "undefined") {
        throw new Error('Data vehicles tidak valid');
      }
    }

    // Parse data tambahan jika ada
    let parsedData = null;
    if (encodedData) {
      try {
        // Decode dua kali karena data mungkin di-encode dua kali
        const decodedData = decodeURIComponent(encodedData);
        parsedData = JSON.parse(decodedData);
      } catch (e) {
        console.warn('Error parsing data:', e);
        // Jika error parsing, gunakan object kosong untuk Job Costing 1 atau array kosong untuk Job Costing 2
        parsedData = rootCollection === 'Job Costing 1' ? {} : [];
      }
    } else {
      // Default value berdasarkan jenis Job Costing
      parsedData = rootCollection === 'Job Costing 1' ? {} : [];
    }

    console.log(`PDC Name: ${pdcName}, Batch: ${batch}, Mode: ${mode || 'add'}`);
    console.log('Vehicles:', vehiclesData);
    console.log('Data:', parsedData);
    console.log(`Root Collection: ${rootCollection}, Kode Gudang: ${kodeGudang || 'N/A'}`);

    // Eksekusi proses penyimpanan
    processData(pdcName, batch, vehiclesData, parsedData, rootCollection, kodeGudang, keterangan, mode);
  } catch (error) {
    console.error('Error parsing data:', error);
    redirectWithError('Format data tidak valid. Silakan coba lagi!');
  }
}

/**
 * Memproses dan menyimpan data ke Firestore
 */
async function processData(pdcName, batch, vehiclesData, parsedData, rootCollection, kodeGudang, keterangan, mode) {
  try {
    // Tampilkan loading indicator
    loadingIndicator.style.display = "block";
    loadingText.textContent = `${mode === 'edit' ? 'Memperbarui' : 'Menyimpan'} data...`;

    // Log semua parameter untuk debugging
    console.log('Processing with params:', {
      pdcName,
      batch,
      vehiclesData,
      parsedData,
      rootCollection,
      kodeGudang,
      keterangan,
      mode
    });

    // Persiapkan data dalam format yang sesuai dengan struktur database
    let preparedData;

    // Cek jenis Job Costing dan siapkan data sesuai struktur
    if (rootCollection === 'Job Costing 1') {
      console.log('Processing Job Costing 1 data');

      // Format untuk Job Costing 1
      preparedData = [{
        name: vehiclesData, // nama lokasi kendaraan
        productData: parsedData || {}, // data product dari parameter data
        describe: keterangan || ""
      }];
    }
    else if (rootCollection === 'Job Costing 2') {
      console.log('Processing Job Costing 2 data');

      // PERBAIKAN: Untuk Job Costing 2, vehiclesData sudah berupa array object
      // Tidak perlu dibungkus lagi dalam array
      if (Array.isArray(vehiclesData) && vehiclesData.length > 0) {
        // vehiclesData sudah dalam format yang benar: [{name: "mobil", code: [...], describe: "..."}]
        preparedData = vehiclesData;
      } else {
        // Fallback jika bukan array
        const vehicleName = typeof vehiclesData === 'string' ? vehiclesData : String(vehiclesData);
        preparedData = [{
          name: vehicleName,
          code: Array.isArray(parsedData) ? parsedData : [],
          describe: keterangan || ""
        }];
      }
    }
    else {
      throw new Error('Jenis Job Costing tidak dikenali');
    }

    console.log('Prepared data:', preparedData);

    // PERBAIKAN: Simpan ke Firebase berdasarkan mode dengan semua parameter yang diperlukan
    if (mode === 'edit') {
      // Mode edit (update data) - PASS SEMUA PARAMETER
      await updatePDC(pdcName, batch, preparedData, rootCollection, kodeGudang);
      loadingText.textContent = "Data berhasil diperbarui! Mengalihkan...";
    } else {
      // Mode default (tambah data baru) - PASS SEMUA PARAMETER
      await addNewPDC(pdcName, batch, preparedData, rootCollection, kodeGudang);
      loadingText.textContent = "Data berhasil disimpan! Mengalihkan...";
    }

    // Redirect ke add_data.html dengan status success
    setTimeout(() => {
      const url = `https://ryn-crypto.github.io/feature/list_code_pdc/add_data.html?status=success&message=${encodeURIComponent(`Data berhasil ${mode === 'edit' ? 'diperbarui' : 'disimpan'}!`)}`;
      window.location.href = url;
    }, 2000);

  } catch (error) {
    console.error('Gagal memproses data:', error);

    // Ubah teks loading menjadi error
    loadingText.textContent = `Gagal ${mode === 'edit' ? 'memperbarui' : 'menyimpan'} data! Mengalihkan...`;

    // Redirect dengan pesan error yang sesuai
    setTimeout(() => {
      redirectWithError(`Gagal ${mode === 'edit' ? 'memperbarui' : 'menyimpan'} data: ${error.message}`);
    }, 2000);
  }
}

/**
 * Redirect ke halaman add_data.html dengan pesan error
 */
function redirectWithError(message) {
  const url = `https://ryn-crypto.github.io/feature/list_code_pdc/add_data.html?status=error&message=${encodeURIComponent(message)}`;
  window.location.href = url;
}