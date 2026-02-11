# Task: 투두 리스트 렌더링 및 레이아웃 최적화

## Revision History

**[Current Revision: v2.7_260211]**

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
