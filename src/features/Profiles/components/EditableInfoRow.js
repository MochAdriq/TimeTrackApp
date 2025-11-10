// src/features/Profiles/components/EditableInfoRow.js
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const EditableInfoRow = ({
  label,
  value,
  isEditing,
  onChangeText,
  placeholder,
  isLast = false,
  ...textInputProps
}) => {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[styles.value, styles.input]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || `Masukkan ${label}...`}
          placeholderTextColor="#B0B0B0"
          autoCorrect={false}
          {...textInputProps}
        />
      ) : (
        <Text
          style={[styles.value, !value && styles.emptyValue]}
          numberOfLines={1}
        >
          {value || (label === 'Email' ? '...' : 'Belum diatur')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 14,
    color: '#777',
    flex: 2, // 40%
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 3, // 60%
    textAlign: 'right',
    fontWeight: '500',
  },
  emptyValue: {
    color: '#B0B0B0',
    fontStyle: 'italic',
  },
  input: {
    paddingVertical: 0, // Hapus padding default
    paddingHorizontal: 0,
    fontWeight: '500',
    color: '#4A2F2F',
  },
});

export default EditableInfoRow;
