// Data storage using localStorage
const db = {
  getKelas: () => JSON.parse(localStorage.getItem('kelas') || '[]'),
  setKelas: (absensi) => localStorage.setItem('kelas', JSON.stringify(absensi)),
  getSiswa: () => JSON.parse(localStorage.getItem('siswa') || '[]'),
  setSiswa: (absensi) => localStorage.setItem('siswa', JSON.stringify(absensi)),
  getAbsensi: () => JSON.parse(localStorage.getItem('absensi') || '[]'),
  setAbsensi: (absensi) => localStorage.setItem('absensi', JSON.stringify(absensi)),
};

// NAVIGATION
const pages = ['Dashboard', 'Kelas', 'Siswa', 'Absensi', 'Rekap'];
pages.forEach(page => {
  document.getElementById('nav' + page)?.addEventListener('click', () => showPage(page));
});
function showPage(page) {
  pages.forEach(p => {
    document.getElementById('page' + p).classList.toggle('d-none', p !== page);
  });
  if (page === 'Dashboard') renderDashboard();
  if (page === 'Kelas') renderKelas();
  if (page === 'Siswa') renderSiswa();
  if (page === 'Absensi') renderAbsensi();
  if (page === 'Rekap') renderRekap();
}
showPage('Dashboard');

// DASHBOARD
function renderDashboard() {
  const absensi = db.getAbsensi();
  const hariIni = new Date().toISOString().slice(0, 10);
  const today = absensi.filter(a => a.tanggal === hariIni);
  const stat = ['Hadir', 'Izin', 'Sakit', 'Alpa'].map(status => ({
    status,
    jumlah: today.filter(a => a.status === status).length,
  }));
  document.getElementById('statistikAbsensi').innerHTML = `
    <div class="row">
      ${stat.map(s => `
        <div class="col-3">
          <div class="card bg-light mb-2"><div class="card-body">
            <strong>${s.jumlah}</strong><br>${s.status}
          </div></div>
        </div>
      `).join('')}
    </div>
  `;
}

// KELAS
function renderKelas() {
  const kelas = db.getKelas();
  const tabel = document.querySelector('#tabelKelas tbody');
  tabel.innerHTML = kelas.map((k, idx) => `
    <tr>
      <td>${k.nama}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="hapusKelas(${idx})">Hapus</button>
      </td>
    </tr>
  `).join('');
}
document.getElementById('formKelas').addEventListener('submit', function(e) {
  e.preventDefault();
  const nama = document.getElementById('inputNamaKelas').value.trim();
  if (nama) {
    const kelas = db.getKelas();
    if (!kelas.some(k => k.nama === nama)) { // Cegah duplikat
      kelas.push({ nama });
      db.setKelas(kelas);
      document.getElementById('inputNamaKelas').value = '';
      renderKelas();
    } else {
      alert('Nama kelas sudah ada!');
    }
  }
});
window.hapusKelas = function(idx) {
  const kelas = db.getKelas();
  const hapusNamaKelas = kelas[idx]?.nama;
  kelas.splice(idx, 1);
  db.setKelas(kelas);

  // Hapus siswa di kelas ini
  const siswa = db.getSiswa().filter(s => s.kelas !== hapusNamaKelas);
  db.setSiswa(siswa);

  // Hapus absensi siswa di kelas ini
  const absensi = db.getAbsensi().filter(a => a.kelas !== hapusNamaKelas);
  db.setAbsensi(absensi);

  renderKelas();
  // Refresh dropdown kelas di semua page yang butuh
  renderSiswa();
  renderAbsensi();
  renderRekap();
}

// SISWA
function renderSiswa() {
  const kelas = db.getKelas();
  const select = document.getElementById('selectKelasSiswa');
  select.innerHTML = kelas.map(k => `<option value="${k.nama}">${k.nama}</option>`).join('');
  if (kelas.length) select.value = kelas[0].nama;
  updateTabelSiswa();
}
document.getElementById('selectKelasSiswa').addEventListener('change', updateTabelSiswa);
function updateTabelSiswa() {
  const kelasDipilih = document.getElementById('selectKelasSiswa').value;
  const siswa = db.getSiswa().filter(s => s.kelas === kelasDipilih);
  const tabel = document.querySelector('#tabelSiswa tbody');
  tabel.innerHTML = siswa.map((s, idx) => `
    <tr>
      <td>${s.nama}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="hapusSiswa('${s.nama}', '${s.kelas}')">Hapus</button>
      </td>
    </tr>
  `).join('');
}
document.getElementById('formSiswa').addEventListener('submit', function(e) {
  e.preventDefault();
  const nama = document.getElementById('inputNamaSiswa').value.trim();
  const kelas = document.getElementById('selectKelasSiswa').value;
  if (nama && kelas) {
    const siswa = db.getSiswa();
    if (!siswa.some(s => s.nama === nama && s.kelas === kelas)) { // Cegah duplikat nama di kelas sama
      siswa.push({ nama, kelas });
      db.setSiswa(siswa);
      document.getElementById('inputNamaSiswa').value = '';
      updateTabelSiswa();
    } else {
      alert('Nama siswa sudah ada di kelas ini!');
    }
  }
});
window.hapusSiswa = function(nama, kelas) {
  const siswa = db.getSiswa().filter(s => !(s.nama === nama && s.kelas === kelas));
  db.setSiswa(siswa);

  // Hapus absensi siswa tersebut
  const absensi = db.getAbsensi().filter(a => !(a.nama === nama && a.kelas === kelas));
  db.setAbsensi(absensi);

  updateTabelSiswa();
  // Refresh tabel absensi dan rekap
  renderAbsensi();
  renderRekap();
}

// ABSENSI
function renderAbsensi() {
  const kelas = db.getKelas();
  const select = document.getElementById('selectKelasAbsensi');
  select.innerHTML = kelas.map(k => `<option value="${k.nama}">${k.nama}</option>`).join('');
  if (kelas.length) select.value = kelas[0].nama;
  document.getElementById('inputTanggalAbsensi').value = new Date().toISOString().slice(0, 10);
  updateTabelAbsensi();
}
document.getElementById('selectKelasAbsensi').addEventListener('change', updateTabelAbsensi);
document.getElementById('inputTanggalAbsensi').addEventListener('change', updateTabelAbsensi);
function updateTabelAbsensi() {
  const kelasDipilih = document.getElementById('selectKelasAbsensi').value;
  const tanggal = document.getElementById('inputTanggalAbsensi').value;
  const siswa = db.getSiswa().filter(s => s.kelas === kelasDipilih);
  const absensiData = db.getAbsensi().filter(a => a.kelas === kelasDipilih && a.tanggal === tanggal);
  const tabel = document.querySelector('#tabelAbsensi tbody');
  tabel.innerHTML = siswa.map(s => {
    const absen = absensiData.find(a => a.nama === s.nama);
    const status = absen ? absen.status : '';
    return `
      <tr>
        <td>${s.nama}</td>
        <td>
          <select class="form-select" name="status_${s.nama}">
            <option value="">- Pilih -</option>
            <option value="Hadir" ${status === 'Hadir' ? 'selected' : ''}>Hadir</option>
            <option value="Izin" ${status === 'Izin' ? 'selected' : ''}>Izin</option>
            <option value="Sakit" ${status === 'Sakit' ? 'selected' : ''}>Sakit</option>
            <option value="Alpa" ${status === 'Alpa' ? 'selected' : ''}>Alpa</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}
document.getElementById('formAbsensi').addEventListener('submit', function(e) {
  e.preventDefault();
  const kelasDipilih = document.getElementById('selectKelasAbsensi').value;
  const tanggal = document.getElementById('inputTanggalAbsensi').value;
  const siswa = db.getSiswa().filter(s => s.kelas === kelasDipilih);
  // Hapus absensi lama di kelas & tanggal ini (supaya update)
  let absensi = db.getAbsensi().filter(a => !(a.kelas === kelasDipilih && a.tanggal === tanggal));
  siswa.forEach(s => {
    const status = document.querySelector(`[name="status_${s.nama}"]`).value;
    if (status) absensi.push({ kelas: kelasDipilih, nama: s.nama, tanggal, status });
  });
  db.setAbsensi(absensi);
  alert('Absensi berhasil disimpan!');
  renderDashboard();
  renderRekap();
});

// REKAP & EKSPOR
function renderRekap() {
  const kelas = db.getKelas();
  const select = document.getElementById('selectKelasRekap');
  select.innerHTML = `<option value="">Semua Kelas</option>` + kelas.map(k => `<option value="${k.nama}">${k.nama}</option>`).join('');
  document.getElementById('inputTanggalRekap').value = '';
  updateTabelRekap();
}
document.getElementById('selectKelasRekap').addEventListener('change', updateTabelRekap);
document.getElementById('inputTanggalRekap').addEventListener('change', updateTabelRekap);
function updateTabelRekap() {
  const kelas = document.getElementById('selectKelasRekap').value;
  const tanggal = document.getElementById('inputTanggalRekap').value;
  let absensi = db.getAbsensi();
  if (kelas) absensi = absensi.filter(a => a.kelas === kelas);
  if (tanggal) absensi = absensi.filter(a => a.tanggal === tanggal);
  const tabel = document.querySelector('#tabelRekap tbody');
  tabel.innerHTML = absensi.map(a => `
    <tr>
      <td>${a.kelas}</td>
      <td>${a.nama}</td>
      <td>${a.tanggal}</td>
      <td>${a.status}</td>
    </tr>
  `).join('');
}

// OPTIONAL: panggil renderDropdownKelas() jika ingin update dropdown di tempat lain

// EKSPOR FORMAT KHUSUS: panggil eksporExcelRekap() jika ingin ekspor sesuai format rekap bulanan per kelas.

// Rekap & Ekspor
function renderRekap() {
  const kelas = db.getKelas();
  const select = document.getElementById('selectKelasRekap');
  select.innerHTML = `<option value="">Semua Kelas</option>` + kelas.map(k => `<option value="${k.nama}">${k.nama}</option>`).join('');
  document.getElementById('inputTanggalRekap').value = '';
  updateTabelRekap();
}
document.getElementById('selectKelasRekap').addEventListener('change', updateTabelRekap);
document.getElementById('inputTanggalRekap').addEventListener('change', updateTabelRekap);
function updateTabelRekap() {
  const kelas = document.getElementById('selectKelasRekap').value;
  const tanggal = document.getElementById('inputTanggalRekap').value;
  let absensi = db.getAbsensi();
  if (kelas) absensi = absensi.filter(a => a.kelas === kelas);
  if (tanggal) absensi = absensi.filter(a => a.tanggal === tanggal);
  const tabel = document.querySelector('#tabelRekap tbody');
  tabel.innerHTML = absensi.map(a => `
    <tr>
      <td>${a.kelas}</td>
      <td>${a.nama}</td>
      <td>${a.tanggal}</td>
      <td>${a.status}</td>
    </tr>
  `).join('');
}

function eksporExcelDashboard() {
  const absensi = db.getAbsensi();
  const hariIni = new Date().toISOString().slice(0, 10);
  const today = absensi.filter(a => a.tanggal === hariIni);
  if (!today.length) return alert('Belum ada data absensi hari ini!');
  eksporExcel(today, 'absensi_hari_ini.xlsx');
}

function eksporExcel(absensi, filename) {
  if (!absensi.length) return alert("Tidak ada data untuk diekspor!");
  const ws = XLSX.utils.json_to_sheet(absensi);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "absensi");
  XLSX.writeFile(wb, filename);
}

// Ekspor Excel
document.getElementById('btnEksporExcel')?.addEventListener('click', eksporExcelDashboard);
document.getElementById('btnEksporRekap')?.addEventListener('click', eksporExcelRekap);
function eksporExcelDashboard() {
  const absensi = db.getAbsensi();
  const hariIni = new Date().toISOString().slice(0, 10);
  const today = absensi.filter(a => a.tanggal === hariIni);
  if (!today.length) return alert('Belum ada data absensi hari ini!');
  eksporExcel(today, 'absensi.xlsx'); // GANTI NAMA FILE
}
function eksporExcelRekap() {
  const kelas = document.getElementById('selectKelasRekap').value;
  const tanggal = document.getElementById('inputTanggalRekap').value;
  let absensi = db.getAbsensi();
  if (kelas) absensi = absensi.filter(a => a.kelas === kelas);
  if (tanggal) absensi = absensi.filter(a => a.tanggal === tanggal);
  if (!absensi.length) return alert('Tidak ada data absensi sesuai filter!');
  eksporExcel(absensi, 'absensi.xlsx'); // GANTI NAMA FILE
}
function eksporExcelRekap() {
  const absensi = db.getAbsensi();
  const kelasList = db.getKelas().map(k => k.nama);
  if (!absensi.length) return alert('Tidak ada data absensi!');

  const wb = XLSX.utils.book_new();
  const bulanArr = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const statusArr = ["Hadir", "Izin", "Sakit", "Alpa"];

  kelasList.forEach(namaKelas => {
    const siswaKelas = db.getSiswa().filter(s => s.kelas === namaKelas);
    if (!siswaKelas.length) return;

    // Rekap absensi siswa per bulan dan status
    const siswaArr = siswaKelas.map(s => s.nama);
    const dataArr = [];

    // Header baris 1: Nama Siswa + merge setiap nama bulan 4 kolom
    const header1 = ["Nama Siswa"];
    bulanArr.forEach(b => header1.push(b, "", "", "")); // 4 kolom per bulan

    // Header baris 2: kolom bulan, di-merge 4 kolom
    const header2 = [""];
    bulanArr.forEach(() => header2.push(...Array(4).fill("")));

    // Header baris 3: status
    const header3 = [""];
    bulanArr.forEach(() => header3.push(...statusArr));

    dataArr.push(header1, header2, header3);

    // Baris data siswa
    siswaArr.forEach(namaSiswa => {
      const row = [namaSiswa];
      bulanArr.forEach((bulan, idxBulan) => {
        const bulanNum = (idxBulan + 1).toString().padStart(2, "0");
        const tahun = new Date().getFullYear().toString();
        // Filter absensi siswa di bulan ini
        const absenBulan = absensi.filter(a =>
          a.kelas === namaKelas &&
          a.nama === namaSiswa &&
          a.tanggal.startsWith(`${tahun}-${bulanNum}`)
        );
        statusArr.forEach(status => {
          const jumlah = absenBulan.filter(a => a.status === status).length;
          row.push(jumlah);
        });
      });
      dataArr.push(row);
    });

    // Buat worksheet
    const ws = XLSX.utils.aoa_to_sheet(dataArr);

    // Merge kolom dan baris
    // Merge "Nama Siswa" vertikal baris 1-3
    ws["!merges"] = [
      { s: { r:0, c:0 }, e:{ r:2, c:0 } }
    ];
    // Merge tiap bulan horizontal, baris 0, kolom ke-1 s/d ke-4, dst
    bulanArr.forEach((bulan, idx) => {
      const colStart = 1 + idx * 4;
      ws["!merges"].push({ s:{ r:0, c:colStart }, e:{ r:0, c:colStart+3 } });
      ws["!merges"].push({ s:{ r:1, c:colStart }, e:{ r:1, c:colStart+3 } });
    });

    // Label di header
    // Baris 1: Nama Bulan
    for (let i=0; i<bulanArr.length; i++) {
      ws[XLSX.utils.encode_cell({r:0, c:1+i*4})] = { t:"s", v:bulanArr[i] };
    }
    // Baris 3: Status Hadir/Izin/Sakit/Alpa
    for (let i=0; i<bulanArr.length; i++) {
      for (let j=0; j<statusArr.length; j++) {
        ws[XLSX.utils.encode_cell({r:2, c:1+i*4+j})] = { t:"s", v:statusArr[j] };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, namaKelas);
  });

  XLSX.writeFile(wb, 'absensi.xlsx');
}
// Shortcut dashboard
document.getElementById('btnMulaiAbsen').addEventListener('click', () => showPage('Absensi'));

// Refresh select kelas pada Siswa/Absensi/Rekap jika ada perubahan kelas
['navKelas', 'navSiswa', 'navAbsensi', 'navRekap'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => setTimeout(() => {
    if (id === 'navSiswa') renderSiswa();
    if (id === 'navAbsensi') renderAbsensi();
    if (id === 'navRekap') renderRekap();
  }, 100));
});
