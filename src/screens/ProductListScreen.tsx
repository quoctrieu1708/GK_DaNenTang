import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Image, Dimensions, ScrollView, TextInput, Modal, Platform } from 'react-native';
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
  // 1. Thêm State để lưu từ khóa tìm kiếm
  const [searchQuery, setSearchQuery] = useState<string>('');

  // States cho Custom Delete Dialog (Sửa lỗi xóa trên Web)
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Kiểm tra quyền Admin
  const currentUserEmail = auth.currentUser?.email?.toLowerCase();
  const isAdmin = currentUserEmail === 'admin@gmail.com';

  useEffect(() => {
    const unsubscribe = productService.subscribeToProducts(setProducts);
    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.loaisp)));
    return ['Tất cả', ...uniqueCategories];
  }, [products]);

  // 2. Nâng cấp bộ lọc: Lọc kết hợp CẢ Category VÀ Search Query
  const filteredProducts = useMemo(() => {
    let result = products;

    // Bước A: Lọc theo danh mục trước
    if (selectedCategory !== 'Tất cả') {
      result = result.filter(p => p.loaisp === selectedCategory);
    }

    // Bước B: Lọc tiếp theo từ khóa tìm kiếm (nếu có nhập)
    if (searchQuery.trim() !== '') {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(p => 
        // Tìm trong tên sản phẩm HOẶC loại sản phẩm
        p.tensp.toLowerCase().includes(lowerCaseQuery) ||
        p.loaisp.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  const handleLogout = () => {
    auth.signOut();
    navigation.replace('Login');
  };

  // --- KÍCH HOẠT HỘP THOẠI XÓA (Thay vì dùng Alert) ---
  const triggerDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogVisible(true);
  };

  // --- THỰC THI XÓA KHI BẤM XÁC NHẬN ---
  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await productService.deleteProduct(productToDelete);
      } catch (error: any) {
        if (Platform.OS === 'web') {
          window.alert("Lỗi khi xóa: " + error.message);
        } else {
          alert("Lỗi khi xóa: " + error.message);
        }
      } finally {
        setDeleteDialogVisible(false);
        setProductToDelete(null);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isAdmin ? "Quản lý sản phẩm" : "Danh sách sản phẩm"}
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Thêm Giao diện Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm sản phẩm..."
          placeholderTextColor={neonTheme.colors.inputPlaceholderGrey}
          value={searchQuery}
          onChangeText={setSearchQuery} // Cập nhật chữ mỗi khi gõ
        />
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

      {/* Hiển thị thông báo nếu không tìm thấy gì */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào!</Text>
        </View>
      ) : (
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

              {isAdmin && (
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('AddEditProduct', { productToEdit: item })}>
                    <Text style={styles.btnText}>Sửa</Text>
                  </TouchableOpacity>
                  {/* GỌI HÀM TRIGGER DELETE Ở ĐÂY */}
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => triggerDelete(item.idsanpham)}>
                    <Text style={styles.btnText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}

      {isAdmin && (
        <TouchableOpacity style={styles.fabButton} onPress={() => navigation.navigate('AddEditProduct', {})}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* --- MODAL XÓA SẢN PHẨM CHUẨN WEB --- */}
      <Modal
        visible={deleteDialogVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dialogContent}>
            <Text style={styles.dialogTitle}>XÁC NHẬN XÓA</Text>
            <Text style={styles.dialogMessage}>Bạn có chắc chắn xóa sản phẩm này không?</Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity 
                style={styles.dialogBtnCancel} 
                onPress={() => setDeleteDialogVisible(false)}
              >
                <Text style={styles.dialogBtnTextCancel}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.dialogBtnDelete} 
                onPress={confirmDelete}
              >
                <Text style={styles.dialogBtnTextDelete}>Xóa ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

  // --- STYLE CHO THANH TÌM KIẾM ---
  searchContainer: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: neonTheme.colors.bgInput,
    borderWidth: 1.5,
    borderColor: neonTheme.colors.neonCyan,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: neonTheme.colors.btnTextColorLight,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: neonTheme.colors.textTertiaryGrey,
    fontSize: 18,
    fontStyle: "italic",
  },
  // ---------------------------------

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

  // --- STYLE MODAL CHUẨN WEB ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContent: { 
    backgroundColor: neonTheme.colors.bgCard, 
    borderWidth: 2, 
    borderColor: neonTheme.colors.borderMagentaThin, 
    borderRadius: 15, 
    padding: 25, 
    width: '85%', 
    maxWidth: 400, 
    alignItems: 'center', 
    boxShadow: `0px 0px 15px ${neonTheme.colors.borderMagentaThin}66`,
    elevation: 10 
  },
  dialogTitle: { fontSize: 20, fontWeight: 'bold', color: neonTheme.colors.neonMagenta, marginBottom: 15, textAlign: 'center' },
  dialogMessage: { fontSize: 16, color: neonTheme.colors.btnTextColorLight, textAlign: 'center', marginBottom: 25, lineHeight: 24 },
  dialogButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  dialogBtnCancel: { flex: 1, backgroundColor: neonTheme.colors.bgInput, borderWidth: 1, borderColor: neonTheme.colors.textTertiaryGrey, paddingVertical: 12, borderRadius: 8, marginRight: 10, alignItems: 'center' },
  dialogBtnDelete: { flex: 1, backgroundColor: neonTheme.colors.btnLogoutRed, paddingVertical: 12, borderRadius: 8, marginLeft: 10, alignItems: 'center' },
  dialogBtnTextCancel: { color: neonTheme.colors.btnTextColorLight, fontSize: 16, fontWeight: 'bold' },
  dialogBtnTextDelete: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});