import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as SecureStore from "expo-secure-store";

import { useAnMutate } from "@/hooks/useAnMutate";
import { useAuth } from "@/hooks/useAuth";
import { useMutate } from "@/hooks/useMutate";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "../components/styles/login.style";

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  try {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "حدث خطأ غير متوقع";
  } catch {
    return "حدث خطأ غير متوقع";
  }
};

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setAuthData } = useAuth();

  const formValuesRef = useRef<any>(null);

  /* ---------------- login mutation ---------------- */

  const { mutate: mutateLogin, isPending: loadingLogin } = useMutate<any>({
    endpoint: "auth/login",
    mutationKey: ["login"],

    onSuccess: async (data) => {
      console.log("LOGIN RESPONSE:", data);

      const token = data?.data?.token;
      const user = data?.data;

      const tenantId = formValuesRef.current?.tenant_id;
      const tenantDatabase = formValuesRef.current?.tenant_database;

      console.log("TOKEN:", token);
      console.log("TENANT ID:", tenantId, typeof tenantId);
      console.log("TENANT DB:", tenantDatabase, typeof tenantDatabase);

      if (token && tenantId && tenantDatabase) {
        try {
          const tokenStr = String(token);
          const tenantIdStr = String(tenantId);
          const tenantDatabaseStr = String(tenantDatabase);

          console.log("TOKEN TYPE:", typeof tokenStr);
          console.log("TENANT ID TYPE:", typeof tenantIdStr);
          console.log("TENANT DB TYPE:", typeof tenantDatabaseStr);

          if (user) {
            await SecureStore.setItemAsync("user", JSON.stringify(user));
          }

          await SecureStore.setItemAsync("token", tokenStr);
          await SecureStore.setItemAsync("tenant_id", tenantIdStr);
          await SecureStore.setItemAsync("tenant_database", tenantDatabaseStr);

          await setAuthData(tokenStr, tenantIdStr, tenantDatabaseStr, user);

          console.log("SESSION SAVED SUCCESSFULLY");

          router.replace("/(tabs)");
        } catch (error) {
          console.log("SAVE SESSION ERROR:", error);
          const errorMsg = getErrorMessage(error);
          Alert.alert("خطأ", errorMsg);
        }
      } else {
        console.log("MISSING DATA:", {
          token,
          tenantId,
          tenantDatabase,
        });

        Alert.alert("خطأ", "بيانات المصادقة غير مكتملة");
      }
    },

    onError: (error: any) => {
      console.log("LOGIN ERROR:", error);
      const errorMsg = getErrorMessage(error);
      Alert.alert("خطأ في تسجيل الدخول", errorMsg);
    },
  });

  /* ---------------- tenant mutation ---------------- */

  const { mutate: mutateTenant, isPending: loadingTenant } = useAnMutate<any>({
    endpoint: "tenant-login",
    mutationKey: ["tenant-login"],

    onSuccess: async (data) => {
      console.log("TENANT RESPONSE:", data);

      const tenantId = String(data?.tenant?.id);
      const tenantDatabase = String(data?.tenant?.database);

      const modules = data?.modules;
      const facebookConfig = data?.facebook_config;
      const ultramsgConfig = data?.ultramsg_config;

      console.log("TENANT ID:", tenantId, typeof tenantId);
      console.log("TENANT DATABASE:", tenantDatabase, typeof tenantDatabase);

      const saveToSecureStore = async (key: string, value: any) => {
        if (value === null || value === undefined) return;

        try {
          await SecureStore.setItemAsync(key, String(value));
          console.log("Saved:", key, value);
        } catch (error) {
          console.log("SecureStore Error:", key, error);
        }
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

      console.log("FORM VALUES:", formValuesRef.current);

      if (formValuesRef.current) {
        mutateLogin({
          email: formValuesRef.current.email,
          password: formValuesRef.current.password,
          tenant_database: tenantDatabase,
        });
      }
    },

    onError: (error: any) => {
      console.log("TENANT ERROR:", error);
      const errorMsg = getErrorMessage(error);
      Alert.alert("خطأ في تسجيل الدخول", errorMsg);
    },
  });

  /* ---------------- submit ---------------- */

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert("تنبيه", "الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    formValuesRef.current = { email, password };

    console.log("SUBMIT VALUES:", formValuesRef.current);

    mutateTenant({ email, password });
  };

  const isLoading = loadingTenant || loadingLogin;

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
              />
            </View>

            <Text style={styles.title}>تسجيل الدخول في تروبك للاشراف</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>البريد الإلكتروني</Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>كلمة المرور</Text>

              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>تسجيل الدخول</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
