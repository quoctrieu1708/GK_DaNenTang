import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Image, Dimensions, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { productService } from '../services/ProductService';
import { Product } from '../models/Product';
import { auth } from '../../firebase';
import { neonTheme } from '../theme';

const { width } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

export const ProductListScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // --- BƯỚC 1: KIỂM TRA QUYỀN ADMIN ---
  // Lấy email của người đang đăng nhập hiện tại và kiểm tra
  const currentUserEmail = auth.currentUser?.email?.toLowerCase();
  const isAdmin = currentUserEmail === 'admin@gmail.com';
  // ------------------------------------

  useEffect(() => {
    const unsubscribe = productService.subscribeToProducts(setProducts);
    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.loaisp)));
    return ['Tất cả', ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Tất cả') return products;
    return products.filter(p => p.loaisp === selectedCategory);
  }, [products, selectedCategory]);

  const handleLogout = () => {
    auth.signOut();
    navigation.replace('Login');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => productService.deleteProduct(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Đổi tiêu đề cho ngầu: Admin thì "Quản lý", User thì "Cửa hàng" */}
        <Text style={styles.headerTitle}>
          {isAdmin ? "Quản lý sản phẩm" : "Danh sách sản phẩm"}
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          {categories.map((cat, index) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.idsanpham}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.hinhanh || 'https://via.placeholder.com/150' }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.tensp}</Text>
              <Text style={styles.productType}>Loại: {item.loaisp}</Text>
              <Text style={styles.productPrice}>{item.gia.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VNĐ</Text>
            </View>

            {/* --- BƯỚC 2: CHỈ HIỂN THỊ NÚT SỬA/XÓA NẾU LÀ ADMIN --- */}
            {isAdmin && (
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('AddEditProduct', { productToEdit: item })}>
                  <Text style={styles.btnText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.idsanpham)}>
                  <Text style={styles.btnText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* ---------------------------------------------------- */}

          </View>
        )}
      />

      {/* --- BƯỚC 3: CHỈ HIỂN THỊ NÚT THÊM (+) NẾU LÀ ADMIN --- */}
      {isAdmin && (
        <TouchableOpacity style={styles.fabButton} onPress={() => navigation.navigate('AddEditProduct', {})}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
      {/* ---------------------------------------------------- */}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: neonTheme.colors.bgDark },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: neonTheme.colors.textPrimaryCyan,
    textTransform: "uppercase",
  },
  logoutButton: {
    backgroundColor: neonTheme.colors.btnLogoutRed,
    borderWidth: 1,
    borderColor: neonTheme.colors.borderMagentaThin,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: { fontSize: 14, color: neonTheme.colors.btnTextColorLight },
  categoryContainer: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    paddingLeft: 20,
    marginBottom: 15,
  },
  categoryBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: neonTheme.colors.borderMagentaThin,
    backgroundColor: neonTheme.colors.bgCard,
    marginRight: 10,
  },
  categoryBtnActive: {
    backgroundColor: neonTheme.colors.neonCyan,
    borderColor: neonTheme.colors.neonCyan,
    boxShadow: `0px 2px 8px ${neonTheme.colors.neonCyan}66`,
  },
  categoryText: {
    color: neonTheme.colors.textTertiaryGrey,
    fontWeight: "bold",
    fontSize: 14,
  },
  categoryTextActive: { color: neonTheme.colors.btnTextColorDark },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: neonTheme.colors.bgCard,
    borderWidth: 1.5,
    borderColor: neonTheme.colors.borderMagentaThin,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    boxShadow: `0px 2px 4px ${neonTheme.colors.borderMagentaThin}1A`,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: neonTheme.colors.borderMagentaThin,
    marginRight: 15,
  },
  productDetails: { flex: 1 },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: neonTheme.colors.textPrimaryCyan,
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    color: neonTheme.colors.btnTextColorLight,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: neonTheme.colors.textSecondaryMagenta,
  },
  cardActions: { justifyContent: "space-between", height: 80 },
  editBtn: {
    borderWidth: 1.5,
    borderColor: "aqua",
    backgroundColor: "#1A1D22",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 5,
  },
  deleteBtn: {
    borderWidth: 1.5,
    borderColor: "aqua",
    backgroundColor: "#1A1D22",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 5,
  },
  btnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  fabButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: neonTheme.colors.btnFabMagenta,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: `0px 4px 6px ${neonTheme.colors.btnFabMagenta}33`,
    zIndex: 10,
  },
  fabIcon: { fontSize: 32, color: "#ffffff", fontWeight: "bold" },
});