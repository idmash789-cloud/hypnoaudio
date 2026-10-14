# Cara Menambah Backsound (Suara Latar)

Aplikasi HypnoKids sudah punya 5 backsound bawaan (Hujan Lembut, Ombak Laut,
Angin Malam, Nada Tenang, Malam Desa) yang dibangkitkan langsung oleh aplikasi
— tanpa file. Pengguna juga bisa memakai file audio dari HP/komputernya sendiri
lewat tombol "Pakai backsound dari HP/komputer saya".

Kalau ingin backsound tertentu **selalu tersedia di dalam aplikasi** untuk
semua pengguna, tambahkan sebagai file:

1. Upload file MP3 backsound ke folder `backsound/` ini
   (usahakan yang bisa diputar berulang/loop dengan mulus, durasi 1–10 menit cukup,
   ukuran di bawah 20 MB per file).
2. Daftarkan file itu di `backsound/manifest.json`, contoh:

```json
{
  "backsounds": [
    { "name": "Hujan di Atap Seng", "file": "backsound/hujan-atap.mp3" },
    { "name": "Musik Piano Tidur", "file": "backsound/piano-tidur.mp3" }
  ]
}
```

3. Commit / simpan. Backsound akan otomatis muncul sebagai pilihan di aplikasi
   (grup "File backsound di aplikasi") tanpa perlu mengubah kode.

Tips: pilih backsound tanpa lirik dan tanpa perubahan volume mendadak, supaya
tidak menutupi suara narasi utama. Volume backsound bisa diatur terpisah oleh
pengguna di aplikasi.
