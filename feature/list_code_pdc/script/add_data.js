const params = new URLSearchParams(window.location.search);
const status = params.get('status');
const message = params.get('message');

const pdcData = [
  {
    PDC: "TOYOTA SUNTER",
    batchNumber1: "Job Costing 35",
    batchNumber2: "Set 35",
    client: "PTSO"
  },
  {
    PDC: "TOYOTA SUNTER MARUNDA",
    batchNumber1: "Job Costing 37",
    batchNumber2: "Set 37",
    client: "PJKK"
  },
  {
    PDC: "LEXUS",
    batchNumber1: "Job Costing 35",
    batchNumber2: "Set 35",
    client: "PTAM"
  },
  {
    PDC: "TOYOTA CIBITUNG",
    batchNumber1: "Job Costing 35",
    batchNumber2: "Set 35",
    client: "PTSO"
  },
  {
    PDC: "TOYOTA CIBITUNG MARUNDA",
    batchNumber1: "Job Costing 37",
    batchNumber2: "Set 37",
    client: "PJKK"
  },
  {
    PDC: "TOYOTA KARAWANG",
    batchNumber1: "Job Costing 35",
    batchNumber2: "Set 35",
    client: "PTSO"
  },
  {
    PDC: "TOYOTA KARAWANG MARUNDA",
    batchNumber1: "Job Costing 37",
    batchNumber2: "Set 37",
    client: "PJKK"
  },
  {
    PDC: "PDC CHERY",
    batchNumber1: "Job Costing 38",
    batchNumber2: "Set 38",
    client: "PTCSI"
  },
  {
    PDC: "PDC NETA",
    batchNumber1: "Job Costing 38",
    batchNumber2: "Set 38",
    client: "PNETA"
  },
  {
    PDC: "PDC JETOUR",
    batchNumber1: "Job Costing 38",
    batchNumber2: "Set 38",
    client: "JMI"
  },
  {
    PDC: "PDC GWM DAWUAN",
    batchNumber1: "Job Costing 38",
    batchNumber2: "Set 38",
    client: "IIEB"
  },
  {
    PDC: "ISUZU KARAWANG TIMUR",
    batchNumber1: "Job Costing 38",
    batchNumber2: "Set 38",
    client: "PISO"
  },
  {
    PDC: "ISUZU KARAWANG BARAT",
    batchNumber1: "Job Costing 38",
    batchNumber2: "Set 38",
    client: "PISO"
  },
  {
    PDC: "DAIHATSU SUNTER",
    batchNumber1: "Job Costing 36",
    batchNumber2: "Set 36",
    client: "PDSO"
  },
  {
    PDC: "DAIHATSU SUNTER (BATAM)",
    batchNumber1: "Job Costing 36",
    batchNumber2: "Set 36",
    client: "PDSO"
  },
  {
    PDC: "PDC HASRAD",
    batchNumber1: "Job Costing 37",
    batchNumber2: "Set 37",
    client: "PJKK"
  },
  {
    PDC: "PDC DAWUAN",
    batchNumber1: "Job Costing 35",
    batchNumber2: "Set 35",
    client: "PVB"
  },
  {
    PDC: "PDC BATAM",
    batchNumber1: "Job Costing 37",
    batchNumber2: "Set 37",
    client: "PJKK"
  }
];

if (message) {
  const isError = status === 'error';
  showToast(message, isError);
}


let currentDetail = {
  model: "",
  lokasi: "",
  describe: "",
  gudangCode: "",
  batch: "",
  jobCostingType: "Job Costing",
  productName: "",
  code: []
};

// Initialize form with empty values
document.addEventListener("DOMContentLoaded", function () {
  renderForm();
  setupSearch();

});

function renderForm() {
  const content = document.getElementById("detail-content");
  const html = `
    <div class="card position-relative mb-5 p-2">
      <div class="card-body">
        <div class="container bg-body-secondary p-3 mb-3 mt-3 rounded position-relative">
          <h4 class="card-title">Form Detail</h4>
        </div>

        <!-- Nama PDC dengan Autocomplete -->
        <div class="mb-3 autocomplete-container">
          <label for="pdcNameInput" class="form-label"><strong>Nama PDC:</strong></label>
          <input type="text" class="form-control" id="pdcNameInput" placeholder="Masukkan nama PDC...">
          <div class="suggestions-list" id="pdcSuggestions"></div>
        </div>
        
        <!-- Nama Mobil -->
        <div class="mb-3">
          <label for="mobilNameInput" class="form-label"><strong>Nama Mobil:</strong></label>
          <input type="text" class="form-control" id="mobilNameInput" value="${currentDetail.lokasi}" placeholder="Masukkan nama mobil...">
        </div>
        
        <!-- Keterangan -->
        <div class="mb-3">
          <label for="keteranganInput" class="form-label"><strong>Keterangan:</strong></label>
          <input class="form-control" id="keteranganInput" rows="2" placeholder="Masukkan keterangan...">${currentDetail.describe}</input>
        </div>
        
        <!-- Keterangan -->
        <div class="mb-3">
          <label for="gudangCodeInput" class="form-label"><strong>Kode Gudang:</strong></label>
          <input class="form-control" id="gudangCodeInput" rows="2" placeholder="Masukkan kode gudang...">${currentDetail.gudangCode}</input>
        </div>

        <!-- Job Costing Type Dropdown -->
        <div class="mb-3">
          <label for="jobCostingSelect" class="form-label"><strong>Tipe Job Costing:</strong></label>
          <select class="form-control" id="jobCostingSelect" onchange="jobCostingTypeChanged()">
            <option value="Job Costing" ${currentDetail.jobCostingType === 'Job Costing' ? 'selected' : ''}>Job Costing 1</option>
            <option value="set" ${currentDetail.jobCostingType === 'set' ? 'selected' : ''}>Job Costing 2</option>
          </select>
        </div>

        <!-- Batch Number -->
        <div class="mb-3">
          <label for="batchInput" class="form-label"><strong>Batch Number:</strong></label>
          <input type="text" class="form-control" id="batchInput" value="${currentDetail.batch}" placeholder="Masukkan batch number...">
        </div>
        
        <!-- Dynamic Content based on Job Costing Type -->
        <div id="dynamicJobCostingContent">
          ${renderJobCostingContent()}
        </div>
        
        <!-- Action Buttons -->
        <div class="d-flex justify-content-end gap-2 mt-4">
          <button class="btn btn-secondary" onclick="cancelForm()">Cancel</button>
          <button class="btn btn-primary" onclick="saveForm()">Save</button>
        </div>
      </div>
    </div>
  `;

  content.innerHTML = html;

  // Initialize sortable for Job Costing 2 if needed
  if (currentDetail.jobCostingType === 'set') {
    initializeSortable();
  }
}

function renderJobCostingContent() {
  if (currentDetail.jobCostingType === 'Job Costing') {
    // Job Costing 1 - Single product code
    return `
    <div id="productPairContainer">
      <!-- Misalnya render 1 input awal -->
      <div class="row d-flex justify-content-center mt-3 product-pair-row" data-idx="1">
        <div class="col-md-6 col-11">
          <div class="job-costing-1">
            <div class="mb-3">
              <label for="descriptionInput1" class="form-label">
                <strong>Deskripsi Product:</strong>
              </label>
              <input
                type="text"
                class="form-control description-input"
                id="descriptionInput1"
                placeholder="Masukkan deskripsi produk..."
              />
            </div>
          </div>
        </div>
        <div class="col-md-5 col-11">
          <div class="job-costing-1">
            <div class="mb-3">
              <label for="productCodeInput1" class="form-label">
                <strong>Kode Produk:</strong>
              </label>
              <input
                type="text"
                class="form-control code-input"
                id="productCodeInput1"
                placeholder="Masukkan kode produk..."
              />
            </div>
          </div>
        </div>
        <div class="col-md-1 col-1 d-flex align-items-center justify-content-center">
          <button class="btn btn-outline-danger btn-sm remove-product-pair-btn" type="button" title="Hapus pasangan produk" onclick="removeProductPair(this)">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Tombol tambah -->
    <button
      class="btn btn-outline-success w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
      type="button"
      onclick="addNewProductPair()"
    >
      <i class="bi bi-plus-square-fill"></i> Tambah Pasangan Produk
    </button>
    `;
  } else {
    return `
      <div class="job-costing-2">
        <label class="form-label"><strong>Kode Produk:</strong></label>
        <div id="codeEditContainer" class="mb-3">
          ${Array(4).fill().map((_, idx) => `
          <div class="input-group mb-2" data-idx="${idx}">
            <span class="input-group-text drag-handle" style="cursor: grab;">
              <i class="bi bi-grip-horizontal"></i>
            </span>
            <input class="form-control code-edit" rows="1" placeholder="Kode produk..."></input>
            <button class="btn btn-outline-danger btn-sm remove-code-btn" type="button" title="Hapus kode" onclick="removeCode(this)">
              <i class="bi bi-x"></i>
            </button>
          </div>
        `).join("")
      }
        </div>
        <button class="btn btn-outline-success w-100 mb-3 d-flex align-items-center justify-content-center gap-2" type="button" onclick="addNewCode()">
          <i class="bi bi-plus-square-fill"></i> Tambah Kode Produk
        </button>
      </div>
    `;
  }
}

// Fungsi untuk menambahkan pasangan produk baru
function addNewProductPair() {
  const container = document.getElementById('productPairContainer');
  const newIndex = container.querySelectorAll('.product-pair-row').length + 1;

  const newRow = document.createElement('div');
  newRow.className = 'row d-flex justify-content-center mt-3 product-pair-row';
  newRow.dataset.idx = newIndex;

  newRow.innerHTML = `
    <div class="col-md-6 col-11">
      <div class="job-costing-1">
        <div class="mb-3">
          <label for="descriptionInput${newIndex}" class="form-label">
            <strong>Deskripsi Product:</strong>
          </label>
          <input
            type="text"
            class="form-control description-input"
            id="descriptionInput${newIndex}"
            placeholder="Masukkan deskripsi produk..."
          />
        </div>
      </div>
    </div>
    <div class="col-md-5 col-11">
      <div class="job-costing-1">
        <div class="mb-3">
          <label for="productCodeInput${newIndex}" class="form-label">
            <strong>Kode Produk:</strong>
          </label>
          <input
            type="text"
            class="form-control code-input"
            id="productCodeInput${newIndex}"
            placeholder="Masukkan kode produk..."
          />
        </div>
      </div>
    </div>
    <div class="col-md-1 col-1 d-flex align-items-center justify-content-center">
      <button class="btn btn-outline-danger btn-sm remove-product-pair-btn" type="button" title="Hapus pasangan produk" onclick="removeProductPair(this)">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `;

  container.appendChild(newRow);
}

// Fungsi untuk menghapus pasangan produk
function removeProductPair(button) {
  const row = button.closest('.product-pair-row');

  // Jika ini adalah pasangan produk terakhir, jangan hapus
  const allRows = document.querySelectorAll('.product-pair-row');
  if (allRows.length <= 1) {
    alert('Minimal harus ada satu pasangan produk.');
    return;
  }

  row.remove();

  // Perbarui indeks untuk pasangan produk yang tersisa
  updateProductPairIndices();
}

// Fungsi untuk memperbarui indeks di form setelah penghapusan
function updateProductPairIndices() {
  const rows = document.querySelectorAll('.product-pair-row');

  rows.forEach((row, idx) => {
    const newIdx = idx + 1;
    row.dataset.idx = newIdx;

    const descInput = row.querySelector('.description-input');
    const codeInput = row.querySelector('.code-input');

    descInput.id = `descriptionInput${newIdx}`;
    codeInput.id = `productCodeInput${newIdx}`;

    const descLabel = row.querySelector('label[for^="descriptionInput"]');
    const codeLabel = row.querySelector('label[for^="productCodeInput"]');

    descLabel.setAttribute('for', `descriptionInput${newIdx}`);
    codeLabel.setAttribute('for', `productCodeInput${newIdx}`);
  });
}

// Fungsi untuk menghapus kode di Job Costing 2
function removeCode(button) {
  const codeRow = button.closest('.input-group');

  // Jika ini adalah kode terakhir, jangan hapus
  const allCodes = document.querySelectorAll('#codeEditContainer .input-group');
  if (allCodes.length <= 1) {
    alert('Minimal harus ada satu kode produk.');
    return;
  }

  codeRow.remove();

  // Perbarui indeks untuk kode yang tersisa
  updateCodeIndices();
}

// Fungsi untuk memperbarui indeks kode
function updateCodeIndices() {
  const codeRows = document.querySelectorAll('#codeEditContainer .input-group');

  codeRows.forEach((row, idx) => {
    row.dataset.idx = idx;
  });
}

function addNewCode() {
  const container = document.getElementById("codeEditContainer");
  if (!container) return;

  const textareas = container.querySelectorAll("textarea.code-edit");
  // Cek kalau ada textarea kosong, jangan tambah baru
  for (const ta of textareas) {
    if (ta.value.trim() === "") {
      showToast("Isi dulu kode produk yang kosong sebelum menambah yang baru.");
      return;
    }
  }

  const newIndex = container.children.length;
  const div = document.createElement("div");
  div.className = "input-group mb-2";
  div.setAttribute("data-idx", newIndex);

  div.innerHTML = `
    <span class="input-group-text drag-handle" style="cursor: grab;">
      <i class="bi bi-grip-horizontal"></i>
    </span>
    <textarea class="form-control code-edit" rows="1" placeholder="Kode produk baru..."></textarea>
    <button class="btn btn-outline-danger btn-sm remove-code-btn" type="button" title="Hapus kode" onclick="removeCode(this)">
      <i class="bi bi-x"></i>
    </button>
  `;

  container.appendChild(div);
}

function jobCostingTypeChanged() {
  const select = document.getElementById('jobCostingSelect');
  currentDetail.jobCostingType = select.value;

  // Update current codes before switching view
  if (currentDetail.jobCostingType === 'Job Costing') {
    // Save current codes from Job Costing 2 if any
    const codeEdits = document.querySelectorAll('.code-edit');
    if (codeEdits.length > 0) {
      currentDetail.code = Array.from(codeEdits)
        .map(el => el.value.trim())
        .filter(code => code !== "");
    }
  } else {
    // Save from Job Costing 1
    const productCode = document.getElementById('productCodeInput')?.value.trim();
    if (productCode) {
      currentDetail.code = [productCode];
    }

    // Save product name if we have the field
    const productNameInput = document.getElementById('productNameInput');
    if (productNameInput) {
      currentDetail.productName = productNameInput.value.trim() || '';
    }
  }

  // Update the dynamic content
  const dynamicContent = document.getElementById('dynamicJobCostingContent');
  dynamicContent.innerHTML = renderJobCostingContent();

  // Initialize sortable for Job Costing 2
  if (currentDetail.jobCostingType === 'set') {
    initializeSortable();
  }
}

function initializeSortable() {
  const container = document.getElementById('codeEditContainer');
  if (container) {
    new Sortable(container, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      handle: '.drag-handle',
    });
  }
}

function saveForm() {
  // Get values from form
  currentDetail.model = document.getElementById('pdcNameInput').value.trim();  // contoh: "TOYOTA SUNTER"
  currentDetail.lokasi = document.getElementById('mobilNameInput').value.trim(); // contoh: "NEW AVANZA LLUMAR OEM BLACK"
  currentDetail.describe = document.getElementById('keteranganInput').value.trim();
  currentDetail.batch = document.getElementById('batchInput').value.trim();
  currentDetail.jobCostingType = document.getElementById('jobCostingSelect')?.value; // Pastikan select ada
  currentDetail.gudangCode = document.getElementById('gudangCodeInput').value.trim();

  // Validasi wajib
  if (!currentDetail.model || !currentDetail.lokasi) {
    showToast("Nama PDC dan Nama Mobil wajib diisi!");
    return;
  }

  // Ambil kode produk berdasarkan jobCostingType
  let codes = [];

  if (currentDetail.jobCostingType === 'Job Costing') {
    // Job Costing 1 - Ambil semua pasangan produk (deskripsi dan kode)
    const productPairs = document.querySelectorAll('.product-pair-row');

    // Objek untuk menyimpan pasangan deskripsi (key) dan kode (value)
    const productData = {};
    let hasValidPair = false;

    // Iterasi melalui semua baris pasangan produk
    productPairs.forEach((row) => {
      const descInput = row.querySelector('.description-input');
      const codeInput = row.querySelector('.code-input');

      if (descInput && codeInput) {
        const desc = descInput.value.trim();
        const code = codeInput.value.trim();

        // Pastikan keduanya tidak kosong
        if (desc && code) {
          productData[desc] = code;
          hasValidPair = true;
        } else if (desc || code) {
          // Jika salah satu diisi tapi yang lain tidak
          showToast("Setiap pasangan deskripsi dan kode produk harus diisi lengkap!");
          return;
        }
      }
    });

    // Validasi minimal ada satu pasangan deskripsi-kode produk
    if (!hasValidPair) {
      showToast("Minimal satu pasangan deskripsi dan kode produk wajib diisi!");
      return;
    }

    // Struktur vehicles untuk Job Costing 1
    const vehicles = currentDetail.lokasi;
    const describe = currentDetail.describe;
    const encodedCodeData = encodeURIComponent(JSON.stringify(productData));
    const rootCollection = 'Job Costing 1';
    const batch = `${currentDetail.batch}`;
    const gudangCode = currentDetail.gudangCode

    const confirmSwitch = confirm("Apakah Anda yakin ingin menyimpan data?");
    if (!confirmSwitch) return;

    // Simpan ke Firestore via save.html
    try {
      const pdcName = currentDetail.model;
      window.location.href = `https://ryn-crypto.github.io/feature/list_code_pdc/save.html?pdcName=${encodeURIComponent(pdcName)}&batch=${encodeURIComponent(batch)}&vehicles=${encodeURIComponent(vehicles)}&root=${encodeURIComponent(rootCollection)}&data=${encodeURIComponent(encodedCodeData)}&describe=${encodeURIComponent(describe)}&describe=${encodeURIComponent(describe)}&gudangCode=${encodeURIComponent(gudangCode)}`;

      showToast("Data berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      showToast("Terjadi kesalahan saat menyimpan data.");
    }

  } else {
    // Job Costing 2 - Ambil dari text area
    const codeEdits = document.querySelectorAll('.code-edit');
    codes = Array.from(codeEdits)
      .map(el => el.value.trim())
      .filter(code => code !== "");

    if (codes.length === 0) {
      showToast("Minimal satu kode produk wajib diisi!");
      return;
    }

    // Struktur vehicles untuk Job Costing 2
    const vehicles = [
      {
        name: currentDetail.lokasi,  // Nama mobil, jadi ID dokumen
        code: codes,
        describe: currentDetail.describe
      }
    ];

    // Tentukan root collection dan batch
    const rootCollection = 'Job Costing 2';
    const batch = `${currentDetail.batch}`;

    // Simpan ke Firestore via save.html
    try {
      const pdcName = currentDetail.model;
      window.location.href = `https://ryn-crypto.github.io/feature/list_code_pdc/save.html?pdcName=${encodeURIComponent(pdcName)}&batch=${encodeURIComponent(batch)}&vehicles=${encodeURIComponent(JSON.stringify(vehicles))}&root=${encodeURIComponent(rootCollection)}`;

      showToast("Data berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      showToast("Terjadi kesalahan saat menyimpan data.");
    }
  }
}


function cancelForm() {
  // Ask for confirmation before leaving
  if (confirm("Batalkan perubahan? Data yang belum diisi akan hilang.")) {
    // Redirect back to list page
    window.location.href = "https://ryn-crypto.github.io/feature/list_code_pdc/add_data.html";
  }
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  if (!toast || !toastMessage) {
    createToastElement();
    showToast(message, isError);
    return;
  }

  toastMessage.textContent = message;
  toast.style.display = "flex";
  toast.style.backgroundColor = isError ? "#e74c3c" : "#2ecc71";

  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}


function createToastElement() {
  // Create toast element if it doesn't exist
  const toastDiv = document.createElement('div');
  toastDiv.id = 'toast';
  toastDiv.className = 'position-fixed bottom-0 end-0 p-3';
  toastDiv.style.display = 'none';
  toastDiv.style.zIndex = '11';

  toastDiv.innerHTML = `
    <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">Notifikasi</strong>
        <button type="button" class="btn-close" onclick="hideToast()"></button>
      </div>
      <div class="toast-body" id="toast-message"></div>
    </div>
  `;

  document.body.appendChild(toastDiv);
}

function hideToast() {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.style.display = "none";
  }
}

function setupSearch() {
  const input = document.getElementById("pdcNameInput");
  const batchType = document.getElementById("jobCostingSelect")
  const suggestionsBox = document.getElementById("pdcSuggestions");
  let activeIndex = -1;

  input.addEventListener("input", function () {
    const value = this.value.trim().toLowerCase();
    suggestionsBox.innerHTML = "";
    activeIndex = -1;

    if (value.length === 0) {
      suggestionsBox.style.display = "none";
      return;
    }

    const filtered = pdcData
      .filter(item => item.PDC.toLowerCase().includes(value))
      .map(item => item.PDC);


    if (filtered.length === 0) {
      suggestionsBox.style.display = "none";
      return;
    }

    filtered.forEach(pdc => {
      const div = document.createElement("div");
      div.classList.add("suggestion-item");
      div.textContent = pdc;
      div.addEventListener("click", () => {
        input.value = pdc;
        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "none";
        // Optional: update currentDetail
        currentDetail.lokasi = pdc;
      });
      suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = "block";
  });

  input.addEventListener("keydown", function (e) {
    const items = suggestionsBox.querySelectorAll(".suggestion-item");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (activeIndex < items.length - 1) activeIndex++;
      updateActiveItem(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (activeIndex > 0) activeIndex--;
      updateActiveItem(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < items.length) {
        const selected = items[activeIndex];
        input.value = selected.textContent;
        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = "none";
        // Optional: update currentDetail
        currentDetail.lokasi = selected.textContent;
      }
    }
  });

  function updateActiveItem(items) {
    items.forEach((item, index) => {
      item.classList.toggle("active", index === activeIndex);
    });
  }

  // Klik di luar akan menutup saran
  document.addEventListener("click", function (e) {
    if (!suggestionsBox.contains(e.target) && e.target !== input) {
      suggestionsBox.innerHTML = "";
      suggestionsBox.style.display = "none";
      activeIndex = -1;
    }
  });

  input.addEventListener('focusout', () => changeBatchNumber(input.value, batchType.value));

  batchType.addEventListener('change', () => changeBatchNumber(input.value, batchType.value));
}

function changeBatchNumber(pdcName, batchTypeValue) {
  let jobCostingNumber = "";

  // Cari data PDC di pdcData
  const found = pdcData.find(item => item.PDC === pdcName);
  const jcNumber = document.getElementById("batchInput");

  if (found) {
    if (batchTypeValue === "Job Costing") {
      jobCostingNumber = found.batchNumber1;
      jcNumber.value = jobCostingNumber;
      jcNumber.disabled = true;
    } else {
      jobCostingNumber = found.batchNumber2;
      jcNumber.value = jobCostingNumber;
      jcNumber.disabled = true;
    }
  } else {
    console.log("PDC tidak ditemukan di data.");
  }
}