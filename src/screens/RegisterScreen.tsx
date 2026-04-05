import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Alert } from 'react-native';
import { neonTheme } from '../theme';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

const { width } = Dimensions.get('window');

export const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu nhập lại không khớp!');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      Alert.alert('Đang xử lý', 'Đang tạo tài khoản...');
      // Hàm tạo tài khoản của Firebase
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
      // Firebase tự động đăng nhập sau khi tạo xong, nên ta chuyển thẳng vào trang Danh sách
      navigation.replace('ProductList');
    } catch (error: any) {
      let errorMessage = 'Đăng ký thất bại!';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Email này đã được sử dụng!';
      if (error.code === 'auth/invalid-email') errorMessage = 'Email không hợp lệ!';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.titleText}>ĐĂNG KÝ TÀI KHOẢN</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            placeholderTextColor={neonTheme.colors.inputPlaceholderGrey}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu (Ít nhất 6 ký tự)"
            placeholderTextColor={neonTheme.colors.inputPlaceholderGrey}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Nhập lại Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Xác nhận lại mật khẩu"
            placeholderTextColor={neonTheme.colors.inputPlaceholderGrey}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Đăng Ký</Text>
          </TouchableOpacity>

          {/* Nút quay lại trang đăng nhập */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.normalText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: neonTheme.colors.bgDark },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  logoText: {
    fontSize: 60,
    fontWeight: "bold",
    color: neonTheme.colors.neonMagenta,
    marginBottom: 5,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: neonTheme.colors.textPrimaryCyan,
    textTransform: "uppercase",
    marginBottom: 30,
  },
  formCard: { width: "100%", padding: 20 },
  label: {
    fontSize: 16,
    color: neonTheme.colors.textTertiaryGrey,
    marginBottom: 8,
  },
  input: {
    backgroundColor: neonTheme.colors.bgInput,
    borderWidth: 1.5,
    borderColor: neonTheme.colors.borderInputMagenta,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: neonTheme.colors.btnTextColorLight,
    fontSize: 16,
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: neonTheme.colors.neonMagenta,
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
    boxShadow: `0px 4px 6px ${neonTheme.colors.neonMagenta}33`,
  },
  registerButtonText: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  normalText: { color: neonTheme.colors.textTertiaryGrey, fontSize: 16 },
  loginLinkText: {
    color: neonTheme.colors.textPrimaryCyan,
    fontSize: 16,
    fontWeight: "bold",
  },
});