import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 

import { RootStackParamList } from './src/types/navigation';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ProductListScreen } from './src/screens/ProductListScreen';
import { AddEditProductScreen } from './src/screens/AddEditProductScreen';

// Lọc các cảnh báo rác
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && (
      message.includes('props.pointerEvents is deprecated') ||
      message.includes('Cannot record touch end') ||
      message.includes('"shadow*" style props are deprecated') ||
      message.includes('Blocked aria-hidden')
  )) return;
  originalWarn(...args);
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    // BỌC SAFEAREAPROVIDER RA NGOÀI CÙNG
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          {/* ĐÃ XÓA BỚT 1 MÀN HÌNH PRODUCTLIST BỊ TRÙNG */}
          <Stack.Screen
            name="ProductList"
            component={ProductListScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddEditProduct"
            component={AddEditProductScreen}
            options={({ route }) => ({
              title: route.params?.productToEdit
                ? "Sửa Sản Phẩm"
                : "Thêm Sản Phẩm",
              headerStyle: {
                backgroundColor: "#1A1D22",
              },
              headerTintColor: "#00FFFF",
              headerTitleStyle: {
                fontWeight: "bold", 
              },
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}