const params = new URLSearchParams(window.location.search);
const model = params.get("model");
const lokasi = params.get("lokasi");
const batch = params.get("batch");

document.getElementById("page-title").textContent = `Detail: ${model}`;

let currentDetail = null;
let isEditMode = false;
let originalBatch = batch;
let originalCodes = [];

fetch("../list_data.json")
  .then((res) => res.json())
  .then((data) => {
    const content = document.getElementById("detail-content");
    const lokasiData = data[lokasi];
    if (!lokasiData) {
      content.innerHTML = `<div class="alert alert-danger">Lokasi tidak ditemukan</div>`;
      return;
    }

    const detail = lokasiData[model];
    if (!detail) {
      content.innerHTML = `<div class="alert alert-warning">Model tidak ditemukan di ${lokasi}</div>`;
      return;
    }

    currentDetail = detail;
    originalCodes = [...detail.code]; // simpan salinan

    renderContent(batch, detail.code);
  });

function renderContent(batchValue, codes) {
  const content = document.getElementById("detail-content");
  // Keterangan deskripsi dan batch + kode produk
  const html = `
    <div class="card position-relative">
      <div class="card-body">
        <button class="btn btn-sm btn-outline-warning position-absolute top-0 end-0 mt-2 me-2" title="Edit" onclick="toggleEdit()">
            <i class="bi bi-pencil"></i>
        </button>
        <div class="container bg-primary-subtle p-3 mb-3 mt-5 rounded position-relative">
          <h4 class="card-title">${model}</h4>
          <h6 class="card-subtitle mb-2 text-muted">${lokasi}</h6>
        </div>
        <div class="input-group mb-3">
          <textarea id="descText" class="form-control" rows="1" readonly>${currentDetail.describe}</textarea>
          <button class="btn btn-outline-info" type="button" onclick="copyText(currentDetail.describe)" title="Copy Deskripsi">
            <i class="bi bi-clipboard2"></i>
          </button>
        </div>
        
        ${!isEditMode ? `
        <!-- VIEW MODE -->
        <label for="batchInput" class="form-label"><strong>Batch Number :</strong></label>
        <div class="input-group mb-3">
          <textarea id="batchInput" class="form-control" rows="1" readonly>${batchValue}</textarea>
          <button class="btn btn-outline-info" type="button" onclick="copyToClipboard('batchInput')">
            <i class="bi bi-clipboard2"></i>
          </button>
        </div>
        
        <label class="form-label"><strong>Kode Produk:</strong></label>
        <ul class="list-group">
          ${codes
        .map(
          (code) => `
            <li class="list-group-item d-flex justify-content-between align-items-center pt-2">
              <span>${code}</span>
              <button class="btn btn-sm btn-outline-info" onclick="copyText('${code}')" title="Copy Kode Produk">
                <i class="bi bi-clipboard2"></i>
              </button>
            </li>`
        )
        .join("")}
        </ul>
        ` : `
        <!-- EDIT MODE -->
<label for="batchEdit" class="form-label"><strong>Batch Number (Edit Mode):</strong></label>
<textarea id="batchEdit" class="form-control mb-3" rows="1">${batchValue}</textarea>

<label class="form-label"><strong>Kode Produk (Edit Mode):</strong></label>
<div id="codeEditContainer" class="mb-3">
  ${codes
      .map(
        (code, idx) => `
      <div class="input-group mb-2" data-idx="${idx}">
        <span class="input-group-text drag-handle" style="cursor: grab;">
          <i class="bi bi-grip-horizontal"></i>
        </span>
        <textarea class="form-control code-edit" rows="1">${code}</textarea>
        <button class="btn btn-outline-danger btn-sm remove-code-btn" type="button" title="Hapus kode" onclick="removeCode(this)">
          <i class="bi bi-x"></i>
        </button>
      </div>`
      )
      .join("")}
      </div>

      <button class="btn btn-outline-success w-100 mb-3 d-flex align-items-center justify-content-center gap-2" type="button" onclick="addNewCode()">
        <i class="bi bi-plus-square-fill"></i> Tambah Kode Produk
      </button>

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" onclick="cancelEdit()">Cancel</button>
        <button class="btn btn-primary" onclick="saveEdit()">Save</button>
      </div>

      `}
    </div>
  </div>

  <div id="toast" class="toast align-items-center text-bg-primary border-0 position-fixed bottom-0 end-0 m-3" role="alert" aria-live="assertive" aria-atomic="true" style="display:none; z-index: 1080;">
    <div class="d-flex">
      <div class="toast-body" id="toast-message"></div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="hideToast()" aria-label="Close"></button>
    </div>
  </div>
  `;

  content.innerHTML = html;

  if (isEditMode) {
    new Sortable(document.getElementById('codeEditContainer'), {
      animation: 150,
      ghostClass: 'sortable-ghost',
      handle: '.drag-handle', // bisa juga bikin handle khusus kalau mau
    });
  }
}

// Copy fungsi (sama seperti sebelumnya)
function copyToClipboard(elementId) {
  const textarea = document.getElementById(elementId);
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(textarea.value)
    .then(() => showToast("Copied to clipboard!"))
    .catch(() => showToast("Failed to copy!"));
}

function copyText(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast("Copied to clipboard!"))
    .catch(() => showToast("Failed to copy!"));
}

// Toast tampil dan hilang otomatis
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  toastMessage.textContent = message;
  toast.style.display = "flex";

  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

function hideToast() {
  const toast = document.getElementById("toast");
  toast.style.display = "none";
}

// Toggle Edit Mode
function toggleEdit() {
  isEditMode = !isEditMode;
  // Pakai nilai current batch dan codes yang terakhir (kalau sudah di save, sudah update variabel ini)
  if (isEditMode) {
    // Saat masuk edit, update textarea dengan data terakhir
    renderContent(originalBatch, originalCodes);
  } else {
    // kalau keluar edit, render dengan data terakhir juga
    renderContent(originalBatch, originalCodes);
  }
}

// Cancel edit (revert ke original)
function cancelEdit() {
  isEditMode = false;
  renderContent(originalBatch, originalCodes);
}

// Save edit (ambil dari textarea lalu update original dan current)
function saveEdit() {
  // Ambil value batch
  const batchEdit = document.getElementById("batchEdit").value.trim();

  // Ambil semua kode produk dari textarea
  const codeEditElems = document.querySelectorAll(".code-edit");
  const updatedCodes = [];
  codeEditElems.forEach((el) => {
    if (el.value.trim() !== "") {
      updatedCodes.push(el.value.trim());
    }
  });

  // Update data lokal
  originalBatch = batchEdit;
  originalCodes = updatedCodes;

  // Kembali ke mode view dan render
  isEditMode = false;
  renderContent(originalBatch, originalCodes);
  showToast("Data berhasil disimpan!");
}

function addNewCode() {
  const container = document.getElementById("codeEditContainer");
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
  const group = button.closest(".input-group");
  if (group) {
    container.removeChild(group);
  }
}
