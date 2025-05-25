import { getAllJobCostingData } from '../firebase/firebase_setup.js';

/**
 * Job Costing Card Handler
 * Mengelola interaksi dengan kartu job costing
 */
class JobCostingCardHandler {
  constructor() {
    this.cardConfig = {
      0: { type: 'excel', collection: 'Job Costing 1', code: 'JC1', name: 'Excel Job Costing 1' },
      1: { type: 'excel', collection: 'Job Costing 2', code: 'JC2', name: 'Excel Job Costing 2' },
      2: { type: 'const', collection: 'Job Costing 1', code: 'JC1', name: 'Const Job Costing 1' },
      3: { type: 'const', collection: 'Job Costing 2', code: 'JC2', name: 'Const Job Costing 2' }
    };

    this.loadingModalId = 'loadingModal';
    this.clickFeedbackClass = 'card-clicked';
    this.clickFeedbackDuration = 200;

    this.init();
  }

  /**
   * Inisialisasi event listeners
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  /**
   * Setup event listeners untuk semua hover cards
   */
  setupEventListeners() {
    const hoverCards = document.querySelectorAll('.hover-card');

    if (hoverCards.length === 0) {
      console.warn('Tidak ada elemen dengan class .hover-card ditemukan');
      return;
    }

    hoverCards.forEach((card, index) => {
      this.setupCardEventListener(card, index);
    });
  }

  /**
   * Setup event listener untuk single card
   * @param {HTMLElement} card - Elemen card
   * @param {number} index - Index card
   */
  setupCardEventListener(card, index) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.handleCardClick(card, index);
    });
  }

  /**
   * Handler utama untuk card click
   * @param {HTMLElement} card - Elemen card yang diklik
   * @param {number} index - Index card
   */
  async handleCardClick(card, index) {
    try {
      const config = this.cardConfig[index];
      if (!config) {
        console.warn(`Konfigurasi untuk card index ${index} tidak ditemukan`);
        return;
      }

      this.openModal(this.loadingModalId);
      this.addClickFeedback(card);

      // Menggunakan helper function untuk load dan parse data
      const parsedData = await this.loadJobCostingData(config.collection, config.code);

      await this.processData(parsedData, config);

    } catch (error) {
      console.error(`Error handling card click for index ${index}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Load dan parse job costing data menggunakan helper function
   * @param {string} collectionName - Nama collection (Job Costing 1/2)
   * @param {string} structureType - Tipe struktur (JC1/JC2)
   * @returns {Promise<Array>} Parsed data
   */
  async loadJobCostingData(collectionName, structureType) {
    try {
      const rawData = await getAllJobCostingData(collectionName);

      const parsedData = rawData.map(doc => {
        if (structureType === "JC1") {
          return this.parseJobCosting1(doc);
        } else if (structureType === "JC2") {
          return this.parseJobCosting2(doc);
        } else {
          return doc; // fallback
        }
      });

      return parsedData;
    } catch (error) {
      console.error("Failed to load and parse job costing data:", error);
      return [];
    }
  }

  /**
   * Parse Job Costing 1 data (placeholder - akan diimplementasi nanti)
   * @param {Object} doc - Document dari Firebase
   * @returns {Array} Parsed data untuk JC1
   */
  parseJobCosting1(doc) {
    // TODO: Implementasi parsing untuk Job Costing 1
    // Sementara return doc apa adanya
    return doc;
  }

  /**
   * Parse Job Costing 2 data (placeholder - akan diimplementasi nanti)
   * @param {Object} doc - Document dari Firebase
   * @returns {Array} Parsed data untuk JC2
   */
  parseJobCosting2(doc) {
    // TODO: Implementasi parsing untuk Job Costing 2
    // Sementara return doc apa adanya
    return doc;
  }

  /**
   * Proses data berdasarkan tipe card
   * @param {Array} parsedData - Data yang sudah diparsing
   * @param {Object} config - Konfigurasi card
   */
  async processData(parsedData, config) {
    switch (config.type) {
      case 'excel':
        return this.processExcelData(parsedData, config);
      case 'const':
        return this.processConstData(parsedData, config);
      default:
        console.warn(`Tipe ${config.type} tidak dikenali`);
    }
  }

  /**
   * Proses data untuk tipe Excel - Convert ke format Excel
   * @param {Array} parsedData - Data yang sudah diparsing
   * @param {Object} config - Konfigurasi card
   */
  processExcelData(parsedData, config) {
    try {
      let excelData = [];

      if (config.code === 'JC1') {
        excelData = this.transformJC1ToExcel(parsedData);
      } else if (config.code === 'JC2') {
        excelData = this.transformJC2ToExcel(parsedData);
      }

      // Generate Excel file
      this.generateExcelFile(excelData, config.name);
    } catch (error) {
      console.error(`Error processing Excel data:`, error);
    } finally {
      this.closeModal(this.loadingModalId);
    }
  }

  /**
   * Transform Job Costing 2 parsed data ke format Excel
   * @param {Array} parsedData - Data JC2 yang sudah diparsing
   * @returns {Array} Data dalam format Excel
   */
  transformJC1ToExcel(parsedData) {
    const excelRows = [];

    const headers = ['PDC', 'Mobil', "Jenis KF", "Rules", "Tanggal", ...Array.from({ length: 31 }, (_, i) => (i + 1).toString()), 'Total'];
    excelRows.push(headers);

    parsedData.forEach(itemPDC => {
      // Pastikan itemPDC, itemPDC.id ada, dan itemPDC.vehicle adalah array
      if (itemPDC && itemPDC.id && Array.isArray(itemPDC.vehicles)) {
        const pdcName = itemPDC.id; // Ini adalah valuepdcX

        itemPDC.vehicles.forEach(itemVehicle => {
          // Pastikan itemVehicle, itemVehicle.id ada, dan itemVehicle.productData adalah objek
          if (itemVehicle && itemVehicle.id && typeof itemVehicle.productData === 'object' && itemVehicle.productData !== null) {
            const vehicleName = itemVehicle.id; // Ini adalah valuevehicleX

            // Iterasi melalui setiap key di dalam productData
            Object.keys(itemVehicle.productData).forEach(productKey => {
              // Untuk setiap productKey (misal: key1, key2)
              // Buat baris untuk "Pemasangan (satuan kaca)"
              const pemasanganRow = [
                pdcName,
                vehicleName,
                productKey,     // Kolom "Jenis KF" diisi dengan key dari productData
                '',             // Kolom "Rules" kosongkan
                'Pemasangan (satuan kaca)', // Kolom "Tanggal" diisi dengan deskripsi
                ...Array(31).fill(''), // Kolom hari 1-31 dikosongkan
                ''              // Kolom "Total" dikosongkan
              ];
              excelRows.push(pemasanganRow);

              // Buat baris untuk "NG Line (satuan kaca)"
              const ngLineRow = [
                pdcName,
                vehicleName,
                productKey,     // Kolom "Jenis KF" diisi dengan key dari productData
                '',             // Kolom "Rules" kosongkan
                'NG Line (satuan kaca)', // Kolom "Tanggal" diisi dengan deskripsi
                ...Array(31).fill(''), // Kolom hari 1-31 dikosongkan
                ''              // Kolom "Total" dikosongkan
              ];
              excelRows.push(ngLineRow);
            });
          }
        });
      }
    });
    return excelRows;
  }

  /**
   * Transform Job Costing 2 parsed data ke format Excel
   * @param {Array} parsedData - Data JC2 yang sudah diparsing
   * @returns {Array} Data dalam format Excel
   */
  transformJC2ToExcel(parsedData) {
    const excelRows = [];

    // Header row untuk JC2
    const headers = ['PDC', 'Mobil/Tanggal', ...Array.from({ length: 31 }, (_, i) => (i + 1).toString()), 'Total'];
    excelRows.push(headers);

    // Iterasi melalui setiap item PDC dalam parsedData
    parsedData.forEach(itemPDC => {
      // Pastikan itemPDC dan itemPDC.id ada, serta itemPDC.vehicle adalah array
      if (itemPDC && itemPDC.id && Array.isArray(itemPDC.vehicles)) {
        const pdcName = itemPDC.id;

        // Iterasi melalui setiap kendaraan dalam array vehicle untuk PDC saat ini
        itemPDC.vehicles.forEach(itemVehicle => {
          // Pastikan itemVehicle dan itemVehicle.id ada
          if (itemVehicle && itemVehicle.id) {
            const vehicleName = itemVehicle.id;

            // Buat baris dengan kolom tanggal 1-31 kosong dan total
            const row = [
              pdcName,
              vehicleName,
              ...Array(31).fill(''),
              '' // Total juga kosong
            ];

            excelRows.push(row);
          }
        });
      }
    });

    return excelRows;
  }

  /**
   * Proses data untuk tipe Const - Generate TypeScript constants
   * @param {Array} parsedData - Data yang sudah diparsing
   * @param {Object} config - Konfigurasi card
   */
  processConstData(parsedData, config) {
    try {
      let tsContent = '';
      let fileName = '';

      if (config.code === 'JC1') {
        tsContent = this.generateJC1TS(parsedData);
        fileName = 'productCodesJC1.ts';
      } else if (config.code === 'JC2') {
        tsContent = this.generateJC2TS(parsedData);
        fileName = 'productbatchNumbersJC2.ts';
      }

      this.downloadTSFile(tsContent, fileName);
    } catch (error) {
      console.error(`Error processing Const data:`, error);
    } finally {
      this.closeModal(this.loadingModalId);
    }
  }

  /**
 * Generate TypeScript constant untuk Job Costing 2
 * @param {Array} parsedData - Data JC2 yang sudah diparsing
 * @returns {string} TypeScript content
 */
  generateJC1TS(parsedData) {
    let tsContent = 'export const productbatchNumbersJC2 = {\n';

    // Flatten parsedData dan group by PDC
    const pdcGroups = {};

    parsedData.flat().forEach(item => {
      if (item && item.id) {
        const pdcName = this.formatPDCName(item.id);

        if (!pdcGroups[pdcName]) {
          pdcGroups[pdcName] = {
            batchNumber: item.batchNumber || 'set',
            warehouseCode: item.warehouseCode || 'warehousecode',
            vehicles: []
          };
        }

        if (item.vehicles) {
          const vehicleNames = Array.isArray(item.vehicles) ? item.vehicles : [item.vehicles];

          vehicleNames.forEach(vehicleName => {
            let productCodeData;

            if (typeof vehicleName.productData === 'object' && vehicleName.productData !== null) {
              productCodeData = JSON.stringify(vehicleName.productData);
            } else {
              productCodeData = '{}';
            }

            pdcGroups[pdcName].vehicles.push({
              name: vehicleName.id,
              code: productCodeData
            });
          });
        }
      }
    });

    // Generate TypeScript content
    Object.entries(pdcGroups).forEach(([pdcName, pdcData]) => {
      tsContent += `  "${pdcName}": {\n`;
      tsContent += `    batchNumber: "${pdcData.batchNumber}",\n`;
      tsContent += `    warehouseCode: "${pdcData.warehouseCode}",\n`;

      pdcData.vehicles.forEach(vehicle => {
        tsContent += `    "${vehicle.name}": \n`;
        tsContent += vehicle.code
        tsContent += `,\n`;
      });

      tsContent += `  },\n`;
    });

    tsContent += '} as const;\n';
    return tsContent;
  }

  /**
   * Generate TypeScript constant untuk Job Costing 2
   * @param {Array} parsedData - Data JC2 yang sudah diparsing
   * @returns {string} TypeScript content
   */
  generateJC2TS(parsedData) {
    let tsContent = 'export const productbatchNumbersJC2 = {\n';

    // Flatten parsedData dan group by PDC
    const pdcGroups = {};

    parsedData.flat().forEach(item => {
      if (item && item.id) {
        const pdcName = this.formatPDCName(item.id);

        if (!pdcGroups[pdcName]) {
          pdcGroups[pdcName] = {
            batchNumber: item.batchNumber || 'set',
            warehouseCode: item.warehouseCode || 'warehousecode',
            vehicles: []
          };
        }

        if (item.vehicles) {
          const vehicleNames = Array.isArray(item.vehicles) ? item.vehicles : [item.vehicles];

          vehicleNames.forEach(vehicleName => {
            pdcGroups[pdcName].vehicles.push({
              name: vehicleName.id,
              describe: vehicleName.describe,
              code: Array.isArray(vehicleName.code) ? vehicleName.code : ['-', '-', '-']
            });
          });
        }
      }
    });

    // Generate TypeScript content
    Object.entries(pdcGroups).forEach(([pdcName, pdcData]) => {
      tsContent += `  "${pdcName}": {\n`;
      tsContent += `    batchNumber: "${pdcData.batchNumber}",\n`;
      tsContent += `    warehouseCode: "${pdcData.warehouseCode}",\n`;

      pdcData.vehicles.forEach(vehicle => {
        tsContent += `    "${vehicle.name}": {\n`;
        tsContent += `      describe: "${vehicle.describe}",\n`;
        tsContent += `      code: [\n`;

        vehicle.code.forEach(code => {
          tsContent += `        "${code}",\n`;
        });

        tsContent += `      ],\n`;
        tsContent += `    },\n`;
      });

      tsContent += `  },\n`;
    });

    tsContent += '} as const;\n';
    return tsContent;
  }

  /**
   * Format nama PDC untuk konsistensi
   * @param {string} pdcId - ID PDC dari Firebase
   * @returns {string} Formatted PDC name
   */
  formatPDCName(pdcId) {
    if (!pdcId) return 'Unknown PDC';

    // Mapping untuk nama PDC yang konsisten
    const pdcMapping = {
      'PDC HASRAD': 'PDC Toyota Sunter',
      'TOYOTA CIBITUNG MARUNDA': 'TOYOTA SUNTER MARUNDA',
      'PDC TYT CIBITUNG': 'TOYOTA CIBITUNG',
      'DAIHATSU SUNTER': 'DAIHATSU SUNTER',
      'LEXUS': 'LEXUS'
    };

    return pdcMapping[pdcId] || pdcId;
  }

  /**
   * Generate Excel file dari data
   * @param {Array} data - Data dalam format array 2D
   * @param {string} fileName - Nama file
   */
  generateExcelFile(data, fileName) {
    try {
      // Buat worksheet dari array of array (data)
      const worksheet = XLSX.utils.aoa_to_sheet(data);

      // Buat workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Generate file Excel (XLSX)
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Buat blob dan download
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.xlsx`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
  }

  /**
   * Download TypeScript file
   * @param {string} content - TypeScript content
   * @param {string} fileName - File name
   */
  downloadTSFile(content, fileName) {
    try {
      const blob = new Blob([content], { type: 'text/typescript;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error('Error downloading TypeScript file:', error);
    }
  }

  /**
   * Tambah visual feedback saat card diklik
   * @param {HTMLElement} card - Elemen card
   */
  addClickFeedback(card) {
    if (!card || !card.classList) {
      console.warn('Elemen card tidak valid untuk feedback');
      return;
    }

    card.classList.add(this.clickFeedbackClass);
    setTimeout(() => {
      card.classList.remove(this.clickFeedbackClass);
    }, this.clickFeedbackDuration);
  }

  /**
   * Buka modal
   * @param {string} modalId - ID modal
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);

    if (!modal) {
      console.warn(`Modal dengan ID ${modalId} tidak ditemukan`);
      return;
    }

    if (window.bootstrap && bootstrap.Modal) {
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    } else {
      modal.style.display = 'block';
      modal.classList.add('show');
    }
  }

  /**
   * Handle error umum
   * @param {Error} error - Error object
   */
  handleError(error) {
    console.error('Job Costing Handler Error:', error);
    this.closeModal(this.loadingModalId);
  }

  /**
   * Tutup modal
   * @param {string} modalId - ID modal
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);

    if (!modal) return;

    if (window.bootstrap && bootstrap.Modal) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      }
    } else {
      modal.style.display = 'none';
      modal.classList.remove('show');
    }
  }

  /**
   * Tambah konfigurasi card baru
   * @param {number} index - Index card
   * @param {Object} config - Konfigurasi card
   */
  addCardConfig(index, config) {
    this.cardConfig[index] = config;
  }

  /**
   * Update konfigurasi card
   * @param {number} index - Index card
   * @param {Object} updates - Update konfigurasi
   */
  updateCardConfig(index, updates) {
    if (this.cardConfig[index]) {
      this.cardConfig[index] = { ...this.cardConfig[index], ...updates };
    }
  }
}

// Inisialisasi handler saat script dimuat
const jobCostingHandler = new JobCostingCardHandler();

// Export untuk penggunaan di tempat lain jika diperlukan
export default JobCostingCardHandler;

document.addEventListener("DOMContentLoaded", function () {
  jobCostingHandler;
});