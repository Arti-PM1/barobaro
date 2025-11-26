
import React from 'react';
import { Task, Subtask, AIAnalysis, ChatMessage } from '../types';
import { 
    Sparkles, 
    CheckCircle2, 
    Plus, 
    MessageSquare, 
    User, 
    Bot, 
    FileText, 
    ExternalLink, 
    ArrowRight,
    CheckSquare,
    FileCode,
    Loader2,
    Send,
    ListTodo
} from './Icons';
import { UI_TEXTS } from '../constants';

// Mock Markdown Renderer with Type Guard
const MarkdownRenderer = ({ content }: { content: string }) => {
    if (!content || typeof content !== 'string') return null; // Added type guard
    
    try {
        const htmlContent = content
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 mt-6">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mb-2 mt-4">$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\n/gim, '<br />')
            // Code block styling
            .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm">$1</pre>'); 

        return <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    } catch (e) {
        console.error("Markdown rendering error:", e);
        return <div className="text-red-500 text-xs">렌더링 오류</div>;
    }
};


// --- 1. Draft View (Creation Mode) ---
interface DraftViewProps {
    input: string;
    setInput: (val: string) => void;
    onGenerate: () => void;
    results: Partial<Task>[] | null;
    selectedIdx: number | null;
    onSelect: (draft: Partial<Task>, idx: number) => void;
}

export const DraftView: React.FC<DraftViewProps> = ({ input, setInput, onGenerate, results, selectedIdx, onSelect }) => (
    <div className="max-w-2xl mx-auto pt-10">
        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">AI 업무 초안 생성</h2>
            <p className="text-gray-500">아이디어만 입력하세요. 전문적인 업무 명세서를 만들어드립니다.</p>
        </div>

        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex gap-2 mb-12 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-shadow">
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
                className="flex-1 px-4 py-3 text-base outline-none placeholder-gray-400"
                placeholder={UI_TEXTS.DRAFT_PLACEHOLDER}
            />
            <button 
                onClick={onGenerate}
                disabled={!input.trim()}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                <Sparkles className="w-4 h-4" />
                <span>생성하기</span>
            </button>
        </div>

        {results && (
            <div className="grid grid-cols-1 gap-6 animate-fade-in">
                {results.map((draft, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => onSelect(draft, idx)}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md group relative overflow-hidden
                            ${selectedIdx === idx ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-100 hover:border-indigo-200 bg-white'}`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide
                                ${draft.styleTag === '상세' ? 'bg-purple-100 text-purple-700' : 
                                  draft.styleTag === '간결' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                {draft.styleTag} 스타일
                            </span>
                            {selectedIdx === idx && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">{draft.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{draft.description}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// --- 2. Strategy View (Updated to Step-by-Step Checklist) ---
interface StrategyViewProps {
    analysis?: AIAnalysis;
    onAnalyze: () => void;
}

export const StrategyView: React.FC<StrategyViewProps> = ({ analysis, onAnalyze }) => {
    if (!analysis) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">아직 분석된 전략이 없습니다</h3>
                <p className="text-gray-500 mb-8 max-w-md">AI가 업무 내용을 분석하여 실행 전략과 참고 자료를 제공해드립니다.</p>
                <button onClick={onAnalyze} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-200">
                    <Sparkles className="w-4 h-4" />
                    <span>전략 분석 시작하기</span>
                </button>
            </div>
        );
    }

    // Safe data handling
    // We only use executionPlan as strategy is legacy
    const steps = analysis.executionPlan || [];
    const isLegacyString = typeof analysis.strategy === 'string';

    return (
        <div className="max-w-3xl mx-auto pt-6 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900">AI 실행 전략</h3>
                    <p className="text-sm text-gray-500 mt-1">Gemini가 업무를 분석하여 최적의 하위 단계를 제안합니다.</p>
                 </div>
                 <button onClick={onAnalyze} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-md">
                     <Sparkles className="w-4 h-4 text-yellow-300" />
                     <span>전략 재생성</span>
                 </button>
            </div>
    
            <div className="space-y-4 mb-12">
                {steps.length > 0 ? steps.map((step, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 group">
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl text-gray-400 font-bold text-sm group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all shrink-0 mt-1">
                            {idx + 1}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-700 transition-colors">{step.title}</h4>
                            {/* Content field removed from Subtask, only Title exists now based on types */}
                        </div>
                        <div className="pt-2 pr-2">
                             <div className="w-6 h-6 border-2 border-gray-300 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"></div>
                        </div>
                    </div>
                )) : (
                    <div className="bg-gray-50 p-6 rounded-xl text-gray-600">
                         {isLegacyString ? <MarkdownRenderer content={analysis.strategy as string} /> : "전략 데이터를 불러올 수 없습니다. 재생성 버튼을 눌러주세요."}
                    </div>
                )}
            </div>

            {/* Suggested Resources */}
            {analysis.learningResources && analysis.learningResources.length > 0 && (
                <div className="border-t border-gray-100 pt-8">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        추천 학습 자료
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {analysis.learningResources.map((res, i) => (
                            <a key={i} href={res.url} target="_blank" rel="noreferrer" 
                            className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group">
                                <h4 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{res.title}</h4>
                                <div className="flex items-center text-xs text-gray-400 mt-2">
                                    <span>자료 보기</span>
                                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 3. Subtask View (Deprecated but kept for now) ---
interface SubtaskViewProps {
    task: Task;
    onGenerate: () => void;
    onToggle: (updatedTask: Task) => void;
}

export const SubtaskView: React.FC<SubtaskViewProps> = ({ task, onGenerate, onToggle }) => {
    const completedCount = task.subtasks.filter(s => s.completed).length;
    const progress = task.subtasks.length > 0 ? Math.round((completedCount / task.subtasks.length) * 100) : 0;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">실행 계획</h3>
                    <p className="text-sm text-gray-500 mt-1">구체적인 하위 업무 리스트입니다.</p>
                </div>
                <button onClick={onGenerate} className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>AI 자동 생성</span>
                </button>
            </div>

            {task.subtasks.length > 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                         <span className="text-sm font-bold text-gray-700">진행률</span>
                         <span className="text-sm font-bold text-blue-600">{progress}%</span>
                    </div>
                    <div className="h-1 w-full bg-gray-200">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {task.subtasks.map(st => (
                            <div key={st.id} 
                                 className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group`}
                                 onClick={() => {
                                     const newSubs = task.subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s);
                                     onToggle({ ...task, subtasks: newSubs });
                                 }}>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                    ${st.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                    {st.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>
                                <span className={`flex-1 text-sm font-medium ${st.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                    {st.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">아직 등록된 하위 업무가 없습니다.</p>
                    <button onClick={onGenerate} className="mt-4 text-blue-600 font-bold hover:underline">AI로 생성하기</button>
                </div>
            )}
        </div>
    );
};

// --- 4. Chat View ---
interface ChatViewProps {
    messages: ChatMessage[];
    inputMsg: string;
    setInputMsg: (val: string) => void;
    onSend: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, inputMsg, setInputMsg, onSend }) => (
    <div className="h-full flex flex-col bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
                <div className="text-center py-10 opacity-50">
                    <Bot className="w-12 h-12 mx-auto mb-3" />
                    <p>이 업무에 대해 무엇이든 물어보세요!</p>
                </div>
            )}
            {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-900' : 'bg-blue-600'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${msg.role === 'user' ? 'bg-white text-gray-800 rounded-tr-none' : 'bg-blue-600 text-white rounded-tl-none'}`}>
                        {msg.content}
                    </div>
                </div>
            ))}
        </div>
        <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
                <input 
                    className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="AI 가이드에게 질문하기..."
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSend()}
                />
                <button onClick={onSend} className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors">
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

// --- 5. DoD View (Acceptance Criteria) ---
interface DoDViewProps {
    criteria?: { id: string, content: string, checked: boolean }[]; // Updated type
    onGenerate: () => void;
    isLoading: boolean;
}

export const DoDView: React.FC<DoDViewProps> = ({ criteria, onGenerate, isLoading }) => {
    if (!criteria || criteria.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                 <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckSquare className="w-10 h-10 text-green-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">완료 조건(DoD)이 없습니다</h3>
                <p className="text-gray-500 mb-8 max-w-md">QA 통과를 위한 검증 기준을 AI가 생성해 드립니다.</p>
                <button onClick={onGenerate} disabled={isLoading} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-green-200 disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isLoading ? "생성 중..." : "DoD 생성하기"}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pt-6 animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-green-600" />
                    완료 조건 (Definition of Done)
                </h3>
                <button onClick={onGenerate} disabled={isLoading} className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 재생성
                </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
                <div className="p-6 bg-green-50/50 border-b border-green-100">
                    <p className="text-sm text-green-800 font-medium">이 업무가 완료되기 위해 반드시 통과해야 하는 기준입니다.</p>
                </div>
                <ul className="divide-y divide-gray-100">
                    {criteria.map((item, i) => (
                        <li key={item.id} className="p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-white border-2 border-green-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-green-600">
                                {i + 1}
                            </div>
                            <span className="text-gray-700 leading-relaxed">{item.content}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// --- 6. Solution View (Draft Code) ---
interface SolutionViewProps {
    solution?: string;
    onGenerate: () => void;
    isLoading: boolean;
}

export const SolutionView: React.FC<SolutionViewProps> = ({ solution, onGenerate, isLoading }) => {
    if (!solution) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <FileCode className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">솔루션 초안이 없습니다</h3>
                <p className="text-gray-500 mb-8 max-w-md">구현 방향성, 아키텍처 설계, 코드 스니펫을 AI가 제안해 드립니다.</p>
                <button onClick={onGenerate} disabled={isLoading} className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg disabled:opacity-50">
                     {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>솔루션 초안 생성하기</span>
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pt-2 animate-fade-in h-full flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileCode className="w-6 h-6 text-gray-700" />
                    Technical Solution Draft
                </h3>
                <button onClick={onGenerate} disabled={isLoading} className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 재생성
                </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 overflow-y-auto custom-scrollbar flex-1">
                <MarkdownRenderer content={solution} />
            </div>
        </div>
    );
};
