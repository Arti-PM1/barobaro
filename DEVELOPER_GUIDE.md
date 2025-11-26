# Nexus AI Developer Guide

본 문서는 Nexus AI 프로젝트의 아키텍처, 폴더 구조, 그리고 개발 규칙을 설명합니다.
본 프로젝트는 **"Vite + React Standard Architecture"**를 따르며, 유지보수성과 확장성을 최우선으로 설계되었습니다.

## 🏗 1. 프로젝트 구조 (Project Structure)

```
/
├── components/        # UI 컴포넌트 (재사용 가능)
│   ├── Layout.tsx     # 전역 레이아웃 (사이드바, 네비게이션)
│   ├── Kanban.tsx     # 칸반 보드 메인 (TaskCard, Column, Toolbar 조합)
│   ├── TaskCard.tsx   # 개별 업무 카드 컴포넌트
│   ├── KanbanColumn.tsx  # 칸반 컬럼 및 드래그앤드롭 영역
│   ├── KanbanToolbar.tsx # 필터, 검색, 정렬 툴바
│   ├── Insights.tsx   # 팀 인사이트 대시보드 (KPI 및 차트)
│   ├── SettingsPage.tsx # 문서 허브 및 설정 페이지
│   ├── AIModal.tsx    # AI 분석 및 상세 모달
│   ├── GeminiPage.tsx # 독립된 AI 채팅 페이지
│   ├── Icons.tsx      # 아이콘 모음 (Lucide wrapper)
│   └── AIViews.tsx    # 모달 내부의 탭별 서브 뷰 (Draft, Strategy 등)
├── services/          # 비즈니스 로직 및 API 호출 계층
│   ├── geminiService.ts # Google GenAI API 연동 로직
│   ├── taskService.ts   # 업무 데이터 CRUD (LocalStorage 연동)
│   └── prompts.ts       # AI 프롬프트 템플릿 관리
├── utils/             # 순수 유틸리티 함수
│   ├── taskHelpers.ts   # 정렬, 필터링 등 데이터 가공 로직
│   └── formatters.ts    # 날짜 포맷팅 등 공통 유틸리티
├── types.ts           # 전역 타입 정의 (Interface, Enum)
├── constants.ts       # 상수, Mock 데이터, 환경 설정
├── App.tsx            # 라우팅 및 상태 조합 (Composition Root)
└── index.css          # 전역 스타일 및 Tailwind 설정
```

## 🧩 2. 핵심 아키텍처 패턴

### A. 관심사의 분리 (Separation of Concerns)
*   **UI Components**: 오직 렌더링과 사용자 이벤트 처리만 담당합니다. `Kanban.tsx`를 `TaskCard`, `Column`, `Toolbar`로 분리하여 유지보수성을 높였습니다.
*   **Services**: 데이터 페칭, AI 호출, 상태 변경 로직을 캡슐화합니다. 현재는 `localStorage`를 사용하여 백엔드 없이 데이터 영속성을 보장합니다.
*   **Types**: 데이터 모델(`Task`, `User` 등)은 `types.ts`에서 중앙 관리하여 순환 참조를 방지합니다.

### B. 프롬프트 엔지니어링 관리 (Prompt Management)
*   `services/prompts.ts` 파일에서 모든 프롬프트를 관리합니다.
*   '문서 허브(SettingsPage)' 기능은 이 파일을 동적으로 분석하여 개발자가 언제든 최신 프롬프트 명세를 다운로드할 수 있도록 지원합니다.

### C. 스타일링 전략 (Styling Strategy)
*   **Tailwind CSS**: 유틸리티 클래스를 사용하여 빠르게 스타일링합니다.
*   **Design System**: `index.css`와 `DESIGN_SYSTEM.md`에 정의된 컬러 팔레트와 타이포그래피 규칙(Pretendard, Inter)을 준수합니다.

## 💻 3. 개발 규칙 (Conventions)

### Naming
*   **Components**: PascalCase (예: `KanbanBoard.tsx`)
*   **Functions/Variables**: camelCase (예: `handleTaskClick`, `isLoading`)
*   **Interfaces**: PascalCase (예: `Task`, `AIAnalysis`)
*   **Constants**: UPPER_SNAKE_CASE (예: `MAX_TOKENS`, `INITIAL_TASKS`)

### State Management
*   로컬 UI 상태는 `useState`를 사용합니다.
*   전역 데이터는 `App.tsx`가 `taskService`를 통해 로드하고 하위 컴포넌트에 전달하는 방식을 사용합니다.
*   `taskService` 내부적으로 `localStorage`를 사용하여 데이터의 생성, 수정, 삭제를 브라우저에 영구 저장합니다.

### AI Integration Rules
*   `@google/genai` SDK를 사용합니다.
*   API 키는 반드시 `process.env.API_KEY`를 통해 접근합니다.
*   `Insights.tsx`에서는 페이지 로드 시 자동으로 AI 분석을 실행하며, 로딩 중에는 스켈레톤 UI를 표시하여 사용자 경험을 최적화합니다.

## 🔄 4. 데이터 흐름 (Data Flow Example: Insights)

1.  **Page Load**: 사용자가 '인사이트' 메뉴 클릭 시 `Insights.tsx` 마운트.
2.  **Effect**: `useEffect`에서 `getWeeklyInsight` 호출.
3.  **Service**: `geminiService`가 현재 태스크 목록(`tasks`)과 통계 데이터를 취합.
4.  **API Call**: Google Gemini로 분석 프롬프트 전송.
5.  **Response**: AI가 생성한 분석 텍스트 반환.
6.  **UI Update**: 스켈레톤 UI가 사라지고 분석 결과 표시.

---
문서 업데이트 날짜: 2025-11-22
