// ============================================================
// SCRIPT UNTUK DIMAS - Export MHI sebagai Tile Layer
// Jalankan di: https://code.earthengine.google.com/
// ============================================================

// ===== OPSI 1: Generate Tile URL (Paling Mudah) =====
// Ini akan menghasilkan URL tile yang bisa langsung dipakai di Leaflet

// Load image MHI (sesuaikan path asset dengan yang Dimas punya)
var mhi = ee.Image("projects/ee-dimassyarifworkspace/assets/MHI_JawaTimur_2024");
// ^ GANTI PATH INI sesuai asset MHI yang sudah ada di GEE Dimas

// Visualisasi parameter (sama seperti di app MHI)
var visParams = {
  min: 0,
  max: 100,
  palette: ['d7191c', 'f5c542', '1a9641'] // Merah → Kuning → Hijau
};

// Generate Map ID dan Tile URL
var mapId = mhi.getMapId(visParams);

// Print tile URL - COPY URL INI dan kirim ke Slamet
print('=== TILE URL UNTUK ID-MAP ===');
print('Copy URL di bawah ini:');
print(mapId.urlFormat);
// Output contoh: https://earthengine.googleapis.com/v1/projects/.../maps/.../tiles/{z}/{x}/{y}


// ===== OPSI 2: Publish sebagai Earth Engine App Tile (Lebih Stabil) =====
// Tile URL dari Opsi 1 expired setelah beberapa jam.
// Untuk URL permanen, gunakan cara ini:

// Buat fungsi untuk generate tile URL yang bisa di-refresh
var getTileUrl = function() {
  var mapId = mhi.getMapId(visParams);
  return mapId.urlFormat;
};

// Print untuk verifikasi
print('Tile URL (temporary, expired ~2 jam):');
print(getTileUrl());


// ===== OPSI 3: Export ke Google Cloud Storage sebagai Static Tiles =====
// Ini menghasilkan tile permanen yang tidak expired

// Definisikan area Jawa Timur
var jatim = ee.Geometry.Rectangle([110.5, -8.8, 114.8, -6.5]);

// Export sebagai static tiles ke Google Cloud Storage
// (Butuh GCS bucket yang sudah di-setup)
/*
Export.map.toCloudStorage({
  image: mhi.visualize(visParams),
  description: 'MHI_JawaTimur_Tiles',
  bucket: 'idmap-tiles',  // GANTI dengan nama bucket GCS Dimas
  region: jatim,
  minZoom: 8,
  maxZoom: 15,
  fileFormat: 'png'
});
*/


// ===== OPSI 4: Paling Simpel - Pakai ee.data.getMapId() via API =====
// Jika Dimas punya service account, bisa bikin endpoint API yang
// generate tile URL on-demand. Tapi ini lebih advanced.


// ============================================================
// INSTRUKSI UNTUK DIMAS:
// ============================================================
// 1. Buka https://code.earthengine.google.com/
// 2. Paste script ini
// 3. Ganti path asset MHI di baris 10 sesuai yang kamu punya
// 4. Klik Run
// 5. Copy URL yang muncul di Console
// 6. Kirim URL tersebut ke Slamet
//
// FORMAT URL YANG DIHARAPKAN:
// https://earthengine.googleapis.com/v1/projects/earthengine-legacy/maps/XXXXX/tiles/{z}/{x}/{y}
//
// CATATAN:
// - URL dari Opsi 1 expired setelah ~2 jam (untuk testing OK)
// - Untuk production, gunakan Opsi 3 (static tiles) atau
//   buat Cloud Function yang generate tile URL on-demand
// ============================================================


// ===== BONUS: Tampilkan di peta GEE untuk verifikasi =====
Map.centerObject(jatim, 9);
Map.addLayer(mhi, visParams, 'MHI Jawa Timur');
