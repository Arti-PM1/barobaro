# DESIGN_GUIDE.md

이 문서는 프로젝트의 일관된 UI/UX를 유지하고, 개발자와 디자이너 간의 원활한 협업을 위한 디자인 시스템 가이드입니다. 모든 스타일은 **Tailwind CSS** 클래스를 기준으로 정의합니다.

---

## 1. Layout Policy (레이아웃 원칙)

우리 서비스의 모든 페이지는 **Fluid Layout**을 기본 원칙으로 합니다.

- **기본 원칙**: 화면 너비를 100% 사용하여 어떤 해상도에서도 콘텐츠를 명확하게 표시합니다.
- **지양 패턴**: 특정 페이지에서 `max-width`를 설정하고 `margin: 0 auto`를 통해 가운데 정렬하는 방식은 사용하지 않습니다. 이는 사용자에게 일관되지 않은 경험을 제공할 수 있습니다.
- **전역 패딩 (Global Padding)**: 모든 페이지의 좌우에 일관된 여백을 주어 콘텐츠의 가독성을 확보합니다.
  - **Class**: `px-8` (32px)
  - **예시**:
    ```html
    <main class="w-full px-8">
      <!-- Page Content -->
    </main>
    ```

---

## 2. Color Palette & Status (색상 및 상태)

`tailwind.config.js`에 정의된 커스텀 색상과 애플리케이션 전반에서 사용되는 표준 색상 팔레트입니다.

### 주요 색상 (Primary Colors)

| 사용처 | Tailwind Class | Hex Code | 설명 |
| --- | --- | --- | --- |
| 배경 (기본) | `bg-white` | `#FFFFFF` | 콘텐츠 영역의 기본 배경색 |
| 배경 (보조) | `bg-google-grey` | `#F8F9FA` | 구분되는 섹션, 카드 등의 배경 |
| 텍스트 (제목) | `text-gray-900` | `#111827` | 주요 제목 및 강조 텍스트 |
| 텍스트 (본문) | `text-google-text` | `#202124` | 일반적인 본문 텍스트 |
| 텍스트 (보조) | `text-gray-500` | `#6B7280` | 보조 설명, 플레이스홀더 등 |
| 주요 버튼/액센트 | `bg-black` | `#000000` | Primary Button 배경색 |
| 테두리 | `border-gray-200` | `#E5E7EB` | 카드, 인풋 등의 기본 테두리색 |

### 상태 및 액센트 색상 (Status & Accent Colors)

업무 상태(Status)를 나타내는 태그 또는 중요 액센트에 사용되는 색상 조합입니다.

| 상태 (Status) | 배경색 Class | 글자색 Class | Hex (배경) |
| --- | --- | --- | --- |
| 요청됨 (Requested) | `bg-gray-100` | `text-gray-800` | `#F3F4F6` |
| 진행 중 (WIP) | `bg-blue-100` | `text-blue-800` | `#DBEAFE` |
| 검토/승인 (Checked) | `bg-purple-100`| `text-purple-800`| `#EDE9FE` |
| 완료 (Done) | `bg-green-100` | `text-green-800` | `#D1FAE5` |
| *우선순위 높음* | `bg-red-100` | `text-red-800` | `#FEE2E2` |

*참고: 위 표는 일반적인 태그 스타일에 대한 제안이며, `constants.ts`의 `dotColor`는 칸반 보드 컬럼 헤더의 점(dot) 색상(`bg-gray-400`, `bg-blue-500` 등)을 나타냅니다.*

---

## 3. Spacing & Grid (간격 및 그리드)

모든 여백과 크기는 **4px 그리드 시스템**을 따릅니다. (예: `gap-2` = 8px)

| 구분 | Tailwind Class | 크기 | 사용처 |
| --- | --- | --- | --- |
| 섹션 간격 | `gap-8` | 32px | 칸반 보드의 컬럼 사이 간격 |
| 페이지 패딩 | `p-8` / `px-8` | 32px | 페이지 좌우, 상하 기본 여백 |
| 카드 내부 패딩 | `p-4` or `p-6` | 16px or 24px | 컴포넌트 내부 콘텐츠 여백 |
| 컴포넌트 그룹 간격 | `gap-4` | 16px | 버튼 그룹, 인풋 그룹 사이 |
| 아이템 간격 | `gap-2` | 8px | 아이콘과 텍스트, 작은 요소 사이 |

---

## 4. Typography (타이포그래피)

폰트는 **Pretendard**를 기본으로 사용합니다. (`font-sans`)

| 구분 | Tailwind Class | 폰트 크기 / 줄간격 | 굵기 |
| --- | --- | --- | --- |
| H1 (페이지 제목) | `text-2xl` | 24px / 32px | `font-bold` (700) |
| H2 (섹션 제목) | `text-lg` | 18px / 28px | `font-semibold` (600) |
| Body (본문) | `text-base` | 16px / 24px | `font-normal` (400) |
| Body (보조) | `text-sm` | 14px / 20px | `font-normal` (400) |
| Button / Tab | `text-sm` | 14px / 20px | `font-medium` (500) |
| Caption / Meta | `text-xs` | 12px / 16px | `font-normal` (400) |

---

## 5. Components (컴포넌트)

재사용 가능한 컴포넌트의 기본 스타일입니다.

### 버튼 (Button)

- **Primary Button** (`.btn-primary`):
  - `bg-black hover:bg-gray-800 text-white`
  - `px-6 py-2.5`
  - `rounded-full`
  - `shadow-md hover:shadow-lg`
- **Secondary Button** (`.btn-secondary`):
  - `bg-white hover:bg-gray-50 border border-gray-300`
  - `px-4 py-2`
  - `rounded-lg`

### 카드 (Card)

- `bg-white`
- `border border-gray-200`
- `rounded-xl` (12px)
- `shadow-sm` (미세한 그림자)

### 인풋 (Input) & 텍스트 영역 (Textarea)

- `bg-white`
- `border border-gray-300 focus:border-google-blue focus:ring-2 focus:ring-blue-100`
- `rounded-lg` (8px)
- `p-3`

### 스크롤바 (Scrollbar)

현재 커스텀 스크롤바 스타일이 정의되어 있지 않으며, 브라우저 기본값을 사용합니다. 추후 필요시 아래와 같은 Tailwind 플러그인을 사용하여 커스텀할 수 있습니다.
- `tailwind-scrollbar`