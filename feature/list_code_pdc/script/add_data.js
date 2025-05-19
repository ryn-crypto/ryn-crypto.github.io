const loadingIndicator = document.getElementById("loadingIndicator");

const params = new URLSearchParams(window.location.search);
const status = params.get('status');
const message = params.get('message');

if (message) {
  const isError = status === 'error';
  showToast(message, isError);
}


let currentDetail = {
  model: "",
  lokasi: "",
  describe: "",
  batch: "",
  jobCostingType: "Job Costing",
  productName: "",
  code: []
};

// Initialize form with empty values
document.addEventListener("DOMContentLoaded", function () {
  renderForm();
});

function renderForm() {
  const content = document.getElementById("detail-content");
  const html = `
    <div class="card position-relative">
      <div class="card-body">
        <div class="container bg-primary-subtle p-3 mb-3 mt-3 rounded position-relative">
          <h4 class="card-title">Form Detail</h4>
        </div>
        
        <!-- Nama PDC -->
        <div class="mb-3">
          <label for="pdcNameInput" class="form-label"><strong>Nama PDC:</strong></label>
          <input type="text" class="form-control" id="pdcNameInput" value="${currentDetail.model}" placeholder="Masukkan nama PDC...">
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
      <div class="job-costing-1">
        <!-- Product Code -->
        <div class="mb-3">
          <label for="productCodeInput" class="form-label"><strong>Kode Produk:</strong></label>
          <input type="text" class="form-control" id="productCodeInput" value="${currentDetail.code[0] || ''}" placeholder="Masukkan kode produk...">
        </div>
      </div>
    `;
  } else {
    // Job Costing 2 - Multiple product codes with drag functionality
    return `
      <div class="job-costing-2">
        <label class="form-label"><strong>Kode Produk:</strong></label>
        <div id="codeEditContainer" class="mb-3">
          ${
      // Always create 4 empty fields for new data input
      Array(4).fill().map((_, idx) => `
              <div class="input-group mb-2" data-idx="${idx}">
                <span class="input-group-text drag-handle" style="cursor: grab;">
                  <i class="bi bi-grip-horizontal"></i>
                </span>
                <textarea class="form-control code-edit" rows="1" placeholder="Kode produk..."></textarea>
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

function removeCode(button) {
  const container = document.getElementById("codeEditContainer");
  if (!container) return;

  const group = button.closest(".input-group");
  if (group) {
    container.removeChild(group);
  }
}

function saveForm() {

  // Get values from form
  currentDetail.model = document.getElementById('pdcNameInput').value.trim();  // contoh: "TOYOTA SUNTER"
  currentDetail.lokasi = document.getElementById('mobilNameInput').value.trim(); // contoh: "NEW AVANZA LLUMAR OEM BLACK"
  currentDetail.describe = document.getElementById('keteranganInput').value.trim();
  currentDetail.batch = document.getElementById('batchInput').value.trim();
  currentDetail.jobCostingType = document.getElementById('jobCostingSelect')?.value; // Pastikan select ada

  // Validasi wajib
  if (!currentDetail.model || !currentDetail.lokasi) {
    showToast("Nama PDC dan Nama Mobil wajib diisi!");
    return;
  }
  // Ambil kode produk
  let codes = [];
  if (currentDetail.jobCostingType === 'Job Costing') {
    const productNameInput = document.getElementById('productNameInput');
    if (productNameInput) {
      currentDetail.productName = productNameInput.value.trim();
    }

    const code = document.getElementById('productCodeInput')?.value.trim();
    console.log("Product Code:", code);

    if (!code) {
      showToast("Kode produk wajib diisi!");
      return;
    }
    codes = [code];
  } else {
    const codeEdits = document.querySelectorAll('.code-edit');
    codes = Array.from(codeEdits)
      .map(el => el.value.trim())
      .filter(code => code !== "");

    if (codes.length === 0) {
      showToast("Minimal satu kode produk wajib diisi!");
      return;
    }
  }

  // Siapkan struktur kendaraan
  const vehicles = [
    {
      name: currentDetail.lokasi,  // Nama mobil, jadi ID dokumen
      code: codes,
      describe: currentDetail.describe
    }
  ];

  // Tentukan root collection berdasarkan jobCostingType
  const rootCollection = currentDetail.jobCostingType === 'Job Costing' ? 'Job Costing 1' : 'Job Costing 2';
  const batch = rootCollection === 'Job Costing 1' ? `Job Costing ${currentDetail.batch}` : `set ${currentDetail.batch}`;

  // Simpan ke Firestore
  try {
    const pdcName = currentDetail.model;
    window.location.href = `save.html?pdcName=${encodeURIComponent(pdcName)}&batch=${encodeURIComponent(batch)}&vehicles=${encodeURIComponent(JSON.stringify(vehicles))}&root=${encodeURIComponent(rootCollection)}`;

    showToast("Data berhasil disimpan!");
  } catch (error) {
    console.error("Gagal menyimpan:", error);
    showToast("Terjadi kesalahan saat menyimpan data.");
  }
}


function cancelForm() {
  // Ask for confirmation before leaving
  if (confirm("Batalkan perubahan? Data yang belum disimpan akan hilang.")) {
    // Redirect back to list page
    window.location.href = "add_data.html";
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