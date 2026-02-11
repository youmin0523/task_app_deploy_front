# Task: 투두 리스트 렌더링 및 레이아웃 최적화

## Revision History

**[Current Revision: v2.13_260211]**

- **v2.11_260211**: Sidebar Collapsed Auth UI Fix
  - [front/src/components/Common/Navbar.jsx]
    - 수정: 데스크탑 사이드바 축소(`Collapsed`) 상태에서 로그인 버튼이 원형 마크(G 마크 또는 프로필 사진)만 나오도록 UI 고도화.
    - 개선: 로그인 정보(`authData`)에서 프로필 사진(`picture`)을 추출하여 아이콘 대신 표시 기능 추가.

- **v2.12_260211**: Navbar JSX Syntax Error Fix
  - [front/src/components/Common/Navbar.jsx]
    - 수정: `return` 내부 주석을 JSX 중괄호(`{ }`)로 래핑하여 문법 에러 해결.

- **v2.13_260211**: Mobile Header Sidebar trigger restoration
  - [front/src/components/Common/Navbar.jsx]
    - 복구: 실수로 누락된 `handleHeaderTodoClick` 함수를 복구하여 모바일 상단 아이콘 클릭 시 사이드바 열림 기능 정상화.

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

- **v2.2_260211**: Login Button Alignment
  - [front/src/components/Common/Navbar.jsx]
    - 수정: 로그인 버튼 텍스트와 아이콘 중앙 정렬 (`justify-start` -> `justify-center`)
    - 수정: 텍스트 중앙 정렬 (`text-left` -> `text-center`) 및 `flex-1` 제거로 컨텐츠 중앙 배치

- **v2.9_260211**: Navbar Responsive & UI Fixes
  - [front/src/components/Common/Navbar.jsx] (Critical)
    - **수정**: 모바일/태블릿 `Close` 버튼 클릭 불가 버그 해결 (`z-index` 조정)
    - **복구**: Collapsed 모드 시 `Orb UI` (원형 아이콘 + 팝업) 기능 복구 및 활성화
    - **개선**: 반응형 동작 정교화 (1024px 기준 Full/Hidden 토글 및 Desktop Collapsible 지원)

- **v2.3_260211**: Auto-Bullet Description
  - [front/src/components/Common/Modal.jsx]
    - 기능 추가: `Add Item` 모달 진입 시 Description 필드에 글머리 기호(`- `) 자동 초기화.
    - 기능 추가: `Enter` 키 입력 시 자동으로 다음 줄에 글머리 기호(`\n- `) 삽입하는 핸들러 추가.
  - [front/src/components/Common/Item.jsx]
    - 스타일 수정: Description(`p`) 태그에 `whitespace-pre-line` 추가하여 줄바꿈 및 리스트 형식을 화면에 반영.

- **v2.4_260211**: UI Uniformity (Height Sync)
  - [front/src/components/Common/AddItem.jsx]: `AddItem` 카드의 높이 설정을 `Item.jsx`와 동일하게 `h-auto min-h-[25vh]`로 변경.
  - 효과: `flex-wrap` 레이아웃에서 같은 행에 있는 아이템의 높이가 늘어날 경우, `AddItem` 카드도 동일한 높이로 자동 조절됨(Stretch).

- **v2.6_260211**: Preventing Layout Shift (CLS)
  - [front/src/components/Common/Item.jsx]: `Completed` 및 `InCompleted` 버튼에 고정 너비(`w-24`)와 중앙 정렬(`text-center`) 적용.
  - 효과: 버튼의 텍스트 길이가 변해도(11자 -> 9자) 너비가 유지되므로, 좁은 화면에서의 줄바꿈 상태가 일정하게 유지됨.

- **v2.7_260211**: Rebranding (MARSHALL -> YOUMINSU)
  - [front/src/components/Common/Navbar.jsx]: 브랜드 로고 텍스트를 `MARSHALL`에서 `YOUMINSU`로 변경. (모바일 헤더, 데스크탑 사이드바 모두 적용)

- **v2.8_260211**: Today's Todo Section
  - [front/src/components/Common/Navbar.jsx]
    - 기능 추가: 사이드바 Important 메뉴 하단에 **Today's Todo** 섹션 추가.
    - 로직 구현: `api.getItemData`를 참조하여 오늘 날짜(`YYYY-MM-DD`)와 일치하고 미완료(`!isCompleted`)인 항목만 필터링.
    - 반응형 동작: 사이드바가 확장된 상태(`isDesktopOpen`)에서만 노출, 축소 시 숨김.
    - 레이아웃: 메뉴 리스트와 Today 섹션을 하나의 `Vertical Wrapper`로 묶어(`my-auto`) 사이드바 수직 중앙에 배치.

- **v2.9_260211**: Interactive Today's Todo
  - [front/src/components/Common/Navbar.jsx]
    - 기능 개선: `Today's Todo` 섹션 내 각 항목에 인터랙션 추가.
      1. **Click to Detail**: 항목 클릭 시 `Modal` (Detail Type) 호출.
      2. **Quick Complete**: 커스텀 체크박스 클릭 시 즉시 완료(`isCompleted: true`) 처리.
      3. **Toggle Important**: 붉은 점(Red Dot) 클릭 시 중요 상태(`isImportant`) 토글.
    - 스타일 개선: 섹션 헤더 및 카운트 폰트 사이즈 확대, 체크박스 디자인 고도화(Hover Effect).
    - **[Fix]**: 기존 로그인(Auth) 섹션이 제거되지 않고 정상 유지되도록 코드 복원.
    - **[Fix]**: `Important Toggle` 시 발생하는 API 에러("중요 표시 변경 실패") 해결 (Payload 구조 최적화).
    - **[New]**: 상세 모달(`Details`) 내에서 즉시 수정(`Edit`) 모드로 전환할 수 있는 버튼 추가.
    - **[New]**: `Today's Todo` 리스트에서 중요하지 않은 항목도 클릭 한 번으로 `Important` 상태로 변경 가능하도록 UI 개선 (Outline Circle).
    - **[Refactor]**: `Navbar.jsx` 및 `Modal.jsx` 내의 모든 변경 사항에 대해 [Original Code] 보존 및 [Modified Code] 설명 주석 추가 (Better Comment Protocol 준수).
    - **[New]**: `Tomorrow's Todo` 섹션 추가. `Today's Todo` 하단에 동일한 스타일과 기능을 가진 내일 할 일 목록을 표시하여 업무 흐름 연결성 강화.
    - **[New]**: `Today's Todo` 및 `Tomorrow's Todo` 섹션에 **접침/펼침(Collapsible)** 기능 구현. 각 섹션 헤더 클릭 시 리스트 표시 여부 토글, 화살표 아이콘으로 상태 시각화.
    - **[Refactor]**: 사이드바 레이아웃 안정화. 중앙 정렬(`my-auto`)을 제거하고 상단 정렬(`mt-6`)로 변경하여, Todo 섹션 확장 시 상단 메뉴가 밀리는 현상(Layout Shift) 제거. 스크롤 기능(`overflow-y-auto`) 추가.
    - **[Refactor]**: 사용자 피드백 반영하여 `Main Menu`는 다시 **중앙 정렬(my-auto)**로 복원하고, `Todo List`는 하단 영역(메뉴와 로그인 사이 공간)을 별도로 할당받아 배치. 레이아웃 간섭 최소화.
    - **[Refactor]**: 사이드바 레이아웃 구조 전면 개편. **Flex Spacer**(`flex-1`)를 상단과 하단에 각각 배치하여 `Main Menu`를 완벽하게 수직 중앙에 고정(Centering). Todo List는 하단 Spacer 내부(`absolute overlay`)에 배치하여, 내용이 길어져도 메뉴 위치에 영향을 주지 않도록 격리(Isolation).

- **v2.11_260211**: Sidebar Collapsed Auth UI Fix
  - [front/src/components/Common/Navbar.jsx]
    - 축소 모드(`Collapsed`) 대응: 로그인 버튼이 긴 형태에서 원형 아이콘 형태로 동적 전환되도록 수정.
    - 프로필 연동: 구글 프로필 이미지(`picture`)가 있을 경우 `FcGoogle` 대신 사용자 이미지를 노출.

  - [front/src/components/Common/Navbar.jsx]
    - **[Fix] Responsive Navbar**: 1024px 이하 모바일 화면에서 무조건 펼침 상태(Expanded)를 유지하도록 CSS 분기 처리 수정. (기존에는 데스크탑의 Collapsed 상태가 모바일에 영향을 주어 글자가 깨지는 현상 발생)
    - **[New] Mobile Header Popup**: 모바일 헤더의 `Today's Todo` 및 `Tomorrow's Todo` 아이콘에 데스크탑과 동일한 **Neon Style Hover Popup** 기능 추가. (클릭하지 않고도 할 일 목록 미리보기 가능)
    - **[New] Logout Confirmation**: 로그아웃 버튼 클릭 시 즉시 로그아웃되는 대신, **Dark Theme Modal**을 띄워 사용자의 의사를 한 번 더 확인하도록 안전장치 마련. (오터치 방지)

---

## 0. Project History & Evolution

이 프로젝트(`aicc8_deploy_app`)는 간단한 Todo 리스트로 시작하여 다음과 같은 과정을 거쳐 고도화되었습니다.

### Phase 1: Foundation & Layout

- **Initial Setup**: React + Vite + TailwindCSS 환경 세팅.
- **Responsive Sidebar**: 모바일/데스크탑 반응형 사이드바 구현.
  - Desktop: Collapsible Mini Sidebar (80px <-> 288px)
  - Mobile: Drawer Menu with Backdrop
- **Dashboard Layout**: Appbar 삭제 및 2단(Sidebar + Content) 레이아웃 정립.

### Phase 2: Core Features

- **Database Integration**: PostgreSQL 기반 `tasks` 테이블 연동.
- **Authentication**: Google OAuth 활용한 사용자 인증 및 **데이터 격리(`userId`)** 구현.
- **CRUD Operations**:
  - `ItemPanel`: 할 일 목록 조회 (Read)
  - `Item`: 수정/삭제/상태변경 (Update/Delete)
  - `Modal`: 할 일 추가 (Create)

### Phase 3: Optimization & Debugging (Current)

- **Error Handling**: `getTasksData` 로딩 시점의 렌더링 크래시 버그 수정.
- **UI UX Polish**:
  - Sidebar 정렬 개선: Logo(Center), Menu(Vertical Center + Left Text).
  - Layout 개선: Flexbox 기반의 가변 너비(`flex-1`) 적용으로 화면 잘림 현상 해결.

---

## 1. Issue Analysis

- **User Report**: "Todo에 적어놓은 내용이 안나오는데 확인해줄 수 있어?"
- **Context**:
  - Frontend: React + Redux (Auth, API)
  - Backend: Express + PostgreSQL
  - Database: `tasks` table with `userId` column
- **Potential Causes**:
  1. **Data Isolation (의도된 설계)**: DB의 샘플 데이터(`userId='marshall'`)는 실제 Google 로그인 유저(`sub=123...`)와 `userId`가 다르므로 조회되지 않음.
  2. **Auth Handling**: 로그인 후 `authData.sub` 값이 정상적으로 Redux State 및 API 요청에 전달되는지 확인 필요.
  3. **Rendering**: CSS 스타일이나 필터링 로직(`filteredCompleted`)에 의한 가시성 문제.
  4. **Data Ownership**: 사용자가 pgAdmin4에서 확인한 본인의 `userId`를 기존 데이터에 적용하고 싶어함.

## 2. Action Plan

- [x] Frontend `ItemPanel.jsx` 로직 분석 (Data Check)
- [x] Backend `getControllers.js` 및 쿼리 분석 (Query Check)
- [x] `apiSlice.js` 요청 흐름 확인
- [ ] User Feedback을 통한 원인 규명 (샘플 데이터 미노출 vs 신규 데이터 미노출)
- [ ] **Solution Guide**:
  - 방법 A (권장): SQL `UPDATE` 문을 사용하여 샘플 데이터의 주인을 현재 유저로 변경.
  - **Status Change**: 사용자가 인증 로직(`Login Required`) 유지를 원하여 코드 강제 수정 취소(Rollback).
- [x] **Verified Logic**:
  - `userKey` 없음 (비로그인) -> "로그인이 필요한 서비스입니다" 표출 (정상)
  - `userKey` 있음 (로그인) -> "Add Items" 버튼 및 할 일 목록 표출 (정상이라고 판단했으나, 실제로는 보이지 않음)
- [x] **Critical Bug Investigation**:
  - **Result**: `console.log` 결과 `userKey: "117387..."`이 정상 출력됨. (Auth 로직 정상)
  - **New Hypothesis**:
    1. **ReferenceError**: `filteredTasks is not defined` 에러 발생. (확정)
    2. **Logic Error (Critical)**: `getTasksData?.filter(...).filter(...)` 체이닝 과정에서 `getTasksData`가 `null`일 경우 `undefined.filter`가 실행되어 초기 로딩 시 컴포넌트 크래시(Blank Screen) 유발.
  - **New Hypothesis**:
    1. **Vertical Alignment Issue**: 사용자는 메뉴 아이템 리스트가 사이드바의 **세로상 정중앙(Vertical Center)**에 위치하기를 원함. (현재는 `mt-8`로 상단 고정)
    2. **Horizontal Alignment**: 가로 정렬은 왼쪽(Left)을 유지해야 함. (현재 `justify-start`는 맞음)
  - **Action**:
    1. `Navbar.jsx`: `ul.menus` 클래스에서 `mt-8`을 제거하고 `my-auto`를 추가하여 Flex Column 내에서 상하 여백을 자동으로 균등 분배(Vertical Center).

## 3. Architecture Note

- **User Segregation**: 모든 Task는 `userId`를 기준으로 격리됩니다.
- **Components**:
  - `ItemPanel`: 메인 리스트 렌더링
  - `Modal`: 데이터 생성 (Create)
  - `authSlice`: 유저 인증 정보 관리
