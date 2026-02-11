# Implementation Plan & System Architecture

**[Current Revision: v2.11_260211]**

## Revision History

- **v1.0_260129**: Dashboard Layout & Sidebar Animation
  - [front/src/components/Common/Navbar.jsx]
    - 수정: Sidebar Toggle(`isSidebarOpen`) 로직 및 애니메이션 적용
  - [front/src/App.css]
    - 추가: Sidebar Transition 스타일 정의

- **v1.1_260130**: Responsive UI & Data Binding
  - [front/src/components/Common/Navbar.jsx]
    - 수정: `1024px` 기준 데스크탑/모바일 반응형 분기 처리
  - [front/src/components/Dashboard/TargetReality.jsx]
    - 수정: 고정 상수 데이터를 DB 데이터(`table.sql`) 연동으로 변경

- **v1.2_260203**: Dynamic Item Update (No-Refresh)
  - [front/src/components/Common/ItemPanel.jsx]
    - 수정: 아이템 추가/삭제 시 새로고침 없이 리스트가 갱신되도록 `useEffect` 의존성 배열 수정

- **v1.3_260204**: Documentation & Architecture
  - [readme.md], [api_spec.md]
    - 추가: 프로젝트 아키텍처 및 API 명세서 초안 작성
  - [front/Implementation_Plan.md]
    - 추가: 기술 구현 계획서 생성

- **v2.0_260206**: Data Isolation & Rendering Debug (Today)
  - [back/controllers/getControllers.js]
    - 분석: `userId` 기반 데이터 격리 로직(Data Isolation) 검증
  - [front/src/components/Common/ItemPanel.jsx]
    - 수정: 로그인 상태에 따른 조건부 렌더링 로직 및 `filteredTasks` 크래시(Crash) 해결
    - 수정: `.panel` 너비를 `flex-1`로 변경하여 가변 레이아웃 적용

- **v2.1_260206**: Layout & Alignment Polish (Current)
  - [front/src/App.css]
    - 수정: `.page_section`에 `display: flex` 속성 누락분 추가 (Black Screen 해결)
  - [front/src/components/Common/Navbar.jsx]
    - 수정: 로고 Wrapper 중앙 정렬 (`justify-center`)
    - 수정: 메뉴 리스트 수직 중앙 정렬 (`mt-8` -> `my-auto`) 및 텍스트 왼쪽 정렬 유지

- **v2.2_260211**: Login Button UX Polish
  - [front/src/components/Common/Navbar.jsx]
    - 개선: 로그인 버튼 내부 컨텐츠(아이콘+텍스트) 중앙 정렬 처리 (`justify-center`, `text-center`)

- **v2.3_260211**: Auto-Bullet & Line Break
  - [front/src/components/Common/Modal.jsx]: `HandleKeyDown`에서 `Enter` 입력 시 `\n- ` 자동 삽입.
  - [front/src/components/Common/Item.jsx]: `whitespace-pre-line` 적용으로 카드 뷰에서 리스트 구조 활성화.

- **v2.4_260211**: UI Uniformity
  - [front/src/components/Common/AddItem.jsx]: `h-auto min-h-[25vh]` 적용.

- **v2.6_260211**: Preventing Layout Shift (CLS)
  - [front/src/components/Common/Item.jsx]: `Completed/InCompleted` 버튼 고정 너비(`w-24`) 적용.

- **v2.7_260211**: Rebranding
- **v2.9_260211**: Interactive Today's Todo
  - [front/src/components/Common/Navbar.jsx]: `Detail Modal`, `Quick Complete`, `Toggle Important` 이벤트 핸들러 구현.

- **v2.10_260211**: Mobile UX Optimization & Safety
  - [front/src/components/Common/Navbar.jsx]: `Mobile Header Popup` 및 `Logout Confirmation Modal` 구현.

- **v2.11_260211**: Sidebar Collapsed Auth UI Fix
  - [front/src/components/Common/Navbar.jsx]: 축소 상태에서의 로그인 버튼 디자인 보완 및 프로필 이미지 연동.

---

## 1. System Overview

### Tech Stack

- **Frontend**: React (Vite), Redux Toolkit, Tailwind CSS
- **Authentication**: JWT, Google OAuth (@react-oauth/google)
- **Routing**: React Router Dom

### Core State Management (Redux)

- **authSlice**: 유저 로그인 정보 (`name`, `picture`, `token`, `sub`) 관리.
- **modalSlice**: 아이템 상세/수정 모달 UI 제어.
- **apiSlice**: Backend API (`/items`, `/completed`) 비동기 통신.

---

## 2. System Architecture & Data Flow (New)

### 2.1 System Architecture Diagram

```mermaid
graph TD
    User[User (Browser)] -->|Interaction| UI[React UI Components]
    UI -->|Dispatch Action| Redux[Redux Store]

    subgraph Frontend Logic
    Redux -->|Select State| UI
    Redux -->|Async Thunk| API[API Service (Axios/Fetch)]
    end

    API -->|HTTP Request (JSON)| Server[Express Server]

    subgraph Backend Logic
    Server -->|Routing| Router[Express Router]
    Router -->|Business Logic| Controller[Controllers]
    Controller -->|SQL Query| DB[(PostgreSQL Database)]
    end

    DB -->|Result Set| Controller
    Controller -->|JSON Response| API
    API -->|Update State| Redux
```

### 2.2 Data Flow Analysis (Variable Lifecycle)

주요 데이터 흐름을 추적하여 버그 발생 지점을 사전에 파악합니다.

| 변수명 (Variable) | 생성 위치 (Origin)   | 변경/가공 로직 (Mutation)          | 참조/최종 목적지 (Destination)      | 비고 (Note)            |
| :---------------- | :------------------- | :--------------------------------- | :---------------------------------- | :--------------------- |
| **userId (sub)**  | `GoogleLogin` (Auth) | `jwtDecode` -> `authSlice` (Redux) | `ItemPanel.jsx` (API Request Param) | **Data Isolation Key** |
| **picture**       | `GoogleLogin` (Auth) | `jwtDecode` -> `authSlice` (Redux) | `Navbar.jsx` (Sidebar Avatar)       | **Profile UI**         |

| **isSidebarOpen** | `Navbar.jsx` (State) | `toggleSidebar` (Click), `Resize` (Window) | `nav` className (CSS Visibility) | Mobile/Tablet Toggle |
| **getTasksData** | `apiSlice` (Redux) | `fetchGetItem` (Async API Call) | `ItemPanel.jsx` (Rendering List) | `null` Check Essential |
| **filteredTasks** | `ItemPanel.jsx` (Derived) | `filter(isCompleted)` -> `filter(isImportant)` | `Item.jsx` (Map Render) | Filtering Logic |
| **isLogoutConfirmOpen** | `Navbar.jsx` (State) | `handleLogoutClick` (Open) -> `confirmLogout` (Close) | `Modal UI` (Conditional Render) | **Safety Guard** |
| **isTodayOpen** | `Navbar.jsx` (State) | `setIsTodayOpen` (Toggle) | `Today's Todo List` (Collapse) | UX Toggle |

### 2.3 Execution Flow Map (Critical Path)

사용자가 '할 일 목록'을 조회하는 과정(Read)의 실행 흐름입니다.

1.  **Init (`ItemPanel.jsx`)**: 컴포넌트 마운트 및 `userKey`(`auth.sub`) 확인.
2.  **Dispatch (`useEffect`)**: `if (userKey)` 조건 충족 시 `fetchGetItem(userKey)` 액션 발송.
    - `-> apiSlice.js`: `createAsyncThunk` 실행 -> `GET /get_tasks/:userId` 요청.
3.  **Server Processing (`getControllers.js`)**:
    - `-> Route`: `/get_tasks/:userId` 매핑.
    - `-> Controller`: `request.params.userId` 추출.
    - `-> Database`: `SELECT * FROM tasks WHERE userId = $1` 쿼리 실행.
4.  **Response Handling**:
    - DB 결과(`rows`)를 JSON으로 반환.
    - Redux: `fulfilled` 상태 감지 -> `state.getItemData` 업데이트.
5.  **UI Update**:
    - `ItemPanel`: `useSelector`로 변경된 데이터 감지.
    - **Filtering**: `filteredCompleted`, `filteredImportant` 조건 적용.
    - **Rendering**: `<Item />` 컴포넌트 리스트 출력.

---

## 3. Project History & Evolution

이 프로젝트는 단순한 Todo 앱에서 시작하여 다음과 같은 단계별 고도화를 거쳤습니다.

### Phase 1: Foundation & Responsive Layout

- **Setup**: React(Vite) 프로젝트 초기화 및 TailwindCSS 설정.
- **Sidebar**: Mini Sidebar(80px)와 Full Sidebar(288px)를 오가는 반응형 네비게이션 구현.
- **Layout**: 기존 Appbar를 제거하고, 사이드바와 콘텐츠 패널의 2단 구조(`flex-row`) 확립.

### Phase 2: Backend Integration & Authentication (Security)

- **Database**: PostgreSQL `tasks` 테이블 설계 및 연결.
- **Auth**: Google OAuth 도입. 가장 중요한 점은 **`userId`를 통한 데이터 격리(Isolation)**입니다. 각 사용자는 본인의 데이터만 볼 수 있습니다.
- **Redux**: 인증 정보(`authSlice`)와 API 데이터(`apiSlice`)를 전역 상태로 관리.

### Phase 3: Refactoring & Optimization (Current)

- **Bug Fix**: 초기 데이터 로딩 시점의 렌더링 크래시(White Screen) 문제 해결 (Safe Guard 적용).
- **UX Improvement**:
  - 사이드바 메뉴: 수직 중앙 정렬(`Vertical Center`)로 시각적 안정감 확보.
  - 데스크탑 레이아웃: `display: flex` 누락 수정 및 `flex-1` 적용으로 화면 잘림 현상 완벽 해결.

---

## 4. Implementation Modules (History & Logic)

### [Module A] Layout & Navigation (Navbar.jsx)

**Evolution: v0.1 (Animation) -> v0.2 (Hidden) -> v2.0 (Mini Sidebar)**

#### 1. Mini Sidebar Architecture (v2.0)

- **Concept**: 공간 효율성(80px)과 브랜드 인지만(Logo)을 동시에 잡는 하이브리드 UX.
- **State Logic**:
  - `isDesktopOpen`: 데스크탑 환경에서의 확장/축소 상태 제어.
  - `isSidebarOpen`: 모바일 환경에서의 드로어(Drawer) open/close 제어.
- **Responsive Strategy**:
  - **Desktop (≥1024px)**: `w-72` (Expanded) <-> `w-20` (Collapsed).
  - **Mobile (<1024px)**: `w-64` Fixed Overlay + `translate-x` Transition.
- **Key UX Features**:
  - **Visual Width Fix**: 로고의 가상요소(20px)로 인한 치우침을 `w-[50px] wrapper`로 보정.
  - **Hover Swap**: 인증 버튼에 마우스 오버 시 `FcGoogle` -> `MdLogout` (Red) 전환.

#### 2. Mobile Layout Optimization (v2.0)

- **Flex Grouping**: `justify-between` -> `justify-start`로 변경하여 로고와 메뉴를 상단 결착.
- **Bottom Fixed Auth**: `mt-auto` 속성을 사용하여 로그인 버튼을 하단에 강제 고정.
- **Padding**: `py-10 px-4`를 기본값으로 적용하여 모바일 상단 답답함 해소.

#### 3. Sidebar Alignment Update (v2.1)

- **Vertical Alignment**: 메뉴 리스트(`ul`)에 `my-auto`를 적용하여 사이드바 높이의 중앙에 자동 배치.
- **Horizontal Alignment**:
  - Logo: `justify-center` (Identity 강조)
  - Menu Items: `justify-start` (가독성 확보를 위한 텍스트 왼쪽 정렬)

#### 4. Login Button UX Improvement (v2.2)

- **Central Alignment**: 로그인 버튼 내의 텍스트와 아이콘을 시각적으로 중앙 정렬 (`justify-center`, `text-center`).
- **Content Flow**: 텍스트의 `flex-1` 속성을 제거하여 아이콘과 텍스트가 하나의 그룹으로 중앙에 위치하도록 개선.
  - Menu Items: `justify-start` (가독성 확보를 위한 텍스트 왼쪽 정렬)

#### 5. Today's Todo Widget (v2.8)

- **Concept**: 사이드바의 남는 공간을 활용하여, 오늘 마감해야 할 업무(`date === Today`)를 직관적으로 노출.
- **Micro-Layout**: `Menu List`와 함께 수직 중앙 정렬(`my-auto`) 그룹으로 묶어 배치.
- **Responsive Behavior**: 사이드바가 접혔을 때는 과감히 숨기고, 펼쳤을 때만 상세 리스트를 노출하여 정보 과부하 방지.
- **Visual Cue**: `Impontant` 항목은 빨간 점(Red Dot)으로 강조하여 시선 유도.

#### 6. Mobile UX & Safety (v2.10)

- **Header Hover Popups**: 모바일 환경에서도 상단 네비게이션 아이콘에 마우스를 올리면(또는 롱프레스 시) 할 일 목록을 미리 볼 수 있는 `Neon Style Popup`을 이식. `onClick` 이벤트 버블링 방지(`stopPropagation`) 적용.
- **Logout Confirmation**: 좁은 모바일 화면에서의 오터치를 방지하기 위해, 로그아웃 시 즉시 실행되지 않고 `Backdrop Blur`가 적용된 **Dark Theme Modal**을 통해 사용자 의사를 재확인.

### [Module B] Item Management (Item.jsx, ItemPanel.jsx)

**Evolution: v0.4 (Async) -> v1.0 (Design Restoration)**

#### 1. Responsive Grid System (v1.0)

- **Logic**: Tailwind Grid가 아닌 Flex Wrap 기반의 유동적 열(Column) 배치.
- **Breakpoints**:
  - `< 768px`: 1열 (`w-full`)
  - `768px ~ 1023px`: 2열 (`w-1/2`)
  - `> 1024px`: 3열 (`w-1/3`) -> 기존 고정폭(`w-1/3`) 문제 해결.

#### 2. Auto-Format Description (v2.3)

- **Input UX**: `Modal.jsx`에서 `Enter` 키를 감지하여 다음 줄에 `- `(글머리 기호)를 자동 생성.
- **Rendering**: `Item.jsx`의 `p` 태그에 `whitespace-pre-line`을 적용하여 DB에 저장된 줄바꿈(`\n`)이 실제 화면에서도 리스트 형태로 렌더링되도록 개선.

#### 3. Item Card Anatomy (v1.0)

- **Header**: `Title` (강조) + `Date` (보조) + `Detail Button`.
- **Body**: `Description` (2줄 제한, Ellipsis 처리).
- **Footer**:
  - Left: `Completed` / `Important` 상태 토글 버튼.
  - Right: `Edit` / `Delete` 아이콘 (Secondary Action).

#### 4. Height Synchronization (v2.4)

- **AddItem Card**: `Item.jsx`와 동일한 `h-auto min-h-[25vh]` 스타일을 적용.
- **Flex Stretch**: `Flexbox`의 기본 동작(`stretch`)을 활용하여, 같은 행(Row)에 있는 아이템의 내용이 길어지면 `Add Item` 카드도 자동으로 동일한 높이로 늘어나도록 UI 일관성 확보.

#### 5. Layout Shift Prevention (v2.6)

- **Fixed Width Button**: `Completed`와 `InCompleted` 텍스트의 길이가 달라 토글 시 버튼 너비가 변하고, 이로 인해 이웃한 `Important` 버튼이 밀리는 현상(Layout Shift) 방지.
- **Solution**: 두 버튼에 `w-24` 및 `text-center`를 적용하여 상태 변화와 무관하게 고정된 공간을 점유하도록 개선.

---

### [Module C] CSS & Styling Strategy (App.css)

**Evolution: v2.0 (Refactoring)**

#### 1. Layout Stability

- **Gap Removal**: `.page_section`에서 `gap` 속성을 제거하여 사이드바 토글 시 발생하는 미세한 Layout Shift 현상 방지.
- **Flex Fluidity**: `.panel`에 `width: 80%` 대신 `flex: 1`을 적용하여, 사이드바 너비(`w-20` vs `w-72`)에 따라 남은 공간을 자연스럽게 채우도록 구현.

#### 2. Documentation (Better Comment)

- **Protocol**: 코드 수정 시 반드시 `//! [Original Code]`와 `//* [Modified Code]`를 병기하여 변경의 이유(Why)를 코드 내에 영구 보존.

---

## 5. Future Technical Debt (To-Do)

- **Lazy Loading**: `ItemPanel`의 아이템이 많아질 경우 가상 스크롤(Virtual Scrolling) 도입 고려.
- **Theme Support**: 현재 `App.css`에 `color-scheme: dark`가 하드코딩 되어 있음. 테마 토글 기능 확장 시 변수화 필요.
