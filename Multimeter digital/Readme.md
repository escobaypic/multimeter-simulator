Virtual Electrical Measurement Laboratory
SMK Cokroaminoto 2 Banjarnegara

pembelajaran lengkap mengenai cara menggunakan multimeter analog beserta bagian-bagian dan fungsinya:
Antarmuka dan Bagian-Bagian Multimeter Analog  Sebelum melakukan pengukuran, penting untuk mengenali komponen-komponen utamanya:
Skala Multimeter (Multimeter Scale): Garis-garis angka di bagian layar yang menunjukkan nilai pengukuran.
Jarum Penunjuk (Needle/Pointer): Jarum bergerak yang berfungsi menunjukkan hasil pengukuran pada skala.
Sekrup Kalibrasi (Calibrating Knob): Sekrup untuk mengatur posisi jarum agar tepat berada di angka nol sebelah kiri sebelum mengukur tegangan atau arus.
Pengatur Nol Ohm (Zero Ohm Adjuster): Tombol putar untuk mengalibrasi jarum tepat di angka nol sebelah kanan khusus saat mengukur hambatan (Ohm).
Sakelar Selektor (Selection Area): Area putar untuk memilih jenis pengukuran dan batas ukur yang diinginkan.
Port Koneksi & Probe: Tempat mencolokkan kabel probe merah (positif) dan hitam (negatif/Common).
Cara Mengukur Arus DC (DC Current) 
Hubungkan kabel hitam ke port Common dan kabel merah ke port positif.
Putar selektor ke area arus DC (misal batas ukur 250 mA)
Pastikan jarum berada tepat di angka nol sebelah kiri; jika tidak, putar sekrup kalibrasi menggunakan obeng
Hubungkan multimeter secara seri dengan rangkaian listrik (menghubungkan beban seperti LED ke sumber daya) 
Baca hasilnya pada deret skala yang sesuai dengan batas ukur yang Anda pilih sebelumnya 
Cara Mengukur Tegangan DC (DC Voltage)
Putar selektor ke bagian DC Voltage (DCV)
Pilih batas ukur yang lebih tinggi dari perkiraan tegangan baterai. Jika Anda tidak mengetahui tegangannya, pilih batas maksimum terlebih dahulu kemudian turunkan secara bertahap
Pastikan posisi jarum dikalibrasi di angka nol sebelum mengukur
Hubungkan probe secara paralel ke kutub baterai (merah ke kutub positif, hitam ke kutub negatif) 
Lihat pergerakan jarum dan bacalah baris angka skala yang sesuai dengan batas ukur yang dipilih 
Cara Mengukur Tegangan AC (AC Voltage)
Putar selektor ke area AC Voltage (ACV) dan pilih batas ukur yang aman (contoh: pilih range 250V untuk mengukur listrik rumah tangga)
Kalibrasi jarum penunjuk agar berada tepat di posisi angka nol sebelah kiri
Masukkan kedua probe langsung ke lubang stop kontak listrik AC
Perhatikan pergerakan jarum dan baca angka pada skala 250 (dalam animasi menunjukkan nilai sekitar 225 Volt) 
Cara Mengukur Hambatan / Resistansi (Resistance)
Hubungkan probe merah ke port Ohmik (\Omega) dan probe hitam ke port Common .
Pilih faktor pengali batas ukur pada area selektor Ohm (misal: x10 atau x100) 
Kalibrasi Nol Ohm: Sentuhkan/tempelkan ujung probe merah dan probe hitam secara langsung, lalu putar tombol Zero Ohm Adjuster hingga jarum menunjuk tepat ke angka 0 di ujung sebelah kanan skala 
Setelah dikalibrasi, tempelkan kedua probe ke masing-masing ujung kaki komponen resistor 
Rumus Hasil: Kalikan angka yang ditunjuk oleh jarum dengan faktor pengali selektor yang Anda pilih (contoh: jika jarum menunjuk angka 5 dan pengali adalah x100, maka nilainya adalah 500 Ohm) 
Cara Mengecek Kontinuitas (Continuity) [07:15] Fungsi ini digunakan untuk menguji apakah jalur listrik terhubung baik atau terputus (contoh pada sakelar lampu) 
Hubungkan probe ke port multimeter, lalu arahkan sakelar selektor ke simbol buzzer (suara)
Tempelkan probe merah dan hitam ke masing-masing terminal sakelar 
Pada posisi OFF, multimeter seharusnya tidak mengeluarkan suara, menandakan jalur terputus dengan benar 
Pada posisi ON, multimeter harus mengeluarkan suara alarm (beep), menandakan arus mengalir lancar dan sakelar berfungsi baik 
Buatkan saya aplikasi multimeter digital .html sesuai dengan tatacara penggunaan multimeter diatas. Buat secara detail dan fungsikan semua fitur multimeter digital.
buat struktur aplikasinya menjadi seperti di bawah ini:

├── index.html
├── dashboard.html
├── simulator/
│ ├── digital-multimeter.html
│ ├── analog-multimeter.html
│ └── practice.html
├── assets/
│ ├── css/
│ │ style.css
│ │ multimeter.css
│ ├── js/
│ │ app.js
│ │ multimeter.js
│ │ lcd.js
│ │ selector.js
│ │ probe.js
│ │ components.js
│ │ quiz.js
│ ├── audio/
│ ├── images/
│ └── fonts/
├── data/
│ components.json
│ questions.json
└── README.md