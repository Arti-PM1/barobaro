
import { Task } from "../types";

// --- Type Definitions ---

export interface AIFeature {
  id: string;
  name: string;
  description: string;
  model: string;
  tags: string[];
  // Function to generate the prompt string. Context type varies by feature.
  promptGenerator: (...args: any[]) => string; 
}

/**
 * Centralized AI Features Registry
 * This is the Single Source of Truth (SSOT) for both application logic and documentation.
 */
export const AI_FEATURES: AIFeature[] = [
  {
    id: 'draftTask',
    name: '스마트 업무 초안 (Smart Draft)',
    description: '사용자의 거친 아이디어를 분석하여 표준, 상세, 간결 등 3가지 스타일의 전문적인 업무 명세서를 제안합니다.',
    model: 'gemini-pro',
    tags: ['Creation', 'Drafting'],
    promptGenerator: (rawInput: string) => `
      당신은 IT 선도 기업의 수석 PM(Project Manager)입니다.
      사용자가 입력한 거친(Rough) 업무 아이디어를 분석하여, 개발팀이나 디자인팀이 즉시 착수할 수 있는 "전문적인 업무 명세서" 초안을 3가지 스타일로 제안하세요.

      [입력 메시지]
      "${rawInput}"
      
      [작성 지침]
      다음 3가지 스타일의 옵션을 포함한 리스트를 생성하세요:
      1. "표준(Standard)": 균형 잡힌 전문적인 스타일.
      2. "상세(Detailed)": 배경, 상세 요건, 기대 효과 등을 매우 구체적으로 기술.
      3. "간결(Concise)": 핵심만 빠르게 파악할 수 있는 요약 스타일.

      각 항목은 다음 필드를 포함해야 합니다:
      - title: 명확하고 전문적인 제목 (한국어)
      - description: 스타일(표준/상세/간결)에 맞춘 상세 설명 (한국어, 줄바꿈 포함)
      - priority: 'HIGH', 'MEDIUM', 'LOW' 중 택1
      - product: 제품군 추론
      - type: 업무 유형 (버그, 기능, UX 등)
      - styleTag: "표준", "상세", "간결" 중 하나

      응답은 JSON 배열(Array)이어야 합니다.
    `
  },
  {
    id: 'analyzeTask',
    name: '전략 분석 (Strategy Analysis)',
    description: '업무의 핵심 맥락을 분석하고, 실행을 위한 단계별 가이드와 예상 리스크를 도출합니다.',
    model: 'gemini-pro',
    tags: ['Analysis', 'Strategy'],
    promptGenerator: (task: Task) => `
      당신은 시니어 프로젝트 매니저이자 기술 튜터입니다.
      다음 업무를 분석하여 실무자가 **가장 먼저 파악해야 할 핵심 지식(Context)**과 **구체적인 실행 전략**을 제시하세요.

      [업무 정보]
      제목: ${task.title}
      제품: ${task.product}
      설명: ${task.description}
      
      [요청 사항]
      1. strategy 필드에는 다음 내용을 마크다운 형식으로 작성하세요:
         - 🧐 **핵심 파악 사항**: 이 업무를 시작하기 전 반드시 알아야 할 개념, 기술 스택, 혹은 비즈니스 맥락. (1차적으로 무엇을 알아야 하는지)
         - 🚀 **단계별 실행 가이드**: 구체적인 Action Item 기반의 전략.
         - 💡 **성공 팁**: 예상되는 어려움이나 효율성을 높이는 팁.
         - ⚠️ **리스크 요인**: 발생 가능한 잠재적 문제와 대응 방안.
      
      2. suggestedResources 필드에는 업무와 관련된 양질의 학습 자료(문서, 블로그 등) 2개를 추천하세요.
      
      모든 응답은 "한국어"로 작성해주세요.
    `
  },
  {
    id: 'generateSubtasks',
    name: '하위 업무 생성 (Subtask Breakdown)',
    description: '하나의 큰 업무를 실행 가능한 단위의 체크리스트(4~6개)로 자동 분해합니다.',
    model: 'gemini-pro',
    tags: ['Planning', 'Breakdown'],
    promptGenerator: (task: Task) => `
      다음 업무를 4-6개의 실행 가능한 체크리스트 항목(하위 업무)으로 분해해주세요.
      업무: ${task.title}
      문맥: ${task.description}
      응답은 한국어 JSON 배열입니다.
    `
  },
  {
    id: 'generateAcceptanceCriteria',
    name: '완료 조건 생성 (DoD Generator)',
    description: 'QA 및 배포를 위해 업무가 충족해야 할 구체적인 검증 기준(DoD)을 생성합니다.',
    model: 'gemini-pro',
    tags: ['QA', 'Validation'],
    promptGenerator: (task: Task) => `
      다음 업무가 QA를 통과하고 배포되기 위한 '완료 조건(Acceptance Criteria)'을 불렛 포인트 리스트로 작성해주세요.
      
      [업무 정보]
      제목: ${task.title}
      설명: ${task.description}
      
      응답은 한국어 문자열 배열(JSON Array of strings)이어야 합니다.
    `
  },
  {
    id: 'generateSolutionDraft',
    name: '솔루션 초안 작성 (Solution Draft)',
    description: '기능 구현을 위한 기술적인 접근 방식, 코드 스니펫 또는 문서 초안을 마크다운으로 작성합니다.',
    model: 'gemini-pro',
    tags: ['Engineering', 'Solution'],
    promptGenerator: (task: Task) => `
      당신은 수석 엔지니어입니다. 다음 업무를 구현하기 위한 기술적인 솔루션 초안을 마크다운 형식으로 작성해주세요.
      필요하다면 코드 스니펫(Code Snippet)이나 아키텍처 설명을 포함하세요.
      
      [업무 정보]
      제목: ${task.title}
      설명: ${task.description}
      기술 스택: React, TypeScript, Tailwind CSS
      
      응답은 마크다운 텍스트로만 작성해주세요.
    `
  },
  {
    id: 'recommendResources',
    name: '학습 자료 추천 (Resource Recommender)',
    description: '업무 해결에 도움이 되는 최신 기술 문서, 블로그, 튜토리얼 링크를 추천합니다.',
    model: 'gemini-pro',
    tags: ['Learning', 'Research'],
    promptGenerator: (task: Task) => `
      다음 업무와 관련된 양질의 학습 자료(기술 문서, 공식 가이드, 튜토리얼) 3가지를 추천해주세요.
      
      [업무 정보]
      제목: ${task.title}
      설명: ${task.description}
      
      응답은 다음 필드를 가진 JSON 배열이어야 합니다:
      - title: 자료 제목
      - url: 링크 (실제 존재하는 URL이거나 검색 가능한 키워드 기반의 가상의 URL)
      - description: 추천 이유 (한 줄 요약)
    `
  },
  {
    id: 'chatGuideSystem',
    name: 'AI 가이드 시스템 프롬프트',
    description: '업무 컨텍스트를 기반으로 사용자 질문에 답변하는 AI 어시스턴트의 페르소나를 정의합니다.',
    model: 'gemini-pro',
    tags: ['Chat', 'System'],
    promptGenerator: (contextTask: Task) => 
      `System: 당신은 다음 업무를 돕는 친절한 어시스턴트입니다. 제목: ${contextTask.title}, 설명: ${contextTask.description}. 답변은 한국어로 작성하세요.`
  },
  {
    id: 'generateInsights',
    name: '팀 인사이트 분석 (Team Insights)',
    description: '전체 프로젝트 데이터를 분석하여 KPI 지표와 함께 주간 핵심 인사이트 리포트를 생성합니다.',
    model: 'gemini-pro',
    tags: ['Analytics', 'Reporting'],
    promptGenerator: (tasks: any, teamStats: any) => `
      당신은 데이터 기반으로 팀의 성과를 분석하는 AI 전문가입니다.
      아래 제공된 프로젝트 데이터를 분석하여, 팀 리더에게 제공할 **주간 핵심 인사이트**를 2~3문장으로 요약해 주세요.

      [데이터]
      - 전체 업무 수: ${teamStats.total}
      - 완료율: ${teamStats.completionRate}%
      - 진행 중 업무: ${teamStats.inProgress}
      - 마감 기한 초과: ${teamStats.overdue}
      - 업무가 가장 많은 팀원: ${teamStats.busiestMember}
      
      [분석 지침]
      1. 현재 팀의 **긍정적인 흐름**을 먼저 언급하세요 (예: 완료율이 높음, 진행이 원활함).
      2. **주의가 필요한 부분**이나 **리스크**(예: 특정 인원 과부하, 마감 초과)를 부드럽게 지적하세요.
      3. 구체적인 **액션 아이템**을 하나 제안하세요.
      4. 어조는 전문적이면서도 격려하는 톤으로 작성하세요.
      5. 답변은 JSON이 아닌 **일반 텍스트(String)**로 주세요.
    `
  },
  {
    id: 'analyzeKnowledgeResource',
    name: '지식 리소스 심층 분석 (Deep Resource Analysis)',
    description: 'URL, 비디오, 문서 등의 지식 자원을 분석하여 요약, 핵심 포인트, 챕터 정보 등을 구조화된 JSON으로 추출합니다.',
    model: 'gemini-2.0-flash',
    tags: ['Knowledge', 'Analysis', 'Search'],
    promptGenerator: (url: string) => `
      Analyze the content of the following URL: ${url}
      
      If it's a video (like YouTube), treat it as video content.
      If it's an article, treat it as text content.

      Return a SINGLE JSON object (not an array) with the following structure (Korean):
      {
          "title": "Exact title of the content",
          "summary": "3-line summary in Korean",
          "tags": ["tag1", "tag2", "tag3"],
          "difficulty": "Beginner" | "Intermediate" | "Advanced",
          "keyPoints": ["Key takeaway 1", "Key takeaway 2"],
          "chapters": [
              { "timestamp": "00:00", "title": "Intro", "summary": "Brief explanation" } 
          ]
      }
    `
  }
];

/**
 * Legacy Compatibility Layer
 * Maintains backward compatibility with existing service calls.
 * Maps the new object structure back to simple functions.
 */
export const PromptTemplates = {
  draftTask: AI_FEATURES.find(f => f.id === 'draftTask')!.promptGenerator,
  analyzeTask: AI_FEATURES.find(f => f.id === 'analyzeTask')!.promptGenerator,
  generateSubtasks: AI_FEATURES.find(f => f.id === 'generateSubtasks')!.promptGenerator,
  generateAcceptanceCriteria: AI_FEATURES.find(f => f.id === 'generateAcceptanceCriteria')!.promptGenerator,
  generateSolutionDraft: AI_FEATURES.find(f => f.id === 'generateSolutionDraft')!.promptGenerator,
  recommendResources: AI_FEATURES.find(f => f.id === 'recommendResources')!.promptGenerator,
  chatGuideSystem: AI_FEATURES.find(f => f.id === 'chatGuideSystem')!.promptGenerator,
  generateInsights: AI_FEATURES.find(f => f.id === 'generateInsights')!.promptGenerator,
  analyzeKnowledgeResource: AI_FEATURES.find(f => f.id === 'analyzeKnowledgeResource')!.promptGenerator,
};
