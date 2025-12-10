# AM-PM 프런트엔드 설계 README

## 개발 서버 실행

- 루트에서 의존성을 설치하고 개발 서버를 띄웁니다.
  ```bash
  npm install
  npm start
  ```
- 기본 진입 주소: http://localhost:3000/

## 앱 진입 구조

- **`src/App.tsx`**
  - 첫 렌더 시 `localStorage`에 `clock_target_iso` 기본값을 주입해 홈 시계 컴포넌트의 목표 시각을 초기화합니다.
  - 전역 인증 컨텍스트(`AuthProvider`)로 모든 라우트가 동일한 사용자 상태를 공유하도록 감싼 뒤 `RouterProvider`로 라우터를 렌더합니다.
- **`src/api/router.tsx`**
  - `createBrowserRouter`로 모든 페이지 경로, 보호 라우트, 폼 액션을 정의합니다.
  - `/board/:category/write` 액션에서 게시글 작성 폼 데이터를 검증 후 인증 요청으로 게시글을 생성하고, 성공 시 카테고리 목록으로 리다이렉트합니다.【
  - `/register` 액션에서 회원가입 폼 입력을 수집해 API 요청을 보내고, 상태 코드에 따라 성공 알림·리다이렉트 또는 `Response` 예외로 에러 경로를 트리거합니다.
  - `LoginRoute`는 로그인 성공 콜백에서 컨텍스트의 `setUser`를 호출해 사용자 상태를 저장하고 홈으로 이동시킵니다.
  - `AdminRoute`는 인증 여부와 `SYSTEM_ADMIN` 권한을 확인해 없을 때는 로그인 페이지 또는 에러 페이지로 분기하고, 통과 시에만 관리자 페이지를 렌더합니다.【

## 인증·상태 관리

- **`src/contexts/userContext.tsx` (AuthProvider / useAuth)**
  - `localStorage`에 저장된 사용자 객체를 초기 상태로 하이드레이션하고, 상태 변경 시 저장소에 동기화합니다.
  - `storage` 이벤트를 구독해 다른 탭에서 발생한 로그인/로그아웃을 현재 탭 상태에 반영합니다.
  - `reloadUser`는 액세스 토큰이 없으면 상태를 비우고, 있으면 `/me` API(`getCurrentUser`)를 호출해 프로필을 최신화합니다.
  - `signOut`은 전역 스토어의 `logOut`으로 토큰과 저장된 유저를 지우고 상태를 null로 만든 뒤 `/login`으로 리다이렉트합니다.
  - `isAuthed`는 사용자 객체와 액세스 토큰이 모두 존재할 때만 `true`로 간주하여 보호 라우트에서 활용합니다.

## 페이지 및 컴포넌트 역할 (세부)

### 홈(랜딩) 흐름

- **`src/pages/Home.tsx`**
  - 랜딩 페이지를 헤더 → 시계 → 배경 배너 → 게시판 미리보기 → 연혁 타임라인 → 활동 카드 그리드 → 푸터 순으로 배치합니다.
  - 활동 카드 데이터(`projects`)를 정의해 `ProjectsGrid`에 전달하고, 타임라인 이미지와 업로드 허용 여부를 `History`에 넘깁니다.【F:src/pages/Home.tsx†L1-L47】
- **`components/header.tsx`**
  - 상단 네비게이션 바와 로그인/로그아웃 버튼을 렌더링합니다.
- **`components/clock.tsx`**
  - `clock_target_iso`를 읽어 목표 시각까지의 남은 시간 또는 지정된 시각을 표시하는 시계/카운트다운 영역입니다.
- **`components/background.tsx`**
  - 홈 상단의 배경 이미지와 소개 문구를 렌더링합니다.
- **`components/board.tsx`**
  - 카테고리(공지·스터디·취업·학교 정보)별 최신 5개 게시글을 병렬로 가져와 `MiniBoard`에 전달하고, 각 카테고리를 묶어 미리보기 그리드를 구성합니다.【
- **`components/miniBoard.tsx`**
  - 전달받은 게시글 리스트를 표 형태로 렌더링하고, 행 클릭 시 `useNavigate`로 상세 페이지(`/detail/:id`)로 이동합니다.
  - `date-fns`로 작성 시점을 “~전” 표현으로 변환해 가독성을 높입니다.【
- **`components/history.tsx`**
  - 타임라인 이미지를 배경으로 하는 연혁 섹션을 구성하며, `allowUpload` 플래그로 업로드 UI 표시 여부를 제어합니다.
- **`components/projectGrid.tsx` & `components/projectCard.tsx`**
  - `ProjectCardProps` 배열을 받아 카드 그리드로 뿌리고, 카드마다 제목·요약·카테고리 배지·이모지·날짜·태그·링크를 보여줍니다.【F:src/pages/Home.tsx†L15-L47】
- **`components/Footer.tsx`**
  - 사이트 하단의 기본 푸터를 렌더링합니다.

### 게시판 도메인

- **`components/boardList.tsx`**
  - URL 쿼리(`page`, `category`, `q`)와 내부 상태(정렬, 검색어, 필터 개방 여부)를 관리하며, 페이지네이션과 정렬 옵션을 제공하는 게시글 목록입니다.
  - 커스텀 `fetcher` prop이 없으면 `apiFetch`로 `/posts`를 호출하고, 존재하면 주입된 fetcher를 통해 데이터를 로드합니다.
  - 검색·정렬·페이지 변경 시 데이터를 다시 불러오고, 스켈레톤/빈 상태/에러 상태를 각각 별도 UI로 처리합니다.
  - 각 게시글 행 클릭 시 상세 페이지로 이동하며, 키보드 접근성을 위해 Enter/Space 입력도 처리합니다
- **`components/boardWrite.tsx`**
  - 라우터 액션(`/board/:category/write`)과 연동된 게시글 작성 폼을 렌더링하고, 제목·본문 입력 및 카테고리 라벨을 제공합니다.
- **`components/postDetail.tsx`**
  - URL 파라미터에서 게시글 ID를 읽어 `/posts/:id`를 호출한 뒤 상세 데이터를 상태에 저장합니다.
  - 로딩 시 스켈레톤을 보여주며, 데이터가 준비되면 제목·작성자·작성일·조회수 메타 정보를 표시합니다.
  - 본문은 `react-markdown` + `remark-gfm`/`remark-breaks`로 렌더링하고, 코드 블록은 Prism 하이라이터, 링크는 새 창 열기, 이미지는 lazy-loading으로 처리합니다.
  - 하단에 좋아요 버튼을 배치해 인터랙션 영역을 제공합니다.【

### 투표 도메인

- **`components/pollList.tsx`**
  - 투표 목록과 필터(상태, 마감일 범위, 다중 선택 여부, 익명 여부, 항목 추가/재투표 허용), 정렬(`sortBy`), 검색어, 페이지 상태를 관리합니다.
  - `getPolls` API로 서버 데이터를 가져온 뒤, 로컬 속성 필터(`filterPollsByAttributes`)로 한 번 더 추려서 표시합니다.
  - 초기 로딩/검색/필터링 각각에 다른 로딩 플래그를 사용해 버튼 활성화와 스피너 표시를 제어하며, 오류 발생 시 안내 메시지를 노출합니다.
  - 행 선택 시 `PollDetailModal`을 열어 상세를 보여주고, 새 투표 작성 버튼 클릭 시 `/polls/create`로 이동합니다.【
- **`components/PollDetailModal.tsx`**
  - 선택된 투표 ID를 받아 상세 조회, 옵션 선택, 투표/마감 요청 등을 처리하는 모달 UI입니다.
- **`components/pollCreate.tsx`**
  - 새 투표 생성 폼을 렌더링하고 옵션 추가/삭제, 마감일 설정, 다중 선택·익명 투표 여부 등 속성을 입력받아 API로 전송합니다.

### 인증·계정

- **`components/login.tsx`**
  - 로그인 폼 제출 시 API 요청 후 성공 콜백(`onSuccess`)으로 상위에서 전달된 사용자 상태 업데이트 함수를 실행합니다.
- **`components/register.tsx`**
  - 학번/이름/비밀번호 입력을 받고 라우터 액션(`/register`)과 함께 동작하여 서버 회원가입 요청을 보냅니다.
- **`pages/mypage.tsx`**
  - 로그인한 사용자의 개인 정보, 활동 내역 등을 표시하는 마이페이지입니다.
- **`components/prove.tsx`**
  - 특정 인증 절차(예: 회원 증빙)를 처리하는 컴포넌트로, `/prove` 경로와 연결됩니다.

### 관리자 도메인

- **`pages/AdminPage.tsx`**
  - `applications`(가입 신청) / `students`(회원 관리) 탭을 전환하며 각 탭에서 필요한 데이터를 로드합니다.
  - 가입 신청 탭: 대기 상태 신청 목록을 불러오고, 체크박스로 선택 후 승인/거부를 일괄 처리하며 확인 모달로 파괴적 변경을 보호합니다.
  - 학생 관리 탭: 학생 목록을 가져와 현재 사용자 레코드를 최상단에 고정하고, 권한 변경/삭제 액션을 제공하며, 확인 대화 상자로 변경을 재차 확인합니다.
  - 관리자 권한이 없는 경우 접근 거부 메시지를 렌더링합니다.

### 공통 UI & 유틸

- **입력 컴포넌트**: `components/input.tsx`, `components/label.tsx`, `components/textArea.tsx`, `components/button.tsx` 등이 폼 입력과 버튼을 일관된 스타일로 제공합니다.
- **목록/히어로 보조 컴포넌트**: `components/User.tsx`, `components/loginBtn.tsx`, `components/utils.tsx` 등은 사용자 카드, 로그인 버튼, 공통 함수 등을 캡슐화합니다.
- **API 클라이언트(`src/api/client.ts`)**: 공통 `apiFetch`로 베이스 URL, Authorization 헤더 삽입, 401 재시도/토큰 리프레시, JSON 파싱을 처리하고, 게시판·투표·관리자 API 호출에 재사용합니다.

## 라우트 흐름 참고 요약

1. 앱 진입 → `AuthProvider` 적용 및 목표 시각 초기화 → 라우터 렌더.
2. 경로 분기: 홈(`/`), 게시판 목록(`/board`), 게시글 상세(`/detail/:id`), 게시글 작성(`/board/:category/write` 액션 포함), 투표 목록/생성(`/polls`, `/polls/create`), 로그인/회원가입(`/login`, `/register`), 마이페이지(`/mypage`), 관리자(`/admin`), 증빙(`/prove`), 에러(\*) 등.
3. 보호 라우트: `AdminRoute`가 인증/권한을 확인하고 실패 시 리다이렉트 또는 에러 페이지로 이동합니다.
