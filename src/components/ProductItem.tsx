import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Product } from '../models/Product';
import { productService } from '../services/ProductService';

interface Props {
  product: Product;
  onEdit: () => void;
}

export const ProductItem: React.FC<Props> = ({ product, onEdit }) => {
  const handleDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => productService.deleteProduct(product.idsanpham) },
    ]);
  };

  const formattedPrice = product.gia.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: product.hinhanh ? product.hinhanh : 'https://via.placeholder.com/150' }} 
        style={styles.image} 
      />
      <View style={styles.info}>
        <Text style={styles.name}>{product.tensp}</Text>
        <Text style={styles.category}>Loại: {product.loaisp}</Text>
        <Text style={styles.price}>{formattedPrice} VNĐ</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}><Text style={styles.btnText}>Sửa</Text></TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}><Text style={styles.btnText}>Xóa</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, flexDirection: 'row', alignItems: 'center', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', elevation: 3 },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 15 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  category: { fontSize: 14, color: '#666', marginTop: 4 },
  price: { fontSize: 16, color: '#e74c3c', fontWeight: 'bold', marginTop: 4 },
  actions: { justifyContent: 'space-between', height: 80 },
  editBtn: { backgroundColor: '#f39c12', padding: 8, borderRadius: 5, alignItems: 'center', marginBottom: 5 },
  deleteBtn: { backgroundColor: '#e74c3c', padding: 8, borderRadius: 5, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});