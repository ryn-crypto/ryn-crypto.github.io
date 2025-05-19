import { getAllJobCostingData } from '../firebase/firebase_setup.js';

let allData = {};
let selectedPDC = "";
let selectedBrand = "";

const loadingIndicator = document.getElementById("loadingIndicator");

async function loadAndRenderCards() {
  console.log("initializing main");
  try {
    loadingIndicator.style.display = "block";
    const rawData = await getAllJobCostingData();
    loadingIndicator.style.display = "none";
    // Ubah data Firebase ke struktur allData = { [pdcName]: { batchNumber, [brand]: { code } } }
    allData = {};

    for (const entry of rawData) {
      const { pdcName, batchNumber, vehicles } = entry;
      allData[pdcName] = { batchNumber };

      for (const vehicle of vehicles) {
        allData[pdcName][vehicle.id] = {
          code: vehicle.code || ""
        };
      }
    }

    const pdcSet = new Set(Object.keys(allData));

    // Inisialisasi dropdown PDC
    setupSearch("searchPDC", "dropdownPDC", [...pdcSet], (value) => {
      selectedPDC = value;
      selectedBrand = ""; // reset brand saat PDC berubah
      document.getElementById("searchBrand").value = "";

      // Ambil brand dari PDC terpilih
      const lokasiData = allData[selectedPDC] || {};
      const brandSet = new Set(
        Object.keys(lokasiData).filter((key) => key !== "batchNumber")
      );

      // Aktifkan dropdown brand setelah pilih PDC
      toggleInput("searchBrand", true);

      setupSearch("searchBrand", "dropdownBrand", [...brandSet], (val) => {
        selectedBrand = val;
        renderFilteredCards();
      });

      renderFilteredCards();
    });

    // Nonaktifkan input brand awalnya
    toggleInput("searchBrand", false);

    renderFilteredCards();
  } catch (error) {
    console.error("Gagal memuat data dari Firestore:", error);
  }
}

function toggleInput(inputId, enabled) {
  const input = document.getElementById(inputId);
  input.disabled = !enabled;
  if (!enabled) input.placeholder = "Pilih PDC terlebih dahulu";
  else input.placeholder = "Cari merek mobil";
}

function renderFilteredCards() {
  const container = document.getElementById("cardContainer");
  container.innerHTML = "";

  for (const lokasi in allData) {
    if (selectedPDC && lokasi !== selectedPDC) continue;

    const lokasiData = allData[lokasi];
    const batch = lokasiData.batchNumber || "";

    for (const model in lokasiData) {
      if (model === "batchNumber") continue;
      if (selectedBrand && model !== selectedBrand) continue;

      const col = document.createElement("div");
      col.className = "col-xl-4 col-lg-6 mb-3";

      const card = document.createElement("div");
      card.className = "card card-contain shadow-sm h-100";
      card.style.cursor = "pointer";
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title mb-1">${model}</h5>
          <h6 class="card-subtitle mb-3">${lokasi}</h6>
          <p class="card-text">${batch}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        const url = new URL("https://ryn-crypto.github.io/feature/list_code_pdc/detail.html", window.location.origin);
        url.searchParams.set("model", model);
        url.searchParams.set("lokasi", lokasi);
        url.searchParams.set("batch", batch);
        window.location.href = url.toString();
      });

      col.appendChild(card);
      container.appendChild(col);
    }
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

document.addEventListener("DOMContentLoaded", loadAndRenderCards);