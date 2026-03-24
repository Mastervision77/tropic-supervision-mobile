// hooks/useFetch.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "./useAuth";

type UseFetchProps = {
 queryKey: readonly unknown[];
  endpoint: string;
  enabled?: boolean;
  select?: ((data: any) => any) | undefined;
  onError?: (err: any) => void;
  onSuccess?: (data: any) => void;
  localization?: boolean;
};

const API_BASE_URL = "https://azzka.app/back/public/api/v1";

function useFetch<T>({
  endpoint,
  enabled = true,
  select,
  queryKey,
  onError,
  onSuccess,
  localization = true,
}: UseFetchProps) {
  const { token, tenantId, tenantDatabase, clearAuth } = useAuth();
  const [isRTL] = useState(true);

  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Accept-Language": localization ? (isRTL ? "ar" : "en") : "en",
      "X-Tenant-ID": tenantId || "",
      "X-Tenant-Database": tenantDatabase || "",
    },
  };

  const query = useQuery<T>({
    queryKey,
    queryFn: async (): Promise<T> => {
      try {
        const response = await axios.get<T>(`${API_BASE_URL}/${endpoint}`, config);
        return response.data;
      } catch (error: any) {
        throw error;
      }
    },
    enabled: enabled && !!token, 
    select,
  });

  useEffect(() => {
    if (query.error) {
      const error = query.error as any;
      const errorMessage = error?.response?.data?.message;

      if (errorMessage !== "Tenant database name missing.") {
        Alert.alert("خطأ", errorMessage || "حدث خطأ ما");
      }

      if (
        errorMessage === "Unauthenticated." ||
        errorMessage ===
          "Tenant header missing. Please send X-Tenant-Database or X-Tenant-ID." ||
        errorMessage === "Tenant database name missing."
      ) {
        clearAuth();
      }

      if (onError) {
        onError(error);
      }
    }
  }, [query.error, onError, clearAuth]);

  useEffect(() => {
    if (query.data && query.isSuccess) {
      if (onSuccess) {
        onSuccess(query.data);
      }
    }
  }, [query.data, query.isSuccess, onSuccess]);

  return query;
}

export default useFetch;
