# Task Checklist & Revision History

**[Latest Revision: v2.0_260205]**

## 0. Revision History (변경 이력)

프로젝트의 주요 변경 사항과 수정 이유(Why)를 기록합니다.

### v0.x: 초기 개발 및 기능 구현 (Past Sessions)

- **v0.1_260129 [Layout Animation]**:
  - **Why**: 사이드바 유무에 따라 대시보드가 자연스럽게 늘어나고 줄어드는 UX가 필요했음.
  - **What**: Sidebar 토글 시 Appbar와 Dashboard가 `100vh` 및 `width`를 유동적으로 차지하도록 애니메이션 적용.
- **v0.2_260130 [Responsive Layout]**:
  - **Why**: 태블릿 이하 환경에서 사이드바가 화면을 가리는 문제 해결.
  - **What**: 1024px 미만에서 사이드바 자동 숨김 처리 (`hidden` 클래스 토글).
- **v0.3_260130 [Dashboard Logic]**:
  - **Why**: 하드코딩된 `menuList.js` 데이터 대신 실제 DB 데이터를 보고 싶음.
  - **What**: `TargetReality.jsx`가 `table.sql` 기반의 실제 데이터를 Fetch 하도록 로직 수정.
- **v0.4_260203 [Async Interaction]**:
  - **Why**: 할 일 추가 시 페이지가 깜빡(Refresh)이는 경험이 매끄럽지 않음.
  - **What**: `ItemPanel.jsx`에서 아이템 추가 후 비동기로 리스트만 갱신하도록 개선.

### v1.0: 디자인 복구 (Session Start)

- **v1.0_260205 [Design Restoration]**:
  - **Why**: 리팩토링 과정에서 Item Card의 직관적인 디자인(제목/날짜 위치)이 훼손됨. 사용자는 이전의 디자인이 더 정보 전달력이 좋다고 판단.
  - **What**: `Item.jsx`의 Header(제목+날짜) 및 Footer(상태+액션) 레이아웃을 초기 버전으로 롤백 및 보정.

### v2.0: UX 고도화 (Current Session)

- **v2.0_260205 [Mini Sidebar & Mobile Opt]**:
  - **Why**: 데스크탑에서 사이드바가 완전히 사라지는 것보다, 아이콘만 남겨 브랜드 아이덴티티를 유지하고 싶음. 모바일에서는 상단이 너무 답답함.
  - **What**:
    1. **Mini Mode**: 80px 너비의 아이콘 전용 사이드바 구현.
    2. **Visual Fix**: 로고 50px 정렬 보정 및 인증 버튼 Hover UX(로그아웃 유도) 추가.
    3. **Mobile Opt**: Navbar 패딩 추가 및 `justify-start`로 답답한 레이아웃 해소.
    4. **Doc**: Better Comment 프로토콜 전수 적용.

---

## 1. Current Goal (v2.0)

사용자 UX 향상 및 유지보수 효율 증대를 위해 **Mini Sidebar 도입**, **모바일 레이아웃 최적화**, **Better Comment 주석 체계 정립**을 수행한다.

## 2. Detailed Requirements

### A. Sidebar Renovation (Mini Sidebar)

- [x] **Mini Mode 구현**: 데스크탑에서 사이드바를 완전히 숨기지 않고 80px(w-20) 너비로 유지.
- [x] **Toggle Logic 변경**: 플로팅 버튼 제거, 로고 클릭 시 확장 로직 구현.
- [x] **Content Adaptability**:
  - [x] Logo: 텍스트 숨김, 심볼 중앙 정렬 (50px Wrapper 적용).
  - [x] Menu: 텍스트 숨김, 아이콘 중앙 정렬.
  - [x] Auth: 텍스트 숨김, 아이콘 중앙 정렬.
- [x] **Interaction UX**: Mini Mode에서 `Hover` 시 'Logout 아이콘'으로 시각적 피드백 제공.

### B. Mobile/Tablet Optimization

- [x] **Navbar Padding 및 정렬**:
  - [x] `justify-between` -> `justify-start` 변경.
  - [x] `py-10 px-4` 패딩 추가.
  - [x] Auth Section `mt-auto` 적용.
- [x] **Item Card Responsive**:
  - [x] Grid Layout: 1열(Mobile) -> 2열(Tablet) -> 3열(Desktop).

### C. Maintenance & Documentation

- [x] **Better Comment Application**: `Navbar.jsx`, `Item.jsx`, `App.css` 변경 이력 기록.
- [x] **Standardization**: CSS 이중 주석 제거 및 표준 포맷 준수.
