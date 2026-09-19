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

Frontend mengirim request langsung dari browser ke:
`https://pwabuilder-cloudapk.azurewebsites.net/generateAppPackage`

Endpoint tersebut merupakan layanan packaging Android CloudAPK yang digunakan oleh PWABuilder. Jika endpoint publik tersebut berubah atau CORS-nya dinonaktifkan, UI tetap dapat di-host, tetapi endpoint build perlu diperbarui.

Field logo otomatis memakai favicon. Untuk hasil paling konsisten, upload PNG logo sendiri. Website tujuan harus publik dan dapat diakses oleh layanan packaging.

## Pengembangan lokal
```bash
npm install -g vercel
vercel dev
```

## Lisensi
Project ini adalah wrapper/UI sederhana. Layanan packaging eksternal memiliki ketentuan dan lisensinya sendiri.
