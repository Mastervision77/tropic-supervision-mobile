import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Alert, I18nManager } from "react-native";
import * as SecureStore from "expo-secure-store";

type UseMutateProps<T> = {
  endpoint: string;
  mutationKey: readonly unknown[];
  onSuccess?: (data: T) => void;
  onError?: (err: any) => void;
  formData?: boolean;
  onMutate?: () => void;
  method?: "post" | "put" | "delete";
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export function useMutate<T>({
  endpoint,
  mutationKey,
  onSuccess,
  onError,
  formData,
  onMutate,
  method = "post",
}: UseMutateProps<T>) {
  const isRTL = I18nManager.isRTL;

  return useMutation({
    mutationKey,
    onMutate,
    mutationFn: async (values: any) => {
      const token = await SecureStore.getItemAsync("token");
      const tenantId = await SecureStore.getItemAsync("tenant_id");
      const tenantDb = await SecureStore.getItemAsync("tenant_database");

      const headers: any = {
        Authorization: token ? `Bearer ${token}` : "",
        "Accept-Language": isRTL ? "ar" : "en",
        "X-Tenant-ID": tenantId || "",
        "X-Tenant-Database": tenantDb || "",
      };

      if (!formData) {
        headers["Content-Type"] = "application/json";
      }

      const response = await axios({
        method,
        url: `${API_BASE_URL}/${endpoint}`,
        data: values,
        headers,
      });

      return response.data;
    },
    onSuccess,
    onError: (err: any) => {
      Alert.alert(
        "خطأ",
        err?.response?.data?.message || "حدث خطأ ما"
      );
      onError?.(err);
    },
  });
}
