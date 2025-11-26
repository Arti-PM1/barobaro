import React from 'react';
import { Task, TaskStatus } from '../types';
import { RotateCcw, Trash2 } from './Icons';

interface ArchivePageProps {
    tasks: Task[];
    onRestoreTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
    onTaskClick: (task: Task) => void;
}

export const ArchivePage: React.FC<ArchivePageProps> = ({ tasks, onRestoreTask, onDeleteTask, onTaskClick }) => {
  const archivedTasks = tasks.filter(t => t.status === TaskStatus.ARCHIVED);

  return (
    <div className="flex-1 flex flex-col">
        <header className="h-20 flex items-center justify-between px-8 z-10 shrink-0 backdrop-blur-sm bg-white/50 sticky top-0">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">보관함</h1>
                <p className="text-sm text-gray-500 mt-1">{archivedTasks.length}개의 보관된 업무가 있습니다.</p>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
            {archivedTasks.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-200">
                    {archivedTasks.map(task => (
                        <div 
                            key={task.id} 
                            className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => onTaskClick(task)}
                        >
                            <div>
                                <p className="font-medium text-gray-800">{task.title}</p>
                                <p className="text-sm text-gray-500">보관된 날짜: {new Date(task.updatedAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onRestoreTask(task.id); }}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all"
                                    title="업무 복원"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-all"
                                    title="영구 삭제"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                    <h2 className="text-lg font-semibold text-gray-700">보관된 업무가 없습니다.</h2>
                    <p className="text-sm text-gray-500 mt-2">업무를 보관하면 이곳에서 확인할 수 있습니다.</p>
                </div>
            )}
        </main>
    </div>
  );
};
