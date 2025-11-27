import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus } from '../types';
import { AlertCircle, Calendar, Clock, Trash2, Zap, CheckCircle2, Bot, Archive } from './Icons';
import { formatDate } from '../utils/formatters';

interface TaskCardProps {
  task: Task;
  draggedTaskId: string | null;
  onClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  index: number;
}

const getAIStatusIcon = (status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    switch (status) {
        case 'PROCESSING':
            return <Bot className="w-4 h-4 text-purple-600 animate-pulse" />;
        case 'COMPLETED':
            return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        case 'FAILED':
            return <AlertCircle className="w-4 h-4 text-red-500" />;
        default:
            return <Zap className="w-4 h-4 text-gray-400" />;
    }
}

const getAIStatusTooltip = (status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    switch (status) {
        case 'PROCESSING':
            return "AI가 업무를 분석하고 있습니다...";
        case 'COMPLETED':
            return "AI 분석 완료";
        case 'FAILED':
            return "AI 분석 실패";
        case 'PENDING':
        default:
            return "클릭하여 AI 분석 실행";
    }
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  draggedTaskId,
  onClick,
  onDragStart,
  onDragEnd,
  onDelete,
  onStatusChange,
  index,
}) => {
  const [showAIStatus, setShowAIStatus] = useState(false);

  useEffect(() => {
    if (task.aiStatus === 'PROCESSING' || task.aiStatus === 'FAILED') {
        setShowAIStatus(true);
    } else if (task.aiStatus === 'COMPLETED') {
        setShowAIStatus(true);
        const timer = setTimeout(() => {
            setShowAIStatus(false);
        }, 3000); // Hide after 3 seconds for completed tasks
        return () => clearTimeout(timer);
    } else {
        setShowAIStatus(false);
    }
  }, [task.aiStatus]);

  const isDone = task.status === TaskStatus.DONE;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`clean-card rounded-2xl cursor-grab active:cursor-grabbing group relative bg-white transition-all duration-300 flex flex-col
          ${draggedTaskId === task.id ? 'shadow-none' : 'hover:translate-y-[-2px]'}
      `}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
      onClick={() => onClick(task)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md select-none flex items-center gap-1
                  ${
                    task.priority === Priority.HIGH
                      ? 'bg-red-50 text-red-600'
                      : task.priority === Priority.MEDIUM
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-green-50 text-green-600'
                  }`}
          >
            {task.priority === Priority.HIGH && <AlertCircle className="w-3 h-3" />}
            {task.priority === Priority.HIGH
              ? '높음'
              : task.priority === Priority.MEDIUM
              ? '중간'
              : '낮음'}
          </span>

          <div className="flex items-center gap-2">
            {showAIStatus && task.aiStatus && (
                <div className="group/tooltip relative flex items-center justify-center w-7 h-7 animate-fade-in">
                    {getAIStatusIcon(task.aiStatus)}
                    <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 w-max px-2.5 py-1.5 bg-gray-900/90 text-white text-xs font-medium rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl backdrop-blur-sm">
                        {getAIStatusTooltip(task.aiStatus)}
                        <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-gray-900/90 rotate-45 transform"></div>
                    </div>
                </div>
            )}

            <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isDone) {
                    onStatusChange(task.id, TaskStatus.ARCHIVED);
                  } else {
                    if (confirm('이 업무를 삭제하시겠습니까?')) {
                        onDelete(task.id);
                    }
                  }
                }}
                className={`flex items-center justify-center w-7 h-7 rounded-full border transition-all opacity-0 group-hover:opacity-100 z-10 bg-white
                  ${isDone
                    ? 'border-gray-200 text-gray-400 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500' 
                    : 'border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                  }`
                }
                title={isDone ? "업무 보관" : "업무 삭제"}
            >
                {isDone ? <Archive className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <h4 className="text-gray-800 font-semibold text-[15px] mb-2 leading-snug group-hover:text-blue-600 transition-colors select-none">
          {task.title}
        </h4>
        <p className="text-gray-500 text-xs line-clamp-2 mb-4 font-light select-none leading-relaxed">
          {task.description}
        </p>

        <div className="flex items-end justify-between pt-3 border-t border-gray-100">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400" title="생성일">
              <Clock className="w-3 h-3" />
              <span>{formatDate(task.createdAt || Date.now())}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors
                      ${new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-gray-500'}`}
              title="마감일"
            >
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md max-w-[80px] truncate">
              {task.product}
            </span>
            <img
              src={`https://picsum.photos/seed/${task.assigneeId}/30/30`}
              className="w-6 h-6 rounded-full ring-2 ring-white shadow-sm select-none"
              alt="Assignee"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
