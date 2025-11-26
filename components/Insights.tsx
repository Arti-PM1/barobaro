import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { MOCK_USERS } from '../constants';
import { getWeeklyInsight } from '../services/geminiService';
import { 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Timer, 
  Target, 
  Sparkles, 
  PieChart, 
  Users 
} from './Icons';

interface InsightsProps {
  tasks: Task[];
}

export const Insights: React.FC<InsightsProps> = ({ tasks }) => {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;

  // --- 1. KPI Calculations ---

  // 1-1. Overdue Tasks (마감 기한 초과)
  const overdueCount = tasks.filter(t => {
    if (t.status === TaskStatus.DONE) return false;
    const due = new Date(t.dueDate).getTime();
    return due < now;
  }).length;

  // 1-2. Weekly Velocity (이번 주 완료 업무 수 & 증감률)
  const thisWeekDone = tasks.filter(t => 
    t.status === TaskStatus.DONE && 
    t.updatedAt && t.updatedAt >= now - oneWeek
  ).length;

  const lastWeekDone = tasks.filter(t => 
    t.status === TaskStatus.DONE && 
    t.updatedAt && t.updatedAt >= now - 2 * oneWeek && t.updatedAt < now - oneWeek
  ).length;

  let velocityGrowth = 0;
  if (lastWeekDone === 0) {
      velocityGrowth = thisWeekDone > 0 ? 100 : 0;
  } else {
      velocityGrowth = Math.round(((thisWeekDone - lastWeekDone) / lastWeekDone) * 100);
  }
  const velocityText = velocityGrowth > 0 ? `+${velocityGrowth}%` : `${velocityGrowth}%`;

  // 1-3. Stuck Tasks (2일 이상 변동 없음)
  const stuckCount = tasks.filter(t => {
      if (t.status === TaskStatus.DONE) return false;
      const lastUpdate = t.updatedAt || t.createdAt || 0;
      return (now - lastUpdate) > (2 * oneDay);
  }).length;

  // 1-4. High Priority Resolution (긴급 업무 처리율)
  const highPriorityTotal = tasks.filter(t => t.priority === Priority.HIGH).length;
  const highPriorityDone = tasks.filter(t => t.priority === Priority.HIGH && t.status === TaskStatus.DONE).length;
  const resolutionRate = highPriorityTotal > 0 
      ? Math.round((highPriorityDone / highPriorityTotal) * 100) 
      : 0;


  // --- 2. Charts Data ---
  
  // Assignee Workload
  const assigneeCounts = tasks.reduce((acc, task) => {
    const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
    const name = assignee ? assignee.name : '미지정';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxWorkload = Math.max(...(Object.values(assigneeCounts) as number[]), 1);
  const busiestMember = Object.entries(assigneeCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || '특정 팀원';

  // --- 3. AI Insight Generation ---
  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
      try {
        const stats = {
          total: tasks.length,
          completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / tasks.length) * 100) : 0,
          inProgress: tasks.filter(t => t.status === TaskStatus.WIP).length,
          overdue: overdueCount,
          busiestMember: busiestMember
        };
        
        const text = await getWeeklyInsight(tasks, stats);
        setInsight(text);
      } catch (error) {
        setInsight("AI 분석 데이터를 불러오는 중 문제가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [tasks, overdueCount, busiestMember]); // Dependency array updated

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 bg-gray-50/50 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">프로젝트 인사이트</h2>
              <p className="text-sm text-gray-500 mt-1">실시간 데이터 기반으로 팀의 업무 효율을 분석합니다.</p>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Overdue Tasks */}
          <StatCard 
            title="Overdue Tasks" 
            value={`${overdueCount} 건`}
            subText="마감 기한 초과"
            icon={<AlertTriangle className="w-5 h-5" />}
            iconBg="bg-gray-900"
            iconColor="text-white"
            badgeText={overdueCount > 0 ? "Warning" : "Good"}
            badgeBg="bg-gray-900"
            badgeColor="text-white"
          />

          {/* Card 2: Weekly Velocity */}
          <StatCard 
            title="Weekly Velocity" 
            value={`${thisWeekDone} tasks`} 
            subText="이번 주 완료"
            icon={<Zap className="w-5 h-5" />}
            iconBg="bg-gray-900"
            iconColor="text-white"
            badgeText={velocityText}
            badgeBg="bg-gray-900"
            badgeColor="text-white"
          />

          {/* Card 3: Stuck Tasks */}
          <StatCard 
            title="Stuck Tasks" 
            value={`${stuckCount} 건`} 
            subText="2일 이상 변동 없음"
            icon={<Timer className="w-5 h-5" />}
            iconBg="bg-gray-900"
            iconColor="text-white"
            badgeText={stuckCount > 0 ? "Check" : "Stable"}
            badgeBg="bg-gray-900"
            badgeColor="text-white"
          />

          {/* Card 4: High Priority Resolution */}
          <StatCard 
            title="High Pri. Resolution" 
            value={`${resolutionRate}%`} 
            subText={`of ${highPriorityTotal} 긴급 업무`}
            icon={<Target className="w-5 h-5" />}
            iconBg="bg-gray-900"
            iconColor="text-white"
            badgeText="Quality"
            badgeBg="bg-gray-900"
            badgeColor="text-white"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. Status Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                  <PieChart className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-800">상태별 업무 현황</h3>
              </div>
              
              <div className="space-y-5">
                  {[TaskStatus.REQUESTED, TaskStatus.WIP, TaskStatus.CHECKED, TaskStatus.DONE].map(status => {
                      const total = tasks.length;
                      const count = tasks.filter(t => t.status === status).length;
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      
                      let colorClass = 'bg-gray-400';
                      let label = '기타';

                      switch (status) {
                          case TaskStatus.REQUESTED:
                              colorClass = 'bg-gray-400';
                              label = '요청됨';
                              break;
                          case TaskStatus.WIP:
                              colorClass = 'bg-blue-500';
                              label = '진행 중';
                              break;
                          case TaskStatus.CHECKED:
                              colorClass = 'bg-purple-500';
                              label = '검토/승인';
                              break;
                          case TaskStatus.DONE:
                              colorClass = 'bg-green-500';
                              label = '완료';
                              break;
                      }

                      return (
                          <div key={status} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                  <span className="font-medium text-gray-600 flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                                      {label}
                                  </span>
                                  <span className="font-bold text-gray-800">{count}건 <span className="text-gray-400 font-normal ml-1">({Math.round(percentage)}%)</span></span>
                              </div>
                              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`} 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* 2. Workload Chart (Team Member based) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-800">팀원별 업무량 (Workload)</h3>
              </div>
              
              <div className="flex-1 flex items-end justify-around gap-4 pb-2 min-h-[200px]">
                  {Object.entries(assigneeCounts).map(([name, count]) => {
                      const heightPercent = ((count as number) / maxWorkload) * 100;
                      const displayHeight = Math.max(heightPercent, 5); 
                      
                      return (
                          <div key={name} className="flex flex-col items-center gap-3 w-full group cursor-default">
                              <div className="relative w-full max-w-[40px] flex items-end justify-center h-[180px] bg-gray-50 rounded-t-lg overflow-hidden">
                                  <div 
                                      className="w-full bg-[#306364]/80 group-hover:bg-[#306364] transition-all duration-500 rounded-t-lg relative group-hover:shadow-lg"
                                      style={{ height: `${displayHeight}%` }}
                                  >
                                  </div>
                                  <span className="absolute bottom-2 text-xs font-bold text-[#306364] bg-white/80 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm">
                                    {count as number}
                                  </span>
                              </div>
                              <span className="text-[11px] font-medium text-gray-500 truncate w-full text-center px-1" title={name}>
                                {name}
                              </span>
                          </div>
                      );
                  })}
                  
                  {Object.keys(assigneeCounts).length === 0 && (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          데이터가 없습니다.
                      </div>
                  )}
              </div>
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="bg-gray-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl ring-1 ring-white/10 min-h-[180px]">
            <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-10 -translate-y-10">
               <Sparkles className="w-64 h-64 text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                      <Sparkles className="w-4 h-4 text-white" /> {/* text-yellow-300 -> text-white */}
                  </div>
                  <h3 className="text-lg font-bold text-white">Weekly AI Insight</h3>
              </div>
              
              <div className="space-y-4 max-w-3xl">
                  {isLoading ? (
                    // Skeleton UI
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                      <div className="h-4 bg-white/10 rounded w-5/6"></div>
                      <span className="text-xs text-gray-400 mt-2 block animate-pulse">AI가 데이터를 분석 중입니다...</span>
                    </div>
                  ) : (
                    // Actual Content
                    <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                        {insight}
                    </p>
                  )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub Component: StatCard with Design System ---
interface StatCardProps {
  title: string;
  value: string;
  subText: string;
  icon: React.ReactNode;
  iconBg: string; 
  iconColor: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
    title, value, subText, icon, iconBg, iconColor, badgeText, badgeBg, badgeColor 
}) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
            {/* Icon Box: w-10 h-10 (40px) */}
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            {/* Badge: text-xs (12px) */}
            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${badgeBg} ${badgeColor}`}>
                {badgeText === "Warning" || badgeText === "Check" ? <AlertTriangle className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                <span>{badgeText}</span>
            </div>
        </div>
        <div className="space-y-1">
            {/* Title: text-xs (12px), Caption */}
            <span className="text-gray-500 text-xs font-bold tracking-wide uppercase block">{title}</span>
            {/* Value: text-2xl (24px), Display */}
            <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h4>
            {/* SubText: text-xs (12px), Caption */}
            <p className="text-xs text-gray-500 font-medium">{subText}</p>
        </div>
    </div>
);
