import { Task, Subtask, Resource, AcceptanceCriterion } from '../types';

// 이 파일은 AI 기반 콘텐츠 생성을 시뮬레이션합니다.
// 실제 애플리케이션에서는 여기에 Gemini와 같은 실제 AI 모델 호출 코드가 포함됩니다.

const generateMockContent = async (prompt: string, task: Task): Promise<string> => {
    // AI 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    return `**[AI가 생성한 ${prompt}]**\n\n- **업무:** ${task.title}\n- **설명:** ${task.description || '(설명 없음)'}\n\n이 내용은 AI가 자동으로 생성한 초안이며, 팀의 논의를 통해 구체화되어야 합니다. 현재는 실제 AI 호출 없이 목업(mock) 데이터를 반환하고 있습니다.`;
}

export const aiService = {
    /**
     * 태스크에 대한 전체 AI 분석을 실행합니다.
     * @param task - 분석할 태스크 객체
     * @returns AI 분석 결과가 포함된 Partial<Task> 객체
     */
    runFullAnalysis: async (task: Task): Promise<Partial<Task>> => {
        console.log(`[AI Service] Starting full analysis for task: ${task.id}`);

        // 각 분석을 병렬로 실행하여 시간 단축
        // 실제로는 여기서 Gemini API를 호출하여 구조화된 데이터를 받아와야 합니다.
        // 현재는 목업 데이터를 생성하여 반환합니다.
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // 전체 분석 시간 시뮬레이션

        const executionPlan: Subtask[] = [
            { id: `ep-${Date.now()}-1`, title: '요구사항 상세 분석', completed: false },
            { id: `ep-${Date.now()}-2`, title: '기술 스택 검토 및 선정', completed: false },
            { id: `ep-${Date.now()}-3`, title: '프로토타입 개발', completed: false }
        ];

        const acceptanceCriteria: AcceptanceCriterion[] = [
            { id: `ac-${Date.now()}-1`, content: '기능이 요구사항 문서대로 동작해야 함', checked: false },
            { id: `ac-${Date.now()}-2`, content: '단위 테스트 커버리지 80% 이상', checked: false }
        ];
        
        const learningResources: Resource[] = [
            { title: '관련 기술 공식 문서', url: 'https://react.dev', description: 'React 공식 문서입니다.' },
            { title: 'Best Practices 가이드', url: 'https://github.com/goldbergyoni/nodebestpractices', description: 'Node.js 베스트 프랙티스입니다.' }
        ];

        const solutionDraft = `### 솔루션 제안\n\n이 문제는 다음과 같은 접근 방식으로 해결할 수 있습니다.\n\n1. **프론트엔드**: React 컴포넌트 구조화\n2. **백엔드**: RESTful API 설계\n\n\`\`\`typescript\n// 예시 코드\nconst solution = "solved";\n\`\`\``;

        console.log(`[AI Service] Finished analysis for task: ${task.id}`);

        return {
            aiAnalysis: {
                executionPlan,
                acceptanceCriteria,
                learningResources,
                solutionDraft,
                lastUpdated: Date.now()
            },
            aiStatus: 'COMPLETED'
        };
    }
};