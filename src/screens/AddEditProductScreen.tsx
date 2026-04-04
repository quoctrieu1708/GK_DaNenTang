import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Image, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { productService } from '../services/ProductService';
import { neonTheme } from '../theme';

const { width } = Dimensions.get('window');
type RouteProps = RouteProp<RootStackParamList, 'AddEditProduct'>;
type NavProps = NativeStackNavigationProp<RootStackParamList, 'AddEditProduct'>;

export const AddEditProductScreen = ({ route, navigation }: { route: RouteProps; navigation: NavProps }) => {
  const { productToEdit } = route.params || {};

  const [tensp, setTensp] = useState(productToEdit?.tensp || '');
  const [loaisp, setLoaisp] = useState(productToEdit?.loaisp || '');
  const [gia, setGia] = useState(productToEdit ? productToEdit.gia.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '');
  const [imageUri, setImageUri] = useState<string | null>(productToEdit?.hinhanh || null);
  
  // 1. Thêm State để lưu tỷ lệ ảnh (Mặc định 16:9 cho đẹp, nhưng sẽ tự đổi khi chọn ảnh)
  const [imgRatio, setImgRatio] = useState<number>(16 / 9);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // Cho phép người dùng chỉnh sửa ảnh trước khi lưu
      // ĐÃ XÓA dòng "aspect: [4, 3]" để người dùng có thể tự do chọn/cắt ảnh dọc, ngang, vuông tùy ý
      quality: 0.5,
    });
    
    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      // 2. Tự động tính toán tỷ lệ: Rộng / Cao
      setImgRatio(asset.width / asset.height);
    }
  };

  const handlePriceChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setGia(formatted);
  };

  const handleSave = async () => {
    if (!tensp.trim() || !loaisp.trim() || !gia.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin!');
    const numericPrice = parseFloat(gia.replace(/\./g, ''));

    try {
      Alert.alert('Đang xử lý', 'Vui lòng đợi trong giây lát...');
      let finalImageUrl = productToEdit?.hinhanh || '';

      if (imageUri && imageUri !== productToEdit?.hinhanh) {
        finalImageUrl = await productService.uploadImage(imageUri);
      }

      if (productToEdit) {
        await productService.updateProduct(productToEdit.idsanpham, tensp, loaisp, numericPrice, finalImageUrl);
      } else {
        await productService.addProduct(tensp, loaisp, numericPrice, finalImageUrl);
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <View style={styles.content}>

        {/* 3. Khung chọn ảnh thông minh */}
        <TouchableOpacity 
          // Nếu CÓ ảnh -> Dùng aspectRatio tự động. Nếu CHƯA CÓ ảnh -> Cố định height: 200px
          style={[
            styles.imagePicker, 
            imageUri ? { height: undefined, aspectRatio: imgRatio } : { height: 200 }
          ]} 
          onPress={pickImage}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.productImage} />
          ) : (
            <Text style={styles.imagePickerText}>Chạm để chọn ảnh</Text>
          )}
        </TouchableOpacity>

        <View style={styles.formContent}>
          <Text style={styles.label}>Tên sản phẩm</Text>
          <TextInput style={styles.input} placeholder="Tên sản phẩm" placeholderTextColor={neonTheme.colors.inputPlaceholderGrey} value={tensp} onChangeText={setTensp} />

          <Text style={styles.label}>Loại sản phẩm</Text>
          <TextInput style={styles.input} placeholder="Loại sản phẩm" placeholderTextColor={neonTheme.colors.inputPlaceholderGrey} value={loaisp} onChangeText={setLoaisp} />

          <Text style={styles.label}>Giá sản phẩm (VNĐ)</Text>
          <TextInput style={styles.input} placeholder="Giá" placeholderTextColor={neonTheme.colors.inputPlaceholderGrey} value={gia} onChangeText={handlePriceChange} keyboardType="numeric" />

          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={styles.actionButtonText}>{productToEdit ? "Cập Nhật" : "Thêm Mới"}</Text>
          </TouchableOpacity>
          
        </View>

      </View>

      </TouchableWithoutFeedback>
      
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: neonTheme.colors.bgDark },
  content: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 40,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center', 
  },
  imagePicker: { 
    width: '100%', 
    // Đã xóa height: 200 ở đây vì nó được điều khiển bằng code ở trên
    backgroundColor: neonTheme.colors.imagePlaceholderBg, 
    borderWidth: 2, 
    borderColor: neonTheme.colors.borderCyanDashed, 
    borderRadius: 10, 
    borderStyle: 'dashed', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20, 
    overflow: 'hidden' 
  },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePickerText: { fontSize: 16, color: neonTheme.colors.imagePlaceholderText },
  formContent: { width: '100%' },
  label: { fontSize: 16, color: neonTheme.colors.textTertiaryGrey, marginBottom: 8 },
  input: { backgroundColor: neonTheme.colors.bgInput, borderWidth: 1.5, borderColor: neonTheme.colors.borderInputMagenta, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 16, color: neonTheme.colors.btnTextColorLight, fontSize: 16, marginBottom: 20 },
  actionButton: { backgroundColor: neonTheme.colors.btnActionCyan, borderRadius: 8, paddingVertical: 18, alignItems: 'center', marginTop: 10, boxShadow: `0px 4px 6px ${neonTheme.colors.btnActionCyan}33` },
  actionButtonText: { fontSize: 20, fontWeight: 'bold', color: neonTheme.colors.btnTextColorDark },
});