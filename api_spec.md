# 📡 API Specification v1.0

AICC 8 Deploy App의 Back-end API 명세서입니다.
모든 API는 RESTful 원칙을 준수하며, JSON 형식으로 데이터를 주고받습니다.

---

## 🔖 목차 (Table of Contents)

1. [기본 정보 (General Info)](#1-기본-정보-general-info)
2. [Task API 명세](#2-task-api-명세)
   - [2.1 할 일 목록 조회 (GET)](#21-할-일-목록-조회-get-tasks)
   - [2.2 할 일 생성 (POST)](#22-할-일-생성-create-task)
   - [2.3 할 일 전체 수정 (PUT)](#23-할-일-전체-수정-update-task-fully)
   - [2.4 할 일 상태 부분 수정 (PATCH)](#24-할-일-상태-부분-수정-update-task-status)
   - [2.5 할 일 삭제 (DELETE)](#25-할-일-삭제-delete-task)

---

## 1. 기본 정보 (General Info)

### 🔗 Base URL

- Local Development: `http://localhost:8000`

### 📦 Content-Type

- Requests: `application/json`
- Responses: `application/json`

### 🚦 HTTP Status Codes

| 코드  | 상태 (Status)             | 설명 (Description)                                 |
| :---- | :------------------------ | :------------------------------------------------- |
| `200` | **OK**                    | 요청이 성공적으로 처리되었습니다.                  |
| `201` | **Created**               | 새 리소스가 성공적으로 생성되었습니다.             |
| `400` | **Bad Request**           | 잘못된 요청입니다 (파라미터 누락, 타입 불일치 등). |
| `404` | **Not Found**             | 요청한 리소스(URL 또는 데이터)를 찾을 수 없습니다. |
| `500` | **Internal Server Error** | 서버 내부 오류가 발생했습니다.                     |

---

## 2. Task API 명세

### 2.1 할 일 목록 조회 (Get Tasks)

특정 사용자의 모든 할 일 목록을 불러옵니다. **생성일(created_at) 내림차순**으로 정렬되어 최신 글이 먼저 조회됩니다.

- **URL**: `/get_tasks/:userId`
- **Method**: `GET`
- **Auth**: Required (Implicit via `userId`)

#### 🔹 Request Parameter (Path Variable)

| 파라미터명 | 타입     | 필수 여부 | 설명                                                                                              |
| :--------- | :------- | :-------: | :------------------------------------------------------------------------------------------------ |
| `userId`   | `string` |  **Yes**  | Google OAuth를 통해 획득한 사용자 고유 ID (`sub` 값). **데이터 격리(Isolation)의 핵심 키**입니다. |

#### ✅ Success Response (200 OK)

```json
[
  {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "리액트 컴포넌트 설계",
    "description": "재사용 가능한 버튼 컴포넌트 만들기",
    "date": "2024-05-20",
    "isCompleted": false,
    "isImportant": true,
    "userId": "google-oauth2|123456789",
    "created_at": "2024-05-01T09:00:00.000Z",
    "updated_at": "2024-05-01T09:00:00.000Z"
  },
  {
    "_id": "770e8400-e29b-41d4-a716-446655441111",
    "title": "데이터베이스 백업",
    "description": "매주 금요일 정기 백업 수행",
    "date": "2024-05-19",
    "isCompleted": true,
    "isImportant": false,
    "userId": "google-oauth2|123456789",
    "created_at": "2024-04-30T15:30:00.000Z",
    "updated_at": "2024-05-19T10:00:00.000Z"
  }
]
```

#### ❌ Error Response (500 Server Error)

```json
{
  "message": "Get tasks Error: [Database connection error details...]"
}
```

---

### 2.2 할 일 생성 (Create Task)

새로운 할 일을 생성합니다. Primary Key인 `_id`는 서버 측에서 UUID 라이브러리를 사용해 자동 생성됩니다.

- **URL**: `/post_task`
- **Method**: `POST`

#### 🔹 Request Body

| 필드명        | 타입      | 필수 여부 | 설명                          |
| :------------ | :-------- | :-------: | :---------------------------- |
| `title`       | `string`  |  **Yes**  | 할 일 제목                    |
| `description` | `string`  |    No     | 상세 내용 (빈 값 허용)        |
| `date`        | `string`  |  **Yes**  | 목표 날짜 (YYYY-MM-DD 형식)   |
| `isCompleted` | `boolean` |  **Yes**  | 완료 여부 초기값 (보통 false) |
| `isImportant` | `boolean` |  **Yes**  | 중요 여부 초기값              |
| `userId`      | `string`  |  **Yes**  | 작성자의 Google ID            |

#### 📝 Example Request

```json
{
  "title": "API 문서 작성하기",
  "description": "Swagger 또는 Markdown을 이용하여 API 명세서 작성",
  "date": "2024-06-01",
  "isCompleted": false,
  "isImportant": true,
  "userId": "google-oauth2|123456789"
}
```

#### ✅ Success Response (201 Created)

```json
{
  "msg": "Task Create Successfully"
}
```

---

### 2.3 할 일 전체 수정 (Update Task Fully)

기존 할 일의 모든 필드(제목, 내용, 날짜, 중요도, 완료여부)를 한 번에 덮어씌웁니다.

- **URL**: `/update_task`
- **Method**: `PUT`

#### 🔹 Request Body

| 필드명        | 타입      | 필수 여부 | 설명               |
| :------------ | :-------- | :-------: | :----------------- |
| `_id`         | `string`  |  **Yes**  | 수정할 대상의 UUID |
| `title`       | `string`  |  **Yes**  | 수정할 제목        |
| `description` | `string`  |  **Yes**  | 수정할 내용        |
| `date`        | `string`  |  **Yes**  | 수정할 날짜        |
| `isCompleted` | `boolean` |  **Yes**  | 수정할 완료 상태   |
| `isImportant` | `boolean` |  **Yes**  | 수정할 중요 상태   |

#### ✅ Success Response (200 OK)

```json
{
  "msg": "Task Updated Successfully"
}
```

---

### 2.4 할 일 상태 부분 수정 (Update Task Status)

할 일의 **완료 상태(`isCompleted`)** 만을 빠르고 가볍게 변경할 때 사용합니다. (토글 기능 등)

- **URL**: `/update_completed_task`
- **Method**: `PATCH`

#### 🔹 Request Body

| 필드명        | 타입      | 필수 여부 | 설명                                                                |
| :------------ | :-------- | :-------: | :------------------------------------------------------------------ |
| `itemId`      | `string`  |  **Yes**  | 수정할 대상의 UUID (**주의**: 필드명이 `_id`가 아닌 `itemId`입니다) |
| `isCompleted` | `boolean` |  **Yes**  | 변경할 `true` 또는 `false` 값                                       |

#### 📝 Example Request

```json
{
  "itemId": "550e8400-e29b-41d4-a716-446655440000",
  "isCompleted": true
}
```

#### ✅ Success Response (200 OK)

```json
{
  "msg": "Update Completed Task Successfully"
}
```

---

### 2.5 할 일 삭제 (Delete Task)

특정 할 일을 데이터베이스에서 영구 삭제합니다.

- **URL**: `/delete_task/:itemId`
- **Method**: `DELETE`

#### 🔹 Request Parameter (Path Variable)

| 파라미터명 | 타입     | 필수 여부 | 설명               |
| :--------- | :------- | :-------: | :----------------- |
| `itemId`   | `string` |  **Yes**  | 삭제할 대상의 UUID |

#### ✅ Success Response (200 OK)

```json
{
  "msg": "Task Deleted Successfully"
}
```

#### ❌ Error Response (500 Server Error)

```json
{
  "msg": "Delete Task Error: [Error Message]"
}
```

---

## 🚦 3. UI Event 연동 가이드 (UI Trigger Mapping)

프론트엔드 UI 요소와 API 간의 연쇄 반응 정의입니다.

| UI 요소 (Element)           | 액션 (Action)     | 트리거 API (Triggered API)     | 비고 (Note)                                           |
| :-------------------------- | :---------------- | :----------------------------- | :---------------------------------------------------- |
| **Navbar (Today/Tomorrow)** | 체크박스 클릭     | `PATCH /update_completed_task` | 팝업/사이드바 내에서 즉시 상태 변경                   |
| **Navbar (Today/Tomorrow)** | 중요도(Dot) 클릭  | `PUT /update_task`             | `isImportant` 필드만 반전하여 전체 업데이트 요청      |
| **Logout Button**           | 클릭 -> 모달 확인 | (Front-end Auth Logout)        | API 호출 없이 Redux State 초기화 및 로컬스토리지 청소 |
| **Item Card**               | Detail/Edit 클릭  | (Modal State Open)             | 특정 `itemId`의 상세 정보를 모달에 주입               |
| **Modal (AddItem)**         | '추가하기' 클릭   | `POST /post_task`              | 생성 성공 시 `GET /get_tasks` 자동 갱신(Re-fetch)     |
