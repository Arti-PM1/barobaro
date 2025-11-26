import React, { useState, useEffect } from 'react';
import changelogData from '../data/changelog.json';
import { AI_FEATURES } from '../services/prompts';
import { 
    ChevronDown, Settings, FileText, Sparkles, Download, 
    Database, BookOpen, Code2 
} from './Icons';
import { taskService } from '../services/taskService';
import DESIGN_GUIDE from '../DESIGN_SYSTEM.md?raw';
import DEV_GUIDE from '../DEVELOPER_GUIDE.md?raw';

// --- Types ---
interface ChangelogEntry { version: string; date: string; title: string; description: string; }
type Tab = 'DOC_HUB' | 'CHANGELOG';

// --- Helper Functions ---
const downloadAsMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// --- Sub Components ---

// Tab 1: Documentation Hub
const DocHubTab = () => {
    
    const handleDownloadPrompts = () => {
        let content = '# Baro.ai - AI Prompt Engineering Document\n\n';
        content += 'This document is auto-generated based on `services/prompts.ts` (Single Source of Truth).\n\n---\n\n';
        
        AI_FEATURES.forEach(feature => {
            const promptContent = feature.promptGenerator.toString();

            content += `## ${feature.name} (${feature.id})\n`;
            content += `- **Description**: ${feature.description}\n`;
            content += `- **Model**: ${feature.model}\n`;
            content += `- **Tags**: ${feature.tags.join(', ')}\n\n`;
            content += '### Prompt Logic\n';
            content += '```javascript\n';
            content += `${promptContent}\n`;
            content += '```\n\n---\n\n';
        });
        
        downloadAsMarkdown(content, 'Baro.ai-Prompts-Documentation.md');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
                {/* AI Features */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-blue-600"/>
                            <h3 className="text-lg font-bold text-gray-900">AI Features Registry</h3>
                        </div>
                        <button onClick={handleDownloadPrompts} className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center gap-2 hover:bg-gray-700 transition-colors">
                            <Download className="w-3 h-3"/>
                            <span>AI 설계 문서 (.md)</span>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">현재 활성화된 AI 기능 목록입니다. 문서를 다운로드하면 각 기능의 상세 프롬프트를 확인할 수 있습니다.</p>
                    <div className="space-y-3">
                        {AI_FEATURES.map(feat => (
                            <div key={feat.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="font-bold text-sm text-gray-800">{feat.name}</p>
                                        <p className="text-xs text-gray-400 font-mono">{feat.model}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full border border-green-200 shrink-0 ml-2">
                                        Active
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {feat.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-white border border-gray-200 text-gray-500 text-[10px] rounded-md font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Data Management */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Database className="w-6 h-6 text-indigo-600"/>
                        <h3 className="text-lg font-bold text-gray-900">데이터 관리</h3>
                    </div>
                     <p className="text-sm text-gray-500 mb-6">현재 브라우저에 저장된 모든 업무 데이터를 JSON 파일로 내보내 백업할 수 있습니다.</p>
                    <button onClick={() => taskService.exportTasks()} className="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                        <Download className="w-4 h-4"/>
                        업무 데이터 내보내기 (.json)
                    </button>
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
                {/* UI Components */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Code2 className="w-6 h-6 text-purple-600"/>
                        <h3 className="text-lg font-bold text-gray-900">UI Components Registry</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Baro.ai의 핵심 UI 컴포넌트 목록입니다.</p>
                     <div className="space-y-3">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-sm text-gray-800">Kanban Board</p>
                                <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full">Rendered</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">HTML5 Drag & Drop API, TaskStatus Enum 기반</p>
                        </div>
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-sm text-gray-800">Insights Dashboard</p>
                                <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full">Rendered</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">실시간 데이터 분석 및 KPI 시각화</p>
                        </div>
                    </div>
                </div>

                {/* Developer Docs */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-emerald-600"/>
                        <h3 className="text-lg font-bold text-gray-900">개발 문서</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">프로젝트의 핵심 가이드 문서를 다운로드할 수 있습니다.</p>
                    <div className="space-y-3">
                        <button onClick={() => downloadAsMarkdown(DESIGN_GUIDE, 'DESIGN_SYSTEM.md')} className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                           <Download className="w-4 h-4"/>
                           디자인 시스템 가이드 (.md)
                        </button>
                        <button onClick={() => downloadAsMarkdown(DEV_GUIDE, 'DEVELOPER_GUIDE.md')} className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                           <Download className="w-4 h-4"/>
                           개발 가이드 (.md)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tab 2: Changelog
const ChangelogTab = ({ changelog }: { changelog: ChangelogEntry[] }) => {
    const [openEntries, setOpenEntries] = useState<string[]>([]);

    useEffect(() => {
        if (changelog.length > 0) setOpenEntries([changelog[0].version]);
    }, [changelog]);

    const toggleEntry = (version: string) => {
        setOpenEntries(prev => prev.includes(version) ? prev.filter(v => v !== version) : [...prev, version]);
    };

    return (
        <div className="relative border-l-2 border-gray-200/80 ml-4 space-y-8">
            {changelog.map((entry) => {
                const isOpen = openEntries.includes(entry.version);
                return (
                    <div key={entry.version} className="pl-8 relative">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white rounded-full border-4 border-blue-500"></div>
                        
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                            <div 
                                className="p-5 cursor-pointer flex items-center justify-between bg-gray-50/50"
                                onClick={() => toggleEntry(entry.version)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                        v{entry.version}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">{entry.date}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-bold text-gray-800">{entry.title}</h3>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {isOpen && (
                                <div 
                                    className="p-6 pt-2 prose prose-sm max-w-none text-gray-600 leading-relaxed border-t border-gray-100" 
                                    dangerouslySetInnerHTML={{ __html: entry.description }}
                                />
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

// --- Main Page Component ---
export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('DOC_HUB');
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

  useEffect(() => {
    setChangelog(changelogData as ChangelogEntry[]);
  }, []);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 bg-gray-50/50 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings & Documentation</h1>
                <p className="text-sm text-gray-500 mt-1">애플리케이션 설정 및 개발자 문서를 관리합니다.</p>
            </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 mb-8 border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('DOC_HUB')}
                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2
                    ${activeTab === 'DOC_HUB' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                <BookOpen className="w-4 h-4" />
                문서 허브
            </button>
            <button 
                onClick={() => setActiveTab('CHANGELOG')}
                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2
                    ${activeTab === 'CHANGELOG' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                <FileText className="w-4 h-4" />
                변경 이력
            </button>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
            {activeTab === 'DOC_HUB' && <DocHubTab />}
            {activeTab === 'CHANGELOG' && <ChangelogTab changelog={changelog} />}
        </div>

      </div>
    </div>
  );
};
