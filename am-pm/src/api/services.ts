import type {
  IApiClient,
  IPollService,
  IAuthService,
  IAdminService,
  IDbService,
  ApiResponse,
  Extra,
  LoginRequest,
  RegisterRequest,
  SignupStatus,
  SignupApplicationResponse,
  SignupApplicationProcessResponse,
  AllStudentResponse,
  StudentResponse,
} from "./api.interfaces";
import type {
  PagePollSummaryResponse,
  PollSearchParam,
  Pageable,
  PollCreateRequest,
  PollSummaryResponse,
  PollDetailResponse,
  PollResultResponse,
  PollVoteRequest,
  User,
  DbHealthResponse,
} from "../types";
import { authStoreApi, useAuthStore } from "../stores/authStore";
import { refreshAccessToken } from "./auth";
import { setStoredUser } from "./storage";
import { pickBearerFromHeaders } from "./auth_helper";

// ============================================================
// Default API Client Implementation
// ============================================================

export class DefaultApiClient implements IApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? process.env.REACT_APP_API_BASE ?? "";
  }

  async fetch<T>(
    path: string,
    init: RequestInit & Extra = {}
  ): Promise<ApiResponse<T>> {
    const method = (init.method || "GET").toUpperCase();
    const isMutating =
      method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

    const isAuthEndpoint = path.startsWith("/auth/");

    const headers = new Headers({
      ...init.headers,
    });

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (!isAuthEndpoint && (isMutating || init.auth)) {
      const tk = authStoreApi.getState().accessToken;
      if (tk && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${tk}`);
      }
    }

    const credentials: RequestCredentials =
      isMutating || init.withCredentials ? "include" : "omit";

    const url = `${this.baseUrl}/api${path}`;
    const doFetch = () => fetch(url, { ...init, method, headers, credentials });

    let res = await doFetch();

    if (!isAuthEndpoint && res.status === 401 && (isMutating || init.auth)) {
      const newTk = await refreshAccessToken();
      if (newTk) {
        headers.set("Authorization", `Bearer ${newTk}`);
        res = await doFetch();
      }
    }

    const contentType = res.headers.get("content-type") || "";
    const raw = await res.text();
    let parsed: any = null;

    if (raw) {
      if (contentType.includes("application/json")) {
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          console.error("Failed to parse JSON response:", e);
          parsed = raw;
        }
      } else {
        parsed = raw;
      }
    }

    if (!res.ok) {
      const message =
        (parsed && (parsed.message || parsed.error)) ||
        raw ||
        `${res.status} ${res.statusText}`;
      const error = new Error(message) as any;
      error.status = res.status;
      error.responseBody = parsed;
      throw error;
    }

    return {
      status: res.status,
      data: (parsed as T) ?? null,
      headers: res.headers,
    };
  }
}

// ============================================================
// Default Poll Service Implementation
// ============================================================

export class DefaultPollService implements IPollService {
  constructor(private client: IApiClient) {}

  async getPolls(
    params: PollSearchParam = {},
    pageable: Pageable = { page: 0, size: 10 }
  ): Promise<PagePollSummaryResponse> {
    const searchParams = new URLSearchParams();

    searchParams.append("page", pageable.page.toString());
    searchParams.append("size", pageable.size.toString());

    if (params.query && params.query.trim()) {
      searchParams.append("query", params.query.trim());
    }
    if (params.status) {
      searchParams.append("status", params.status);
    }
    if (params.deadlineFrom) {
      searchParams.append("deadlineFrom", params.deadlineFrom);
    }
    if (params.deadlineTo) {
      searchParams.append("deadlineTo", params.deadlineTo);
    }
    if (pageable.sort && pageable.sort.length > 0) {
      pageable.sort.forEach((s) => searchParams.append("sort", s));
    }

    const response = await this.client.fetch<PagePollSummaryResponse>(
      `/polls?${searchParams.toString()}`
    );
    return response.data!;
  }

  async getPollDetail(pollId: number): Promise<PollDetailResponse> {
    const response = await this.client.fetch<PollDetailResponse>(
      `/polls/${pollId}`,
      { auth: true }
    );
    return response.data!;
  }

  async getPollResults(pollId: number): Promise<PollResultResponse> {
    const response = await this.client.fetch<PollResultResponse>(
      `/polls/${pollId}/results`,
      { auth: true }
    );
    return response.data!;
  }

  async createPoll(pollData: PollCreateRequest): Promise<PollSummaryResponse> {
    const response = await this.client.fetch<PollSummaryResponse>(`/polls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pollData),
    });
    return response.data!;
  }

  async votePoll(pollId: number, voteData: PollVoteRequest): Promise<void> {
    await this.client.fetch<void>(`/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(voteData),
    });
  }

  async closePoll(pollId: number): Promise<PollSummaryResponse> {
    const response = await this.client.fetch<PollSummaryResponse>(
      `/polls/${pollId}/close`,
      { method: "POST" }
    );
    return response.data!;
  }

  async deletePoll(pollId: number): Promise<void> {
    await this.client.fetch<void>(`/polls/${pollId}`, { method: "DELETE" });
  }
}

// ============================================================
// Default Auth Service Implementation
// ============================================================

export class DefaultAuthService implements IAuthService {
  constructor(private client: IApiClient) {}

  async login(req: LoginRequest): Promise<User> {
    const { setToken, setUser, logOut } = useAuthStore.getState();

    const { data, headers } = await this.client.fetch<{
      studentId: number;
      studentName: string;
      studentNumber: string;
      studentTier: number;
      role?: string;
      accessToken?: string;
    }>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    let token = pickBearerFromHeaders(headers);
    if (!token && data && data.accessToken) {
      token = data.accessToken;
    }

    if (!token) {
      logOut();
      throw new Error("로그인 실패: accessToken을 받지 못했습니다.");
    }
    setToken(token);

    let user: User | null = null;
    if (data && ("studentName" in data || "role" in data)) {
      user = {
        studentId: data.studentId ?? null,
        studentName: data.studentName ?? null,
        studentNumber: data.studentNumber ?? null,
        studentTier: data.studentTier ?? null,
        role: data.role ?? null,
      } as User;
      setUser(user);
    } else {
      await this.loadMe();
      user = useAuthStore.getState().user as User | null;
    }

    if (!user) {
      logOut();
      throw new Error("로그인 실패: 사용자 정보를 불러오지 못했습니다.");
    }
    return user;
  }

  async register(req: RegisterRequest): Promise<number> {
    const { status } = await this.client.fetch<unknown>("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    return status;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await this.client.fetch<{
        studentId: number;
        studentName: string;
        studentNumber: string;
        role: string;
        studentTier: number;
      }>("/students/me", { method: "GET", auth: true });

      if (!data) return null;

      const user: User = {
        studentId: data.studentId || null,
        studentName: data.studentName || null,
        studentNumber: data.studentNumber || null,
        studentTier: data.studentTier || null,
        role: data.role || null,
      };

      setStoredUser<User>(user);
      return user;
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      return null;
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    return refreshAccessToken();
  }

  private async loadMe(): Promise<void> {
    const { data } = await this.client.fetch<User>("/students/me", {
      method: "GET",
      auth: true,
    });
    useAuthStore.getState().setUser(data);
  }
}

// ============================================================
// Default Admin Service Implementation
// ============================================================

export class DefaultAdminService implements IAdminService {
  constructor(private client: IApiClient) {}

  async getSignupApplications(
    status: SignupStatus
  ): Promise<SignupApplicationResponse[]> {
    const response = await this.client.fetch<SignupApplicationResponse[]>(
      `/admin/signup?status=${status}`,
      { auth: true }
    );
    return response.data || [];
  }

  async approveSignupApplications(
    applicationIds: number[]
  ): Promise<SignupApplicationProcessResponse> {
    const response = await this.client.fetch<SignupApplicationProcessResponse>(
      "/admin/signup/approve",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationIds }),
        auth: true,
      }
    );
    return response.data!;
  }

  async rejectSignupApplications(
    applicationIds: number[]
  ): Promise<SignupApplicationProcessResponse> {
    const response = await this.client.fetch<SignupApplicationProcessResponse>(
      "/admin/signup/reject",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationIds }),
        auth: true,
      }
    );
    return response.data!;
  }

  async getAllStudents(): Promise<AllStudentResponse> {
    const response = await this.client.fetch<AllStudentResponse>(
      "/admin/students",
      { auth: true }
    );
    return response.data!;
  }

  async updateStudentRole(
    studentId: number,
    role: string
  ): Promise<StudentResponse> {
    const response = await this.client.fetch<StudentResponse>(
      `/admin/students/${studentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        auth: true,
      }
    );
    return response.data!;
  }

  async deleteStudent(studentId: number): Promise<void> {
    await this.client.fetch<void>(`/admin/students/${studentId}`, {
      method: "DELETE",
      auth: true,
    });
  }
}

// ============================================================
// Default DB Service Implementation
// ============================================================

export class DefaultDbService implements IDbService {
  private dbUrl: string;

  constructor(dbUrl?: string) {
    this.dbUrl = dbUrl ?? process.env.DB_API ?? "";
  }

  async healthCheck(): Promise<DbHealthResponse> {
    const res = await fetch(`${this.dbUrl}/api/db/health`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("DB 연결 실패");
    return res.json();
  }
}

// ============================================================
// Factory Function
// ============================================================

export interface ServiceContainer {
  apiClient: IApiClient;
  pollService: IPollService;
  authService: IAuthService;
  adminService: IAdminService;
  dbService: IDbService;
}

/**
 * 기본 서비스 인스턴스들을 생성하는 팩토리 함수
 */
export function createDefaultServices(): ServiceContainer {
  const apiClient = new DefaultApiClient();
  return {
    apiClient,
    pollService: new DefaultPollService(apiClient),
    authService: new DefaultAuthService(apiClient),
    adminService: new DefaultAdminService(apiClient),
    dbService: new DefaultDbService(),
  };
}

// ============================================================
// Singleton Instance (for backward compatibility)
// ============================================================

let _defaultServices: ServiceContainer | null = null;

export function getDefaultServices(): ServiceContainer {
  if (!_defaultServices) {
    _defaultServices = createDefaultServices();
  }
  return _defaultServices;
}
