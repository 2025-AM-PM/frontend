import React, { createContext, useContext, useMemo } from "react";
import type {
  IApiClient,
  IPollService,
  IAuthService,
  IAdminService,
  IDbService,
} from "./api.interfaces";
import { createDefaultServices, type ServiceContainer } from "./services";

// ============================================================
// Context Value Type
// ============================================================

export interface ApiContextValue {
  apiClient: IApiClient;
  pollService: IPollService;
  authService: IAuthService;
  adminService: IAdminService;
  dbService: IDbService;
}

// ============================================================
// Context
// ============================================================

const ApiContext = createContext<ApiContextValue | null>(null);

// ============================================================
// Provider Props
// ============================================================

export interface ApiProviderProps {
  children: React.ReactNode;
  /** 커스텀 API 클라이언트 (테스트용) */
  apiClient?: IApiClient;
  /** 커스텀 Poll 서비스 (테스트용) */
  pollService?: IPollService;
  /** 커스텀 Auth 서비스 (테스트용) */
  authService?: IAuthService;
  /** 커스텀 Admin 서비스 (테스트용) */
  adminService?: IAdminService;
  /** 커스텀 DB 서비스 (테스트용) */
  dbService?: IDbService;
}

// ============================================================
// Provider Component
// ============================================================

/**
 * API 서비스들을 하위 컴포넌트에 제공하는 Provider
 *
 * @example 기본 사용 (프로덕션)
 * ```tsx
 * <ApiProvider>
 *   <App />
 * </ApiProvider>
 * ```
 *
 * @example 테스트용 모킹
 * ```tsx
 * <ApiProvider pollService={mockPollService}>
 *   <PollList />
 * </ApiProvider>
 * ```
 */
export function ApiProvider({
  children,
  apiClient,
  pollService,
  authService,
  adminService,
  dbService,
}: ApiProviderProps) {
  // 동기적 lazy initialization (초기 렌더링에서 서비스 생성)
  const value = useMemo<ApiContextValue>(() => {
    const defaults = createDefaultServices();

    return {
      apiClient: apiClient ?? defaults.apiClient,
      pollService: pollService ?? defaults.pollService,
      authService: authService ?? defaults.authService,
      adminService: adminService ?? defaults.adminService,
      dbService: dbService ?? defaults.dbService,
    };
  }, [apiClient, pollService, authService, adminService, dbService]);

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

// ============================================================
// Hooks
// ============================================================

/**
 * 전체 API Context를 가져오는 Hook
 */
export function useApi(): ApiContextValue {
  const ctx = useContext(ApiContext);
  if (!ctx) {
    throw new Error("useApi는 ApiProvider 내부에서만 사용 가능합니다.");
  }
  return ctx;
}

/**
 * API 클라이언트를 가져오는 Hook
 */
export function useApiClient(): IApiClient {
  return useApi().apiClient;
}

/**
 * Poll 서비스를 가져오는 Hook
 */
export function usePollService(): IPollService {
  return useApi().pollService;
}

/**
 * Auth 서비스를 가져오는 Hook
 */
export function useAuthService(): IAuthService {
  return useApi().authService;
}

/**
 * Admin 서비스를 가져오는 Hook
 */
export function useAdminService(): IAdminService {
  return useApi().adminService;
}

/**
 * DB 서비스를 가져오는 Hook
 */
export function useDbService(): IDbService {
  return useApi().dbService;
}

// ============================================================
// Export Context for advanced use cases
// ============================================================

export { ApiContext };
