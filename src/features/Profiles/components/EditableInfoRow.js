// src/features/Profiles/components/EditableInfoRow.js
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const EditableInfoRow = ({
  label,
  value,
  isEditing, // Prop baru: true jika mode edit
  onChangeText, // Prop baru: fungsi untuk update nilai
  showButton = false,
  onButtonPress,
  ...textInputProps // Props lain untuk TextInput (keyboardType, autoCapitalize, dll)
}) => {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing ? (
          // --- Mode Edit ---
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={label}
            placeholderTextColor="#C0C0C0"
            {...textInputProps} // Terapkan props keyboardType, dll.
          />
        ) : (
          // --- Mode View ---
          <Text style={styles.infoValue}>{value}</Text>
        )}
      </View>
      {/* Tampilkan tombol hanya jika showButton=true DAN tidak sedang edit */}
      {showButton && !isEditing && (
        <TouchableOpacity style={styles.connectButton} onPress={onButtonPress}>
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    // Style untuk TextInput saat mode edit
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    borderBottomWidth: 1,
    borderColor: '#C0C0C0',
    paddingVertical: 4,
  },
  connectButton: {
    backgroundColor: '#6A453C',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default EditableInfoRow;
