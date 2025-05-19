import { addNewPDC } from '../firebase/firebase_setup.js';

const urlParams = new URLSearchParams(window.location.search);
const pdcName = urlParams.get('pdcName');
const batch = urlParams.get('batch');
const vehicles = JSON.parse(decodeURIComponent(urlParams.get('vehicles')));
const rootCollection = urlParams.get('root');

const loadingIndicator = document.getElementById('loadingIndicator');

(async () => {
  try {
    loadingIndicator.style.display = "block";
    console.log(`PDC Name: ${pdcName}, Batch: ${batch}, Vehicles: ${vehicles}, Root Collection: ${rootCollection}`);

    // Menyimpan data
    await addNewPDC(pdcName, batch, vehicles, rootCollection);

    // Redirect ke add_data.html dengan membawa status 'success'
    setTimeout(() => {
      const url = `add_data.html?status=success&message=${encodeURIComponent('Data berhasil disimpan!')}`;
      window.location.href = url;
    }, 2000);
  } catch (error) {
    loadingIndicator.style.display = "block";
    console.error('Gagal menyimpan data:', error);

    // Redirect ke add_data.html dengan membawa status 'error'
    setTimeout(() => {
      const url = `add_data.html?status=error&message=${encodeURIComponent('Gagal menyimpan data. Silakan coba lagi!')}`;
      window.location.href = url;
    }, 2000);
  }

})();