# Web to APK Builder

Website ringan yang bisa di-host di **Vercel** atau platform static/serverless yang kompatibel.

## Fitur
- URL website — **wajib**
- Nama APK — kosong = ambil `<title>` website
- Logo APK — kosong = coba ambil favicon
- Package name — **wajib**
- Versi APK — kosong = `1.0.0`
- Validasi package name
- Preview logo
- Download hasil build sebagai ZIP yang berisi paket Android dari CloudAPK/PWABuilder

## Deploy ke Vercel
1. Upload folder ini ke repository GitHub.
2. Import repository tersebut di Vercel.
3. Tidak perlu environment variable.
4. Deploy.

## Catatan teknis
Build Android dilakukan oleh layanan CloudAPK/PWABuilder, bukan oleh runtime Vercel. Ini penting karena proses Gradle/Bubblewrap dapat berlangsung lebih lama daripada batas waktu serverless gratis.

Build APK sekarang dilewatkan melalui `/api/build` milik Vercel terlebih dahulu. Ini mencegah error browser `Failed to fetch` akibat CORS ketika browser mencoba mengakses CloudAPK secara langsung.

Vercel kemudian meneruskan request ke layanan Android packaging CloudAPK/PWABuilder. Layanan tersebut memang menyediakan endpoint `/generateAppPackage` untuk menghasilkan ZIP yang berisi paket Android.

Field logo otomatis memakai favicon. Untuk hasil paling konsisten, upload PNG logo sendiri. Website tujuan harus publik dan dapat diakses oleh layanan packaging.

## Pengembangan lokal
```bash
npm install -g vercel
vercel dev
```

## Lisensi
Project ini adalah wrapper/UI sederhana. Layanan packaging eksternal memiliki ketentuan dan lisensinya sendiri.


## Perbaikan versi ini
Versi ini memperbaiki `Failed to fetch` yang terjadi karena request CloudAPK sebelumnya dilakukan langsung dari browser (cross-origin). Sekarang browser hanya memanggil endpoint Vercel `/api/build`, lalu Vercel melakukan request server-to-server ke CloudAPK.


## Perbaikan Payload Too Large
Upload logo sekarang otomatis diperkecil menjadi maksimal sekitar 180 KB sebelum dikirim. Ini menghindari `413 Payload Too Large` dari Vercel/CloudAPK. Logo tetap dipakai sebagai icon APK.


### Aturan ukuran logo
- Jika lebar **dan** tinggi logo sudah `<= 512px`, file dipakai dalam ukuran aslinya.
- Jika salah satu dimensinya `> 512px`, logo otomatis di-resize secara proporsional sehingga sisi terpanjang menjadi `512px`.
- Rasio gambar dipertahankan.
- Transparansi logo dipertahankan saat proses resize dengan PNG.
