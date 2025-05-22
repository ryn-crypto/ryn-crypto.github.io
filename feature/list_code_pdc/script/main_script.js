import { getAllJobCostingData } from '../firebase/firebase_setup.js';
import { parseJobCosting1, parseJobCosting2 } from "../helpers/jobCostingParser.js";

let allData = {};
let selectedPDC = "";
let selectedBrand = "";
let currentJobCosting = "Job Costing 1"; // Default value
let currentJobCostingCode = "JC1";

const loadingIndicator = document.getElementById("loadingIndicator");

// Fungsi untuk menangani klik pada dropdown item
function setupJobCostingDropdown() {
  const dropdownItems = document.querySelectorAll('.dropdown-menu .dropdown-item');

  dropdownItems.forEach(item => {
    item.addEventListener('click', function (event) {
      event.preventDefault();

      // Ambil teks dari item dropdown yang diklik
      const jobCostingText = this.textContent.trim();

      // Update teks pada tombol dropdown
      const dropdownButton = document.querySelector('.dropdown-toggle');
      if (dropdownButton) {
        dropdownButton.textContent = jobCostingText;
      }

      // Tentukan kode berdasarkan teks
      let jobCostingCode = "";
      if (jobCostingText === "Job Costing 1") {
        jobCostingCode = "JC1";
      } else if (jobCostingText === "Job Costing 2") {
        jobCostingCode = "JC2";
      }

      // Update nilai global
      currentJobCosting = jobCostingText;
      currentJobCostingCode = jobCostingCode;

      loadAndRenderCards();
    });
  });
}

async function loadAndRenderCards() {
  try {
    const container = document.getElementById("cardContainer");
    container.innerHTML = "";

    loadingIndicator.style.display = "block";

    allData = {};
    selectedPDC = "";
    selectedBrand = "";
    document.getElementById("searchPDC").value = "";
    document.getElementById("searchBrand").value = "";

    // Gunakan loadJobCostingData (sudah otomatis parsing dari helper)
    const parsedData = await loadJobCostingData(currentJobCosting, currentJobCostingCode);

    loadingIndicator.style.display = "none";
    allData = {};

    // Ekstrak data dengan mengenali struktur nested array
    if (Array.isArray(parsedData)) {
      // Iterasi melalui array utama
      parsedData.forEach((group, groupIndex) => {
        // Periksa apakah group adalah array
        if (Array.isArray(group)) {
          // Iterasi melalui setiap item dalam group
          group.forEach((item, itemIndex) => {
            // Jika item memiliki id, gunakan sebagai kunci
            if (item && item.id) {
              const id = item.id;
              const batchNumber = item.batchNumber || "unknown";

              // Jika lokasi belum ada di allData, tambahkan
              if (!allData[id]) {
                allData[id] = {
                  batchNumber: batchNumber
                };
              }

              // Jika item memiliki mobil (array mobil), tambahkan setiap mobil sebagai model
              if (item.mobil && Array.isArray(item.mobil)) {
                item.mobil.forEach(mobilName => {
                  // Tambahkan mobil sebagai model dengan properti dasar
                  allData[id][mobilName] = {
                    code: item.code || [],
                    describe: item.describe || []
                  };
                });
              }
            }
          });
        } else if (typeof group === 'object' && group !== null) {
          // Jika group adalah objek dengan properti numerik (seperti yang terlihat di log)
          const numericKeys = Object.keys(group).filter(k => !isNaN(parseInt(k)));
          numericKeys.forEach(key => {
            const item = group[key];
            if (item && item.id) {
              const id = item.id;
              const batchNumber = item.batchNumber || "unknown";

              if (!allData[id]) {
                allData[id] = {
                  batchNumber: batchNumber
                };
              }

              if (item.mobil && Array.isArray(item.mobil)) {
                item.mobil.forEach(mobilName => {
                  allData[id][mobilName] = {
                    code: item.code || [],
                    describe: item.describe || []
                  };
                });
              }
            }
          });
        }
      });
    }

    const pdcSet = new Set(Object.keys(allData));

    // Inisialisasi dropdown PDC
    setupSearch("searchPDC", "dropdownPDC", [...pdcSet], (value) => {
      selectedPDC = value;
      selectedBrand = ""; // reset brand saat PDC berubah
      document.getElementById("searchBrand").value = "";

      const lokasiData = allData[selectedPDC] || {};

      // Kita perlu mengambil brand/mobil dari data yang sudah diolah
      const brandSet = new Set();

      // Filter properti yang bukan metadata
      Object.keys(lokasiData)
        .filter(key => key !== "batchNumber")
        .forEach(key => brandSet.add(key));

      toggleInput("searchBrand", true);

      setupSearch("searchBrand", "dropdownBrand", [...brandSet], (val) => {
        selectedBrand = val;
        renderFilteredCards();
      });

      renderFilteredCards();
    });

    toggleInput("searchBrand", false);
    renderFilteredCards();
  } catch (error) {
    console.error("Gagal memuat data dari Firestore:", error);
    loadingIndicator.style.display = "none";
  }
}


// Keep your original loadJobCostingData function
const loadJobCostingData = async (collectionName, structureType) => {
  try {
    const rawData = await getAllJobCostingData(collectionName); // ini sudah array of objects

    const parsedData = rawData.map(doc => {
      if (structureType === "JC1") {
        return parseJobCosting1(doc);
      } else if (structureType === "JC2") {
        return parseJobCosting2(doc);
      } else {
        return doc; // fallback
      }
    });

    return parsedData;
  } catch (error) {
    console.error("Failed to load and parse job costing data:", error);
    return [];
  }
};


function toggleInput(inputId, enabled) {
  const input = document.getElementById(inputId);
  input.disabled = !enabled;
  if (!enabled) input.placeholder = "Pilih PDC terlebih dahulu";
  else input.placeholder = "Cari merek mobil";
}

function renderFilteredCards() {
  const container = document.getElementById("cardContainer");
  container.innerHTML = "";

  let cardCount = 0;

  for (const lokasi in allData) {
    if (selectedPDC && lokasi !== selectedPDC) continue;

    const lokasiData = allData[lokasi];
    const batch = lokasiData.batchNumber || "";

    for (const model in lokasiData) {
      if (model === "batchNumber") continue;
      if (selectedBrand && model !== selectedBrand) continue;

      const modelData = lokasiData[model];
      const codeData = modelData.code || {};
      const describeData = modelData.describe || [];

      const col = document.createElement("div");
      col.className = "col-xl-4 col-lg-6 mb-3";

      const card = document.createElement("div");
      card.className = "card card-contain shadow-sm h-100";
      card.style.cursor = "pointer";
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title mb-2">${model}</h5>
          <h6 class="card-subtitle mb-3">${lokasi}</h6>
          <p class="card-text">${batch}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        const url = new URL("https://ryn-crypto.github.io/feature/list_code_pdc/detail.html", window.location.origin);
        url.searchParams.set("mobilName", model);
        url.searchParams.set("pdcName", lokasi);
        url.searchParams.set("batchNumber", batch);
        url.searchParams.set("jobCosting", currentJobCosting);
        url.searchParams.set("codeData", JSON.stringify(codeData));
        url.searchParams.set("describeData", JSON.stringify(describeData));
        window.location.href = url.toString();
      });

      col.appendChild(card);
      container.appendChild(col);
      cardCount++;
    }
  }

  // Tampilkan pesan jika tidak ada kartu yang dirender
  if (cardCount === 0) {
    const noDataMsg = document.createElement("div");
    noDataMsg.className = "col-12 text-center py-4";
    noDataMsg.innerHTML = "<h4>Tidak ada data yang sesuai dengan filter</h4>";
    container.appendChild(noDataMsg);
  }
}

function setupSearch(inputId, dropdownId, dataList, onSelect) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  let currentFocus = -1;

  input.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    dropdown.innerHTML = "";
    currentFocus = -1;

    if (!query) {
      dropdown.classList.remove("show");
      if (onSelect) onSelect(""); // kosongkan filter saat input kosong
      return;
    }

    const filtered = dataList.filter(item => item.toLowerCase().includes(query));
    if (filtered.length === 0) {
      dropdown.classList.remove("show");
      return;
    }

    filtered.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<a class="dropdown-item" href="#">${item}</a>`;
      dropdown.appendChild(li);
    });

    dropdown.classList.add("show");
  });

  input.addEventListener("keydown", function (e) {
    const items = dropdown.querySelectorAll("a.dropdown-item");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      currentFocus = (currentFocus + 1) % items.length;
      setActive(items);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      currentFocus = (currentFocus - 1 + items.length) % items.length;
      setActive(items);
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (currentFocus > -1 && items[currentFocus]) {
        e.preventDefault();
        input.value = items[currentFocus].textContent;
        dropdown.classList.remove("show");
        if (onSelect) onSelect(input.value);
      }
    }
  });

  dropdown.addEventListener("click", function (e) {
    if (e.target && e.target.matches("a.dropdown-item")) {
      input.value = e.target.textContent;
      dropdown.classList.remove("show");
      if (onSelect) onSelect(input.value);
    }
  });

  document.addEventListener("click", function (e) {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

  function setActive(items) {
    items.forEach(item => item.classList.remove("active"));
    if (items[currentFocus]) items[currentFocus].classList.add("active");
  }
}

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Setup dropdown Job Costing
  setupJobCostingDropdown();

  // Load data dengan nilai default
  loadAndRenderCards();
});