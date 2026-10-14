# HypnoKids — Aplikasi Pemutar Audio Pengantar Tidur Anak

Aplikasi web (static, tanpa server/backend) untuk mendengarkan 10 audio
HypnoKids di folder `audio/`. Bisa dipasang di HP seperti aplikasi (PWA).

## Fitur

- **Daftar 10 audio** dengan pencarian, favorit ❤️, penanda progres
  ("Lanjut dari 3:25", "Selesai didengar"), dan unduh per audio
- **Kontrol pemutar lengkap**: putar/jeda, audio sebelum/berikutnya,
  mundur/maju 10 detik, geser posisi (seek bar)
- **Pengaturan kecepatan putar**: geser 0.50×–1.50× atau tombol cepat
  0.75× / 0.9× / 1× / 1.1× / 1.25× / 1.5×, plus opsi *pertahankan nada suara*
  agar suara tidak cempreng saat dipercepat
- **Volume suara utama** + tombol bisu
- **Timer tidur**: 5–60 menit atau "akhir audio", dengan *fade-out* lembut
  30 detik terakhir; audio (dan backsound) berhenti sendiri
- **Backsound (suara latar) yang bisa dipilih pengguna**:
  - 5 suara bawaan tanpa file: Hujan Lembut 🌧️, Ombak Laut 🌊, Angin Malam 🍃,
    Nada Tenang 🎹, Malam Desa 🦗
  - File backsound dari folder `backsound/` — lihat `backsound/README.md`
  - File dari HP/komputer pengguna sendiri (tombol upload)
  - Volume backsound diatur **terpisah** dari volume suara utama
- **Mode acak (shuffle)** & **ulangi** (mati / semua / satu audio)
- **Lanjut otomatis** ke audio berikutnya (bisa dimatikan)
- **Mengingat posisi terakhir** setiap audio, kecepatan, volume, dan favorit
  (tersimpan di perangkat pengguna)
- Kontrol dari lock screen / notifikasi HP (Media Session), pintasan keyboard
  (spasi, panah), dan bisa dipasang sebagai aplikasi (PWA)

## Cara Menjalankan Online (GitHub Pages)

1. Buka repo ini → **Settings → Pages**
2. Di "Build and deployment", pilih **Source: Deploy from a branch**,
   branch **main**, folder **/ (root)** → **Save**
3. Tunggu ±1 menit, aplikasi online di:
   **https://idmash789-cloud.github.io/hypnoaudio/**

Audio dibaca dari folder `audio/` di repo yang sama (jalur relatif), dengan
cadangan otomatis lewat raw GitHub & CDN jsDelivr bila jalur utama gagal.

## Menambah Audio Baru

Taruh file MP3 di folder `audio/`, lalu tambahkan satu baris pada daftar
`TRACKS` di `app.js` (nomor, judul, tema, nama file, emoji, warna) — atau
minta bantuan Muse untuk menambahkannya.

## Menambah Backsound Permanen

Lihat `backsound/README.md`.
