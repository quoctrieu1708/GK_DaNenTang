import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';

interface Props {
  tensp: string;
  loaisp: string;
  gia: string;
  isEditing: boolean;
  onNameChange: (t: string) => void;
  onCategoryChange: (t: string) => void;
  onPriceChange: (t: string) => void;
  onSave: () => void;
}

export const ProductForm: React.FC<Props> = ({ tensp, loaisp, gia, isEditing, onNameChange, onCategoryChange, onPriceChange, onSave }) => {
  const handlePriceChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    onPriceChange(formatted);
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Tên sản phẩm" placeholderTextColor="#888" value={tensp} onChangeText={onNameChange} />
      <TextInput style={styles.input} placeholder="Loại sản phẩm" placeholderTextColor="#888" value={loaisp} onChangeText={onCategoryChange} />
      <TextInput style={styles.input} placeholder="Giá sản phẩm (VNĐ)" placeholderTextColor="#888" value={gia} onChangeText={handlePriceChange} keyboardType="numeric" />
      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveBtnText}>{isEditing ? "Cập Nhật" : "Thêm Mới"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, flex: 1, boxShadow: '0px -3px 5px rgba(0,0,0,0.1)', elevation: 10 },
  input: { backgroundColor: '#f1f3f5', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16, color: '#000' },
  saveBtn: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});