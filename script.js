// Ganti ini dengan URL Web App Anda!
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw3NxoZLO49JcVT0bg0qCLypLt1_IiK2PF8M4DHxkfgHxX2Em2OfzqLHaURiavRw9f3rg/exec';

// Fungsi simpan absensi (POST ke Apps Script)
document.getElementById('absenForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const kelas   = document.getElementById('kelas').value;
  const nama    = document.getElementById('nama').value;
  const tanggal = document.getElementById('tanggal').value;
  const status  = document.getElementById('status').value;

  fetch(WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify({kelas, nama, tanggal, status}),
    headers: {'Content-Type': 'application/json'}
  })
  .then(res => res.text())
  .then(res => {
    alert("Absensi berhasil disimpan!");
    document.getElementById('absenForm').reset();
    ambilAbsensiOnline();
  })
  .catch(err => alert("Gagal simpan: " + err));
});

// Fungsi ambil rekap absensi (GET dari Apps Script)
function ambilAbsensiOnline() {
  fetch(WEB_APP_URL)
    .then(res => res.json())
    .then(data => {
      let html = `<table class="table table-bordered"><thead>
        <tr>
          <th>Kelas</th>
          <th>Nama</th>
          <th>Tanggal</th>
          <th>Status</th>
        </tr>
      </thead><tbody>`;
      data.forEach(a => {
        html += `<tr>
          <td>${a.kelas}</td>
          <td>${a.nama}</td>
          <td>${a.tanggal}</td>
          <td>${a.status}</td>
        </tr>`;
      });
      html += '</tbody></table>';
      document.getElementById('rekapArea').innerHTML = html;
    })
    .catch(err => {
      document.getElementById('rekapArea').innerHTML = 'Gagal ambil data: ' + err;
    });
}

// Otomatis ambil data saat halaman dibuka
window.onload = ambilAbsensiOnline;