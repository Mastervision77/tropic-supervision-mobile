import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Alert, I18nManager } from "react-native";
import * as SecureStore from "expo-secure-store";

type useAnMutateProps<T> = {
  endpoint: string;
  mutationKey: readonly unknown[];
  onSuccess?: (data: T) => void;
  onError?: (err: any) => void;
  formData?: boolean;
  onMutate?: () => void;
  method?: "post" | "put" | "delete";
};

// const API_BASE_URL = "https://super-admin.azzka.app/public/api";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL_SUPER;


export function useAnMutate<T>({
  endpoint,
  mutationKey,
  onSuccess,
  onError,
  formData,
  onMutate,
  method = "post",
}: useAnMutateProps<T>) {

  return useMutation({
    mutationKey,
    onMutate,
    mutationFn: async (values: any) => {
      const token = await SecureStore.getItemAsync("token");
      const tenantId = await SecureStore.getItemAsync("tenant_id");
      const tenantDb = await SecureStore.getItemAsync("tenant_database");

      const headers: any = {
        Authorization: token ? `Bearer ${token}` : "",
        "Accept-Language":"en",
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
