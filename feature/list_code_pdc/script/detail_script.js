// Fungsi utama untuk menginisialisasi halaman detail
let editMode = false;

function initializeDetailPage() {
  // Parsing parameter dari URL
  const params = new URLSearchParams(window.location.search);

  // Data dasar
  const mobilName = params.get("mobilName") || "";
  const pdcName = params.get("pdcName") || "";
  const batchNumber = params.get("batchNumber") || "";
  const jobCosting = params.get("jobCosting") || "Job Costing 1";

  // Parse codeData dan describeData
  let codeData = {};
  let describeData = [];

  try {
    if (params.get("codeData")) {
      codeData = JSON.parse(params.get("codeData"));
    }

    if (params.get("describeData")) {
      describeData = JSON.parse(params.get("describeData"));
    }
  } catch (error) {
    console.error("Error parsing URL parameters:", error);
  }

  // Siapkan objek data untuk digunakan dalam template
  const currentDetail = {
    mobilName: mobilName,
    lokasi: pdcName,
    batch: batchNumber,
    jobCostingType: jobCosting,
    describe: Array.isArray(describeData) && describeData.length > 0 ? describeData[0] : "",
    codeData: codeData,
    codeGudang: "sementara kosong"
  };

  // Render HTML dan masukkan ke dalam container
  const detailContainer = document.getElementById("detailContainer");
  if (detailContainer) {
    detailContainer.innerHTML = editModeCheck(currentDetail);
  }

  // Inisialisasi event listeners setelah DOM dirender
  initializeEventListeners(currentDetail);

  // Populasi data code sesuai dengan tipe job costing
  populateCodeData(currentDetail);
}

function editModeCheck(currentDetail) {
  // Cek apakah dalam mode edit
  if (editMode) {
    return generateEditModeHtml(currentDetail);
  } else {
    return generateDetailHTML(currentDetail);
  }
}

function generateDetailHTML(currentDetail) {
  return `
      <!-- atur layout dulu -->
      <div class="card position-relative">
        <div class="card-body">
          
          <div class="container bg-primary-subtle p-3 mb-2 rounded position-relative">
            <h2 class="card-title text-center">Detail Data</h2>
          </div>

          <div class="container px-4">

            <div class="text-center">
              <!-- Nama PDC dengan Autocomplete -->
              <div class="mb-2 autocomplete-container">
                <h3 class="mt-2 mb-3">${currentDetail.lokasi}</h3>
              </div>

              <!-- Nama Mobil -->
              <div class="mb-">
                <h5 class="mt-2 mb-3">${currentDetail.mobilName}</h5>
              </div>
            </div>

            <button class="btn btn-sm btn-outline-warning position-absolute top-0 end-0 mt-4 me-4" title="Edit" onclick="toggleEdit()">
                  <i class="bi bi-pencil"></i>
            </button>

            <!-- Keterangan -->
            <div class="mb-3">
              <label for="keteranganInput" class="form-label"><strong>Keterangan:</strong></label>
              <div class="input-group">
                <input class="form-control"
                  value="${currentDetail.describe}"
                  readonly/>
                <button class="btn btn-outline-info" type="button" onclick="copyText('${currentDetail.describe}')" title="Copy Deskripsi">
                  <i class="bi bi-clipboard2"></i>
                </button>
              </div>
            </div>

            <!-- kode gudang -->
            <div class="mb-3">
              <label for="kodeGudangInput" class="form-label"><strong>kode gudang:</strong></label>
              <div class="input-group">
                <input class="form-control"
                  value="${currentDetail.codeGudang}"
                  readonly/>
                <button class="btn btn-outline-info" type="button" onclick="copyText('${currentDetail.codeGudang}')" title="Copy Deskripsi">
                  <i class="bi bi-clipboard2"></i>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label for="jobCostingSelect" class="form-label"><strong>Tipe Job Costing:</strong></label>
              <select class="form-control" id="jobCostingSelect" disabled>
                <option value="Job Costing" ${currentDetail.jobCostingType === 'Job Costing 1' ? 'selected' : ''}>Job Costing 1</option>
                <option value="set" ${currentDetail.jobCostingType === 'Job Costing 2' ? 'selected' : ''}>Job Costing 2</option>
              </select>
            </div>

            <!-- Batch Number -->
            <div class="mb-3">
              <label for="batchInput" class="form-label"><strong>Batch Number:</strong></label>
              <input
                type="text"
                class="form-control"
                value="${currentDetail.batch}" readonly
              />
            </div>
            <!-- Dynamic Content based on Job Costing Type -->
            <div id="dynamicJobCostingContent">
              ${renderJobCostingContent(currentDetail)}
            </div>
          </div>
        </div>
      </div>
      <!-- atur layout end  -->
  `;
}

// Fungsi untuk menghasilkan HTML detail
function generateEditModeHtml(currentDetail) {
  return `
    <div class="card position-relative">
      <div class="card-body">
        <div class="container bg-primary-subtle p-3 mb-2 rounded position-relative">
          <h2 class="card-title text-center">Detail Data</h2>
        </div>
        
        <!-- Nama PDC dengan Autocomplete -->
        <div class="mb-3 autocomplete-container">
          <label for="pdcNameInput" class="form-label"><strong>Nama PDC:</strong></label>
          <input type="text" class="form-control" id="pdcNameInput" value="${currentDetail.lokasi}" placeholder="Masukkan nama PDC..." readonly>
          <div class="suggestions-list" id="pdcSuggestions"></div>
        </div>
        
        <!-- Nama Mobil -->
        <div class="mb-3">
          <label for="mobilNameInput" class="form-label"><strong>Nama Mobil:</strong></label>
          <input type="text" class="form-control" id="mobilNameInput" value="${currentDetail.mobilName}" placeholder="Masukkan nama mobil..." readonly>
        </div>
        
        <!-- Keterangan -->
        <div class="mb-3">
          <label for="keteranganInput" class="form-label"><strong>Keterangan:</strong></label>
          <input class="form-control" id="keteranganInput" value="${currentDetail.describe}" placeholder="Masukkan keterangan...">
        </div>
        
        <!-- Keterangan -->
        <div class="mb-3">
          <label for="kodeGudangInput" class="form-label"><strong>Kode Gudang:</strong></label>
          <input class="form-control" id="kodeGudangInput" value="${currentDetail.codeGudang}" placeholder="Masukkan keterangan...">
        </div>

        <!-- Job Costing Type Dropdown -->
        <div class="mb-3">
          <label for="jobCostingSelect" class="form-label"><strong>Tipe Job Costing:</strong></label>
          <select class="form-control" id="jobCostingSelect" disabled>
            <option value="Job Costing" ${currentDetail.jobCostingType === 'Job Costing 1' ? 'selected' : ''}>Job Costing 1</option>
            <option value="set" ${currentDetail.jobCostingType === 'Job Costing 2' ? 'selected' : ''}>Job Costing 2</option>
          </select>
        </div>

        <!-- Batch Number -->
        <div class="mb-3">
          <label for="batchInput" class="form-label"><strong>Batch Number:</strong></label>
          <input type="text" class="form-control" id="batchInput" value="${currentDetail.batch}" placeholder="Masukkan batch number...">
        </div>
        
        <!-- Dynamic Content based on Job Costing Type -->
        <div id="dynamicJobCostingContent">
          ${renderJobCostingContentEditMode(currentDetail)}
        </div>
        
        <!-- Action Buttons -->
        <div class="d-flex justify-content-end gap-2 mt-4">
          <button class="btn btn-secondary" onclick="cancelForm()">Cancel</button>
          <button class="btn btn-primary" onclick="saveForm()">Save</button>
        </div>
      </div >
    </div >
    `;
}

// Fungsi untuk render konten job costing berdasarkan tipe
function renderJobCostingContent(currentDetail) {
  if (currentDetail.jobCostingType === 'Job Costing 1') {
    return `
    <div id="productPairContainer">
      < !--Placeholder untuk product pairs yang akan diisi nanti-- >
    </div>
    `;
  } else {
    // Job Costing 2 - Multiple product codes with drag functionality
    // Untuk Job Costing 2, kita juga buat kosong dulu
    return `
    <div div class="job-costing-2" >
        <label class="form-label"><strong>Kode Produk:</strong></label>
        <div id="codeEditContainer" class="mb-3">
          <!-- Placeholder untuk code edits yang akan diisi nanti -->
        </div>
      </div >
    `;
  }
}

// Fungsi untuk render konten job costing berdasarkan tipe
function renderJobCostingContentEditMode(currentDetail) {

  if (currentDetail.jobCostingType === 'Job Costing 1') {
    return `
    <div id="productPairContainer">
      <!--Placeholder untuk product pairs yang akan diisi nanti -->
    </div>

    <!-- Tombol tambah -->
    <button
      class="btn btn-outline-success w-100 mb-3 d-flex align-items-center justify-content-center gap-2" type="button" onclick="addNewProductPair()">
      <i class="bi bi-plus-square-fill"> </i> Tambah Pasangan Produk
    </button>
  `;
  } else {
    // Job Costing 2 - Multiple product codes with drag functionality
    // Untuk Job Costing 2, kita juga buat kosong dulu
    return `
    <div div class="job-costing-2" >
        <label class="form-label"><strong>Kode Produk:</strong></label>
        <div id="codeEditContainer" class="mb-3">
          <!-- Placeholder untuk code edits yang akan diisi nanti -->
        </div>
        <button class="btn btn-outline-success w-100 mb-3 d-flex align-items-center justify-content-center gap-2" type="button" onclick="addNewCode()">
          <i class="bi bi-plus-square-fill"></i> Tambah Kode Produk
        </button>
      </div >
    `;
  }
}

// Fungsi untuk mengisi data code sesuai dengan tipe job costing
function populateCodeData(currentDetail) {


  if (currentDetail.jobCostingType === 'Job Costing 1') {
    // Job Costing 1 - populasi pasangan produk
    const productPairContainer = document.getElementById("productPairContainer");
    if (!productPairContainer) return;

    // Bersihkan container
    productPairContainer.innerHTML = '';

    // Jika codeData ada dan memiliki beberapa properti
    if (currentDetail.codeData && typeof currentDetail.codeData === 'object') {
      let idx = 0;

      // Loop melalui semua properti codeData
      for (const [key, value] of Object.entries(currentDetail.codeData)) {
        idx++;

        // Buat row baru untuk setiap pasangan key-value
        const newRow = document.createElement('div');
        newRow.className = 'row d-flex justify-content-center mt-3 product-pair-row';
        newRow.setAttribute('data-idx', idx);

        if (editMode) {
          // EDIT MODE (form input + tombol hapus)
          newRow.innerHTML = `
          <div class="col-md-6 col-11">
            <div class="job-costing-1">
              <div class="mb-3">
                <label for="descriptionInput${idx}" class="form-label">
                  <strong>Deskripsi Product:</strong>
                </label>
                <input
                  type="text"
                  class="form-control description-input"
                  id="descriptionInput${idx}"
                  value="${key}"
                  placeholder="Masukkan deskripsi produk..."
                />
              </div>
            </div>
          </div>
          <div class="col-md-5 col-11">
            <div class="job-costing-1">
              <div class="mb-3">
                <label for="productCodeInput${idx}" class="form-label">
                  <strong>Kode Produk:</strong>
                </label>
                <input
                  type="text"
                  class="form-control code-input"
                  id="productCodeInput${idx}"
                  value="${value}"
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
        } else {
          // VIEW MODE (readonly input + deskripsi + tombol copy)
          newRow.innerHTML = `
          <div class="col-md-6 col-11">
            <div class="job-costing-1">
              <label for="descriptionInput${idx}" class="form-label">
                <strong>Deskripsi Product:</strong>
              </label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control description-input"
                  id="descriptionInput${idx}"
                  value="${key}"
                  placeholder="Deskripsi produk"
                  readonly
                />
                <button class="btn btn-outline-info" type="button" onclick="copyText('${key}')" title="Copy Deskripsi">
                  <i class="bi bi-clipboard2"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-11">
            <div class="job-costing-1">
              <label for="productCodeInput${idx}" class="form-label">
                <strong>Kode Produk:</strong>
              </label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control code-input"
                  id="productCodeInput${idx}"
                  value="${value}"
                  placeholder="Kode produk"
                  readonly
                />
                <button class="btn btn-outline-info" type="button" onclick="copyText('${value}')" title="Copy Deskripsi">
                  <i class="bi bi-clipboard2"></i>
                </button>
              </div>
            </div>
          </div>
        `;
        }

        productPairContainer.appendChild(newRow);
      }

      // Jika tidak ada data, buat row kosong
      if (idx === 0) {
        addEmptyProductPair(productPairContainer);
      }
    } else {
      // Jika tidak ada codeData, tambahkan row kosong
      addEmptyProductPair(productPairContainer);
    }
  } else {
    // Job Costing 2 - populasi kode
    const codeEditContainer = document.getElementById("codeEditContainer");
    if (!codeEditContainer) return;

    // Bersihkan container
    codeEditContainer.innerHTML = '';

    // Jika codeData ada dan memiliki beberapa properti
    if (currentDetail.codeData && typeof currentDetail.codeData === 'object') {
      let idx = 0;

      // Loop melalui semua properti codeData
      for (const [key, value] of Object.entries(currentDetail.codeData)) {
        idx++;

        // Buat input baru untuk setiap pasangan key-value
        const newCodeEdit = document.createElement('div');
        newCodeEdit.className = 'input-group mb-2';
        newCodeEdit.setAttribute('data-idx', idx);

        newCodeEdit.innerHTML = `
    <span span class="input-group-text drag-handle" style = "cursor: grab;" >
      <i class="bi bi-grip-horizontal"></i>
          </span >
          <textarea class="form-control code-edit" rows="1" placeholder="Kode produk...">${value}</textarea>
          <button class="btn btn-outline-danger btn-sm remove-code-btn" type="button" title="Hapus kode" onclick="removeCode(this)">
            <i class="bi bi-x"></i>
          </button>
  `;

        codeEditContainer.appendChild(newCodeEdit);
      }

      // Jika tidak ada data, buat input kosong
      if (idx === 0) {
        addEmptyCodeEdits(codeEditContainer);
      }
    } else {
      // Jika tidak ada codeData, tambahkan input kosong
      addEmptyCodeEdits(codeEditContainer);
    }
  }
}

// Fungsi untuk menambahkan pasangan produk kosong
function addEmptyProductPair(container) {
  const newRow = document.createElement('div');
  newRow.className = 'row d-flex justify-content-center mt-3 product-pair-row';
  newRow.setAttribute('data-idx', '1');

  newRow.innerHTML = `
    <div div class="col-md-6 col-11" >
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
    </div >
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
  `;

  container.appendChild(newRow);
}

// Fungsi untuk menambahkan code edits kosong
function addEmptyCodeEdits(container) {
  // Tambahkan 4 input kosong
  for (let i = 0; i < 4; i++) {
    const newCodeEdit = document.createElement('div');
    newCodeEdit.className = 'input-group mb-2';
    newCodeEdit.setAttribute('data-idx', i + 1);

    newCodeEdit.innerHTML = `
    <span span class="input-group-text drag-handle" style = "cursor: grab;" >
      <i class="bi bi-grip-horizontal"></i>
      </span >
      <textarea class="form-control code-edit" rows="1" placeholder="Kode produk..."></textarea>
      <button class="btn btn-outline-danger btn-sm remove-code-btn" type="button" title="Hapus kode" onclick="removeCode(this)">
        <i class="bi bi-x"></i>
      </button>
  `;

    container.appendChild(newCodeEdit);
  }
}

// Fungsi untuk inisialisasi event listeners
function initializeEventListeners(currentDetail) {
  // Event listener untuk perubahan tipe job costing
  const jobCostingSelect = document.getElementById("jobCostingSelect");
  if (jobCostingSelect) {
    jobCostingSelect.addEventListener("change", function () {
      // Update currentDetail dengan tipe baru
      currentDetail.jobCostingType = this.value;

      // Re-render job costing content
      const dynamicContent = document.getElementById("dynamicJobCostingContent");
      if (dynamicContent) {
        dynamicContent.innerHTML = renderJobCostingContent(currentDetail);

        // Populasi ulang data
        populateCodeData(currentDetail);
      }
    });
  }
}

// Fungsi untuk menambah pasangan produk baru (untuk Job Costing 1)
function addNewProductPair() {
  const container = document.getElementById("productPairContainer");
  if (!container) return;

  // Cek apakah ada input yang masih kosong
  const descriptions = container.querySelectorAll('.description-input');
  const codes = container.querySelectorAll('.code-input');

  for (let i = 0; i < descriptions.length; i++) {
    if (descriptions[i].value.trim() === "" || codes[i].value.trim() === "") {
      showToast("Harap isi semua deskripsi dan kode produk sebelum menambahkan pasangan baru.", "warning");
      return;
    }
  }

  // Hitung jumlah row yang sudah ada
  const rows = container.querySelectorAll(".product-pair-row");
  const newIdx = rows.length + 1;

  // Buat row baru
  const newRow = document.createElement('div');
  newRow.className = 'row d-flex justify-content-center mt-3 product-pair-row';
  newRow.setAttribute('data-idx', newIdx);

  newRow.innerHTML = `
    <div div class="col-md-6 col-11" >
      <div class="job-costing-1">
        <div class="mb-3">
          <label for="descriptionInput${newIdx}" class="form-label">
            <strong>Deskripsi Product:</strong>
          </label>
          <input
            type="text"
            class="form-control description-input"
            id="descriptionInput${newIdx}"
            placeholder="Masukkan deskripsi produk..."
          />
        </div>
      </div>
    </div >
    <div class="col-md-5 col-11">
      <div class="job-costing-1">
        <div class="mb-3">
          <label for="productCodeInput${newIdx}" class="form-label">
            <strong>Kode Produk:</strong>
          </label>
          <input
            type="text"
            class="form-control code-input"
            id="productCodeInput${newIdx}"
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

// Fungsi untuk menghapus pasangan produk (untuk Job Costing 1)
function removeProductPair(button) {
  const row = button.closest('.product-pair-row');
  if (!row) return;

  // Jika ini adalah row terakhir, jangan hapus
  const container = document.getElementById("productPairContainer");
  if (container && container.querySelectorAll('.product-pair-row').length <= 1) {
    alert("Minimal harus ada satu pasangan produk!");
    return;
  }

  // Hapus row
  row.remove();

  // Re-index rows yang tersisa
  reindexProductPairs();
}

// Fungsi untuk mengindeks ulang semua pasangan produk
function reindexProductPairs() {
  const container = document.getElementById("productPairContainer");
  if (!container) return;

  const rows = container.querySelectorAll('.product-pair-row');
  rows.forEach((row, idx) => {
    const newIdx = idx + 1;

    // Update data-idx attribute
    row.setAttribute('data-idx', newIdx);

    // Update ID untuk input fields
    const descInput = row.querySelector('.description-input');
    if (descInput) {
      descInput.id = `descriptionInput${newIdx} `;
    }

    const codeInput = row.querySelector('.code-input');
    if (codeInput) {
      codeInput.id = `productCodeInput${newIdx} `;
    }
  });
}

// Fungsi untuk menambah kode produk baru (untuk Job Costing 2)
function addNewCode() {
  const container = document.getElementById("codeEditContainer");
  if (!container) return;

  const textareas = container.querySelectorAll('.code-edit');
  for (const textarea of textareas) {
    if (textarea.value.trim() === "") {
      showToast("Harap isi semua kode produk sebelum menambahkan yang baru.", "warning");
      return;
    }
  }

  // Hitung jumlah input yang sudah ada
  const inputs = container.querySelectorAll('.input-group');
  const newIdx = inputs.length + 1;

  // Buat input baru
  const newCodeEdit = document.createElement('div');
  newCodeEdit.className = 'input-group mb-2';
  newCodeEdit.setAttribute('data-idx', newIdx);

  newCodeEdit.innerHTML = `
    <span span class="input-group-text drag-handle" style = "cursor: grab;" >
      <i class="bi bi-grip-horizontal"></i>
    </span >
    <textarea class="form-control code-edit" rows="1" placeholder="Kode produk..."></textarea>
    <button class="btn btn-outline-danger btn-sm remove-code-btn" type="button" title="Hapus kode" onclick="removeCode(this)">
      <i class="bi bi-x"></i>
    </button>
  `;

  container.appendChild(newCodeEdit);
}

// Fungsi untuk menghapus kode produk (untuk Job Costing 2)
function removeCode(button) {
  const inputGroup = button.closest('.input-group');
  if (!inputGroup) return;

  // Hapus input group
  inputGroup.remove();

  // Re-index input groups yang tersisa
  reindexCodeEdits();
}

// Fungsi untuk mengindeks ulang semua code edits
function reindexCodeEdits() {
  const container = document.getElementById("codeEditContainer");
  if (!container) return;

  const inputs = container.querySelectorAll('.input-group');
  inputs.forEach((input, idx) => {
    input.setAttribute('data-idx', idx + 1);
  });
}

function saveForm() {
  // Ambil semua nilai form
  const pdcName = document.getElementById("pdcNameInput").value;
  const mobilName = document.getElementById("mobilNameInput").value;
  const kodeGudang = document.getElementById("kodeGudangInput").value;
  const keterangan = document.getElementById("keteranganInput").value;
  const jobCostingType = document.getElementById("jobCostingSelect").value;
  const batchNumber = document.getElementById("batchInput").value;

  // Validasi input dasar
  if (!pdcName || !mobilName || !batchNumber) {
    alert("Nama PDC, Nama Mobil, dan Batch Number harus diisi!");
    return;
  }

  // Konfirmasi simpan
  const confirmSwitch = confirm("Apakah Anda yakin ingin menyimpan perubahan?");
  if (!confirmSwitch) return;

  // Kumpulkan data code
  const codeData = {};
  if (jobCostingType === 'Job Costing') {
    const productPairs = document.querySelectorAll('.product-pair-row');
    productPairs.forEach(row => {
      const description = row.querySelector('.description-input').value;
      const code = row.querySelector('.code-input').value;
      if (description && code) {
        codeData[description] = code;
      }
    });
  } else {
    const codeEdits = document.querySelectorAll('.code-edit');
    codeEdits.forEach((textarea, idx) => {
      const codeText = textarea.value;
      if (codeText) {
        const match = codeText.match(/^(.+?)\s*:\s*(.+)$/);
        if (match) {
          codeData[match[1]] = match[2];
        } else {
          codeData[`item${idx + 1}`] = codeText;
        }
      }
    });
  }

  const rootCollection = jobCostingType === 'Job Costing' ? "Job Costing 1" : "Job Costing 2"

  // Encode codeData sebagai JSON string, lalu encodeURIComponent agar bisa dikirim di URL
  const encodedCodeData = encodeURIComponent(JSON.stringify(codeData));

  // Susun URL tujuan
  const saveUrl = `save.html?pdcName=${encodeURIComponent(pdcName)}&vehicles=${encodeURIComponent(mobilName)}&batch=${encodeURIComponent(batchNumber)}&gudangCode=${encodeURIComponent(kodeGudang)}&describe=${encodeURIComponent(keterangan)}&root=${encodeURIComponent(rootCollection)}&data=${encodedCodeData}&mode=edit`;

  // Arahkan ke halaman save.html
  window.location.href = saveUrl;
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


function copyText(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast("Copied to clipboard!"))
    .catch(() => showToast("Failed to copy!", "error"));
}

// Toast tampil dan hilang otomatis
function showToast(message, type = 'success') {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  // Bersihkan kelas warna sebelumnya
  toast.classList.remove("text-bg-success", "text-bg-danger", "text-bg-warning", "text-bg-info", "text-bg-primary");

  // Tambahkan class sesuai tipe
  switch (type) {
    case "success":
      toast.classList.add("text-bg-success");
      break;
    case "error":
      toast.classList.add("text-bg-danger");
      break;
    case "warning":
      toast.classList.add("text-bg-warning");
      break;
    case "info":
      toast.classList.add("text-bg-info");
      break;
    default:
      toast.classList.add("text-bg-primary");
  }

  toastMessage.textContent = message;
  toast.style.display = "flex";

  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

function toggleEdit() {
  editMode = !editMode
  initializeDetailPage()
}

function cancelForm() {
  const confirmSwitch = confirm("Apakah Anda yakin ingin membatalkan?");
  if (!confirmSwitch) return;
  editMode = !editMode;
  initializeDetailPage()
}


// Jalankan inisialisasi halaman setelah DOM selesai dimuat
document.addEventListener("DOMContentLoaded", initializeDetailPage);