// Ganti seluruh isi file taskService.js
import { supabase } from './supabaseClient';

export const updateTaskProgress = async (taskType, materiId = null) => {
  if (!taskType) {
    console.error('Task type tidak boleh kosong');
    return null;
  }

  // Siapkan parameter untuk RPC
  const params = {
    task_type_input: taskType,
    materi_id_input: materiId, // Kirim materi_id
  };

  const { data, error } = await supabase.rpc('complete_task', params);

  if (error) {
    console.error('Error saat memperbarui progres task:', error.message);
    return null;
  }

  return data;
};
