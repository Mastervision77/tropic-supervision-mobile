import React, { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  Alert,
} from 'react-native';
import * as SecureStore from "expo-secure-store";

import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../components/styles/login.style';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useMutate } from '@/hooks/useMutate';
import { useAnMutate } from '@/hooks/useAnMutate';

export default function LoginScreen() {

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { token, tenantId, tenantDatabase, setAuthData } = useAuth();
  const formValuesRef = useRef<any>(null);

  const { mutate: mutateLogin, isPending: loadingLogin } = useMutate<any>({
    endpoint: "auth/login",
    mutationKey: ["login"],
    onSuccess: async (data) => {
      const token = data?.data?.token;
      const tenantId = formValuesRef.current?.tenant_id;
      const tenantDatabase = formValuesRef.current?.tenant_database;
      const user = data?.data;

      if (token && tenantId !== undefined && tenantDatabase !== undefined) {
        try {
          const tokenStr = String(token);
          const tenantIdStr = String(tenantId);
          const tenantDatabaseStr = String(tenantDatabase);
          if (user) {
            await SecureStore.setItemAsync("user", JSON.stringify(user));
          }
          await setAuthData(tokenStr, tenantIdStr, tenantDatabaseStr, user);

          await SecureStore.setItemAsync("token", tokenStr);
          router.replace("/");
        } catch (error) {
          Alert.alert("خطأ", "حدث خطأ أثناء حفظ بيانات الجلسة");
        }
      } else {
        console.error("Missing auth data:", {
          token,
          tenantId,
          tenantDatabase,
        });
        Alert.alert("خطأ", "بيانات المصادقة غير مكتملة");
      }
    },
    onError: (error: any) => {
      console.error("Auth login error:", error);
      Alert.alert(
        "خطأ في تسجيل الدخول",
        error?.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول",
      );
    },
  });

  const { mutate: mutateTenant, isPending: loadingTenant } = useAnMutate<any>({
    endpoint: "tenant-login",
    mutationKey: ["tenant-login"],
    onSuccess: async (data) => {
      console.log("Tenant login success:", data);
      console.log("Tenant ID type:", typeof data?.tenant?.id);
      console.log("Tenant DB type:", typeof data?.tenant?.database);

      const tenantId = data?.tenant?.id;
      const tenantDatabase = data?.tenant?.database;
      const modules = data?.modules;
      const facebookConfig = data?.facebook_config;
      const ultramsgConfig = data?.ultramsg_config;

      const saveToSecureStore = async (key: string, value: any) => {
        if (value === null || value === undefined) return;
        await SecureStore.setItemAsync(key, String(value));
      };

      await saveToSecureStore("tenant_id", tenantId);
      await saveToSecureStore("tenant_database", tenantDatabase);

      if (modules) {
        await SecureStore.setItemAsync("modules", JSON.stringify(modules));
      }
      if (facebookConfig) {
        await SecureStore.setItemAsync(
          "facebook_config",
          JSON.stringify(facebookConfig),
        );
      }
      if (ultramsgConfig) {
        await SecureStore.setItemAsync(
          "ultramsg_config",
          JSON.stringify(ultramsgConfig),
        );
      }

      formValuesRef.current = {
        ...formValuesRef.current,
        tenant_id: tenantId,
        tenant_database: tenantDatabase,
      };

      if (formValuesRef.current) {
        mutateLogin({
          email: formValuesRef.current.email,
          password: formValuesRef.current.password,
          tenant_database: tenantDatabase,
        });
      }
    },
    onError: (error: any) => {
      console.error("Tenant login error:", error);
      Alert.alert(
        "خطأ في تسجيل الدخول",
        error?.response?.data?.message || "حدث خطأ أثناء الاتصال بالنظام",
      );
    },
  });

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert("تنبيه", "الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    formValuesRef.current = { email, password };

    mutateTenant({ email, password });
  };

  const isLoading = loadingTenant || loadingLogin;
  const placeholderColor = "#9ca3af";

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
              />
            </View>

            <Text style={styles.welcomeText}>مرحبا في أذكى</Text>
            <Text style={styles.title}>تسجيل الدخول في لوحة التحكم</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>كلمة المرور</Text>
               <TextInput
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.passwordInput}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  editable={!isLoading}
                />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
              <TextInput
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
                editable={!isLoading}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}