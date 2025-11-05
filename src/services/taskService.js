import { supabase } from './supabaseClient';

/**
 * Memanggil fungsi 'complete_task' di database Supabase.
 * Fungsi ini akan menangani semua logika:
 * - Menemukan task harian yang relevan (berdasarkan 'task_type_input').
 * - Mengecek apakah user sudah menyelesaikannya hari ini.
 * - Menambah progres jika belum.
 * - Memberi poin jika progres selesai.
 *
 * @param {string} taskType - Tipe task, misal: 'read_materi'
 * @returns {Promise<object|null>} - Mengembalikan data tugas yang selesai (title, points_reward) atau null.
 */
export const updateTaskProgress = async taskType => {
  if (!taskType) {
    console.error('Task type tidak boleh kosong');
    return null;
  }

  // Kita memanggil fungsi 'complete_task' di Supabase
  // dan mengirimkan tipe task-nya.
  const { data, error } = await supabase.rpc('complete_task', {
    task_type_input: taskType,
  });

  if (error) {
    console.error('Error saat memperbarui progres task:', error.message);
    return null;
  }

  // Jika 'data' tidak null, berarti task berhasil diselesaikan
  // dan kita mendapatkan info poinnya.
  return data;
};
