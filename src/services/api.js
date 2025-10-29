// src/services/api.js
import { supabase } from './supabaseClient'; // Impor klien Supabase kita

/**
 * Mengambil semua data awal (Mirip loadDataFromAPI)
 * Di React Native, biasanya ini dipisah per layar, tapi ini contoh gabungan
 */
export const loadInitialData = async () => {
  try {
    // Ganti 'nama_tabel' dengan nama tabel di Supabase Boss
    const [
      { data: kelasData, error: kelasError },
      { data: penggunaData, error: penggunaError },
      { data: materiData, error: materiError },
      // ... tambahkan fetch lain
    ] = await Promise.all([
      supabase.from('kelas').select('*'), // Ganti 'kelas'
      supabase.from('pengguna').select('*'), // Ganti 'pengguna'
      supabase.from('materi').select('*'), // Ganti 'materi'
      // ...
    ]);

    // Cek jika ada error di salah satu fetch
    if (kelasError) throw kelasError;
    if (penggunaError) throw penggunaError;
    if (materiError) throw materiError;

    // Kembalikan data yang sudah bersih
    return {
      kelas: kelasData || [],
      pengguna: penggunaData || [],
      materi: materiData || [],
    };
  } catch (error) {
    console.error('Error loading initial data:', error.message);
    throw error; // Lempar error agar bisa ditangkap komponen
  }
  // Tidak ada showLoading/showNotification di sini!
  // Itu diurus oleh Komponen.
};

/**
 * Menyimpan/Update Kelas (Mirip saveKelasToAPI)
 * Catatan: Upload file di Supabase (Storage) BEDA dengan simpan data (Database)
 * Ini contoh simpan data (tanpa file upload)
 */
export const saveKelas = async (kelasData, isEdit = false) => {
  try {
    let result;
    if (isEdit && kelasData.id) {
      // --- Logika UPDATE ---
      const { data, error } = await supabase
        .from('kelas') // Ganti 'kelas'
        .update({
          nama_kelas: kelasData.nama_kelas,
          deskripsi: kelasData.deskripsi,
          id_guru: kelasData.id_guru,
          // gambar_url: ... (URL hasil upload file)
        })
        .match({ id: kelasData.id }); // Tentukan baris mana yang di-update

      if (error) throw error;
      result = data;
    } else {
      // --- Logika CREATE (INSERT) ---
      const { data, error } = await supabase.from('kelas').insert([
        {
          nama_kelas: kelasData.nama_kelas,
          deskripsi: kelasData.deskripsi,
          id_guru: kelasData.id_guru,
          // gambar_url: ...
        },
      ]);

      if (error) throw error;
      result = data;
    }

    return result; // Kembalikan data
  } catch (error) {
    console.error('Error saving kelas:', error.message);
    throw error;
  }
};

/**
 * Menghapus Kelas (Mirip deleteKelasFromAPI)
 */
export const deleteKelas = async id => {
  try {
    const { data, error } = await supabase
      .from('kelas')
      .delete()
      .match({ id: id }); // Tentukan baris mana yang dihapus

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error deleting kelas:', error.message);
    throw error;
  }
};

// ...
// Boss bisa tambahkan fungsi lain di sini (savePengguna, deleteMateri, dll)
// ...
