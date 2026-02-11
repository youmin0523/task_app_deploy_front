# 📘 AICC 8 Deploy App (Personal Task Manager)

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen) ![Version](https://img.shields.io/badge/Version-2.2.0-blue) ![License](https://img.shields.io/badge/License-MIT-orange)

> **AICC 8 Deploy App**은 사용자의 생산성을 극대화하기 위해 설계된 **개인 일정 관리 웹 애플리케이션**입니다.
> 직관적인 UI/UX와 강력한 필터링 기능을 통해 할 일을 체계적으로 관리할 수 있으며, 구글 로그인을 통해 어디서든 자신의 데이터에 접근할 수 있습니다.

---

## 📌 목차 (Table of Contents)

1. [프로젝트 개요 (Overview)](#1-프로젝트-개요-overview)
2. [주요 기능 (Key Features)](#2-주요-기능-key-features)
3. [기술 스택 (Tech Stack)](#3-기술-스택-tech-stack)
4. [시스템 아키텍처 (System Architecture)](#4-시스템-아키텍처-system-architecture)
5. [데이터베이스 스키마 (Database Schema)](#5-데이터베이스-스키마-database-schema)
6. [설치 및 실행 가이드 (Installation & Run)](#6-설치-및-실행-가이드-installation--run)
7. [폴더 구조 (Directory Structure)](#7-폴더-구조-directory-structure)
8. [API 명세 (API Specification)](#8-api-명세-api-specification)

---

## 1. 프로젝트 개요 (Overview)

이 프로젝트는 **React** 프론트엔드와 **Express.js** 백엔드, **PostgreSQL** 데이터베이스로 구성된 풀스택 웹 애플리케이션입니다.

현대적인 웹 디자인 트렌드인 **다크 모드(Dark Mode)**를 기본 테마로 채택하였으며, **반응형 웹 디자인(Responsive Web Design)**을 적용하여 모바일 환경에서도 최적화된 화면을 제공합니다.
또한 **Redux Toolkit**을 활용한 전역 상태 관리로 매끄러운 사용자 경험을 제공합니다.

---

## 2. 주요 기능 (Key Features)

**[Latest Revision Details: v2.10_260211]**
사용자 피드백을 반영하여 레이아웃 및 UX가 대폭 개선되었습니다.

### 2.1 Authentication (사용자 인증)

- **Google 소셜 로그인**: 별도의 회원가입 없이 `@react-oauth/google`을 활용한 원클릭 로그인.
- **데이터 격리 (Data Isolation)**: **[핵심]** 로그인한 사용자(`userId`)별로 할 일 데이터가 DB에서 완벽하게 격리되어 조회됩니다.
- **Auto Session**: Redux와 LocalStorage를 연동하여 새로고침 후에도 로그인 상태를 유지합니다.

### 2.2 Navigation & Layout (네비게이션 및 레이아웃)

- **Responsive Sidebar Architecture**:
  - **Desktop (Expanded)**: 288px 너비, 메뉴명 + 아이콘 표시.
  - **Desktop (Collapsed)**: 80px 너비, 아이콘만 중앙 정렬(Center Aligned).
  - **Mobile**: 1024px 미만에서 Drawer 메뉴로 전환 (Overlay 백그라운드 적용).
- **Advanced Alignment**:
  - **Vertical Center**: 사이드바 메뉴 리스트가 화면의 수직 중앙(`my-auto`)에 위치하도록 Flexbox 정렬 최적화.
  - **Logo Wrapper**: 로고 디자인(Visual Fix)을 위해 `div` 래퍼를 적용하여 정렬 깨짐 방지.
- **Flex Layout Strategy**: `flex-1` 속성을 메인 패널에 적용하여, 사이드바의 상태 변화에도 부드럽게 반응하며 화면을 가득 채웁니다.
- **Mobile Experience (New)**:
  - **Header Hover Popups**: 1024px 이하 헤더 아이콘(Today/Tomorrow)에 마우스 오버 시 할 일 목록 팝업이 표시되어 빠른 확인이 가능합니다.
  - **Safe Logout Protocol**: 로그아웃 시 즉시 실행되지 않고, 전용 모달(Dark Modal)을 통해 사용자의 의사를 재확인하는 안전장치를 제공합니다.

### 2.3 Task Management (업무 관리)

- **CRUD Operations**:
  - **Create**: 모달(Modal) 창을 통한 간편한 할 일 등록.
  - **Read**: 생성일 역순으로 정렬된 리스트 조회 및 `Skeleton` 로딩 애니메이션.
  - **Update**: 제목, 내용, 날짜 등 상세 정보 수정.
  - **Delete**: 실수 방지를 위한 컨펌(Confirm) 팝업 후 영구 삭제.
- **Status Toggle**: 리스트 상에서 '완료/미완료' 버튼 클릭 한 번으로 상태를 즉시 변경합니다.
- **Visual Feedback**: 중요(Important) 태그, 완료(Completed) 색상 토글 등 직관적인 피드백 제공.

### 2.4 Filtering Views (조회 필터)

URL 라우팅이 아닌 상태 기반 필터링으로 즉각적인 화면 전환을 제공합니다.

1. **Home (All)**: 모든 상태의 업무 조회.
2. **Completed**: 완료 처리된 업무만 모아보기.
3. **Proceeding**: 아직 완료되지 않은 진행 중 업무만 모아보기.
4. **Important**: '중요' 태그가 붙은 긴급 업무만 모아보기.

---

## 3. 기술 스택 (Tech Stack)

### 🖥️ Frontend

| 기술              | 사용 목적                                          |
| :---------------- | :------------------------------------------------- |
| **React (Vite)**  | 컴포넌트 기반 UI 구축 및 빠른 렌더링 속도 확보     |
| **Redux Toolkit** | 전역 상태 관리 (Auth, Modal, **Sidebar UI State**) |
| **TailwindCSS**   | 유틸리티 퍼스트 CSS 프레임워크로 신속한 스타일링   |
| **React Router**  | SPA(Single Page Application) 라우팅 처리           |
| **React Icons**   | 직관적인 아이콘 사용을 통한 UX 향상                |

### ⚙️ Backend

| 기술                   | 사용 목적                                           |
| :--------------------- | :-------------------------------------------------- |
| **Node.js**            | Chrome V8 자바스크립트 엔진 기반 서버 런타임        |
| **Express.js**         | RESTful API 서버 구축을 위한 웹 프레임워크          |
| **PostgreSQL**         | 데이터 무결성을 보장하는 강력한 관계형 데이터베이스 |
| **node-postgres (pg)** | Node.js와 PostgreSQL 간의 비동기 통신               |
| **Cors**               | 교차 출처 리소스 공유(CORS) 허용 설정               |

---

## 4. 시스템 아키텍처 (System Architecture)

상세한 시스템 아키텍처 및 데이터 흐름도는 **[ARCHITECTURE.md](./ARCHITECTURE.md)** 파일에 별도로 기술되어 있습니다.

- [x] **System Architecture Diagram** (Mermaid)
- [x] **Data Flow Analysis** (Variable Lifecycle)
- [x] **Execution Flow Map** (Critical Path)
- [x] **Sequence Diagram** (User Interaction Flow)

---

---

## 5. 데이터베이스 스키마 (Database Schema)

PostgreSQL의 `tasks` 테이블 구조입니다.

| 컬럼명 (Column) | 데이터 타입 (Type) | 제약조건 (Constraints) | 설명 (Description)                   |
| :-------------- | :----------------- | :--------------------- | :----------------------------------- |
| **\_id**        | `TEXT`             | `PRIMARY KEY`          | UUID v4 형식을 사용하는 고유 식별자  |
| **title**       | `TEXT`             | `NOT NULL`             | 할 일 제목                           |
| **description** | `TEXT`             | `NOT NULL`             | 할 일 상세 설명                      |
| **date**        | `TEXT`             | `NOT NULL`             | 마감 날짜 (YYYY-MM-DD)               |
| **isCompleted** | `BOOLEAN`          | `DEFAULT false`        | 완료 여부                            |
| **isImportant** | `BOOLEAN`          | `DEFAULT false`        | 중요 여부                            |
| **userId**      | `TEXT`             | `NOT NULL`             | 사용자 구글 고유 ID (Sub)            |
| **created_at**  | `TIMESTAMP`        | `DEFAULT NOW()`        | 생성 일시                            |
| **updated_at**  | `TIMESTAMP`        | `DEFAULT NOW()`        | 마지막 수정 일시 (Trigger 자동 갱신) |

---

## 6. 설치 및 실행 가이드 (Installation & Run)

이 프로젝트를 로컬 환경에서 실행하기 위한 단계별 가이드입니다.

### 사전 요구사항 (Prerequisites)

- Node.js (v14 이상 권장)
- PostgreSQL 설치 및 실행 중일 것

### Step 1. 프로젝트 클론

```bash
git clone <repository-url>
cd aicc8_deploy_app
```

### Step 2. 데이터베이스 설정

PostgreSQL에 접속하여 데이터베이스와 테이블을 생성합니다.
(자세한 쿼리는 `/back/database/database.sql` 파일 참조)

```sql
CREATE DATABASE aicc8_todo;
-- 이후 해당 DB에 접속하여 tasks 테이블 생성
```

### Step 3. Backend 설정 및 실행

`back` 디렉토리로 이동하여 필요한 패키지를 설치하고 환경 변수를 설정합니다.

⚠️ **주의**: `.env` 파일에는 실제 비밀번호와 키 값이 포함되므로 **절대 깃허브에 커밋하지 마세요.** (이미 `.gitignore`에 설정되어 있습니다.)

```bash
cd back

# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
# 루트 경로에 .env 파일을 생성하고 아래 내용을 복사하여 본인의 환경에 맞게 입력하세요.
# (대괄호 <> 부분은 실제 값으로 변경해야 합니다)

PORT=8000
DB_USER=<YOUR_DB_USERNAME>
DB_HOST=localhost
DB_DATABASE=aicc8_todo
DB_PASSWORD=<YOUR_DB_PASSWORD>
DB_PORT=5432

# 3. 서버 실행
npm start
# 정상 실행 시: "Server is Running on port 8000" 로그 확인
```

### Step 4. Frontend 설정 및 실행

```bash
cd front

# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
# http://localhost:5173 접속
```

---

## 7. 폴더 구조 (Directory Structure)

```
aicc8_deploy_app/
├── 📂 back/                  # Backend Root
│   ├── 📂 controllers/       # 비즈니스 로직 (요청 처리 및 응답)
│   ├── 📂 database/          # DB 연결 설정 및 SQL 스쿼리 파일
│   ├── 📂 routes/            # API 라우팅 정의
│   ├── 📄 index.js           # Express 서버 엔트리 포인트
│   └── 📄 .env               # 환경 변수 (Git 제외)
│
├── 📂 front/                 # Frontend Root
│   ├── 📂 src/
│   │   ├── 📂 components/    # 재사용 컴포넌트 (ItemPanel, Sidebar 등)
│   │   ├── 📂 redux/         # Redux Slices (authSlice, taskSlice 등)
│   │   ├── 📄 App.jsx        # 메인 라우터 및 레이아웃
│   │   └── 📄 main.jsx       # React DOM 렌더링 엔트리
│   └── 📄 index.html         # HTML 템플릿
│
└── 📄 readme.md              # 프로젝트 설명서
```

---

## 8. API 명세 (API Specification)

자세한 API 요청 및 응답 규격은 [api_spec.md](./api_spec.md) 파일을 참고하세요.
