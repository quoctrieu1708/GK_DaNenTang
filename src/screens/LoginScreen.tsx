import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Alert } from 'react-native';
import { neonTheme } from '../theme';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

const { width } = Dimensions.get('window');

// Khai báo export const để khớp với file App.tsx
export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email và Mật khẩu!');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('ProductList'); 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', 'Sai email hoặc mật khẩu!');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.titleText}>Login</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={neonTheme.colors.inputPlaceholderGrey}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor={neonTheme.colors.inputPlaceholderGrey}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng Nhập</Text>
          </TouchableOpacity>
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
    paddingTop: 50,
    width: '100%', 
    maxWidth: 500,        // Giới hạn chiều rộng tối đa
    alignSelf: 'center',  // Đẩy khung vào giữa màn hình
  },
  logoText: {
    fontSize: width * 0.25,
    fontWeight: "bold",
    color: neonTheme.colors.neonMagenta,
    marginBottom: 10,
  },
  titleText: {
    fontSize: width * 0.08,
    fontWeight: "bold",
    color: neonTheme.colors.neonMagenta,
    textTransform: "uppercase",
    marginBottom: 40,
  },
  formCard: { width: "100%", padding: 20 },
  label: {
    fontSize: 16,
    color: neonTheme.colors.btnTextColorLight,
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
  loginButton: {
    backgroundColor: neonTheme.colors.btnActionCyan,
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
    boxShadow: `0px 4px 6px ${neonTheme.colors.btnActionCyan}33`,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: neonTheme.colors.btnTextColorLight,
  },
});