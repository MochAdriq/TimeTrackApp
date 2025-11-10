// src/navigation/navigationRef.js
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// Kita tambahkan fungsi 'navigate' kustom di sini untuk kemudahan
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    // Opsional: Tambahkan antrian atau logika fallback jika navigator belum siap
    console.warn(
      'Navigation ref not ready, navigation action ignored.',
      name,
      params,
    );
  }
}
