
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/Kanban';
import { AIModal } from './components/AIModal';
import { GeminiPage } from './components/GeminiPage';
import { SettingsPage } from './components/SettingsPage';
import { Insights } from './components/Insights';
import { KnowledgeHub_ver2 } from './components/KnowledgeHub';
import { Task, TaskStatus, Priority, ViewMode } from './types';
import { taskService } from './services/taskService'; 
import { runFullAnalysis } from './services/geminiService';
import { Plus } from './components/Icons';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('BOARD');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempTask, setTempTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.altKey && event.key.toLowerCase() === 'n') {
            event.preventDefault();
            handleStartCreateTask();
        }

        if (event.key === 'Delete' && isModalOpen && selectedTask) {
            event.preventDefault();
            handleDeleteTask(selectedTask.id);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, selectedTask]);

  const loadTasks = async () => {
    const loadedTasks = await taskService.getAllTasks();
    setTasks(loadedTasks);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTempTask(null);
    setIsModalOpen(true);
  };

  const handleUpdateTask = async (updated: Task) => {
    if (tempTask) {
       setTempTask(updated);
    } else {
       setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
       setSelectedTask(updated);
       try {
         await taskService.updateTask(updated);
       } catch (error) {
         console.error("Failed to update task", error);
         loadTasks(); 
       }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await taskService.updateStatus(taskId, newStatus);
    } catch (error) {
      console.error("Failed to update status", error);
      loadTasks();
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) {
        setIsModalOpen(false);
        setSelectedTask(null);
    }
    try {
        await taskService.deleteTask(taskId);
    } catch (error) {
        console.error("Failed to delete task", error);
        loadTasks();
    }
  };

  const handleStartCreateTask = () => {
    const newTaskTemplate: Task = {
        id: `t${Date.now()}`,
        title: '새로운 업무 요청',
        description: '',
        product: '일반',
        type: '기타',
        priority: Priority.MEDIUM,
        status: TaskStatus.REQUESTED,
        dueDate: new Date().toISOString(),
        assigneeId: 'u1',
        requesterId: 'u2',
        subtasks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        aiStatus: 'PENDING',
    };
    setTempTask(newTaskTemplate);
    setSelectedTask(null);
    setIsModalOpen(true);
  }

  const handleFinalizeCreateTask = async (finalTask: Task) => {
    const taskWithProcessing = { ...finalTask, aiStatus: 'PROCESSING' as const };
    setTasks(prev => [...prev, taskWithProcessing]);
    setIsModalOpen(false);
    setTempTask(null);

    try {
        const createdTask = await taskService.createTask(taskWithProcessing);
        setTasks(prev => prev.map(t => t.id === finalTask.id ? createdTask : t));

        // Run AI analysis in the background
        runFullAnalysis(createdTask).then(async (aiAnalysis) => {
            const fullyAnalyzedTask: Task = { 
                ...createdTask, 
                aiAnalysis, 
                aiStatus: 'COMPLETED',
                // Update subtasks from AI analysis if they exist
                subtasks: aiAnalysis.executionPlan?.length ? aiAnalysis.executionPlan : createdTask.subtasks,
            };
            await taskService.updateTask(fullyAnalyzedTask);
            setTasks(prev => prev.map(t => t.id === createdTask.id ? fullyAnalyzedTask : t));
        }).catch(async (error) => {
            console.error("AI analysis failed:", error);
            const failedTask = { ...createdTask, aiStatus: 'FAILED' as const };
            await taskService.updateTask(failedTask);
            setTasks(prev => prev.map(t => t.id === createdTask.id ? failedTask : t));
        });

    } catch (error) {
        console.error("Failed to create task", error);
        setTasks(prev => prev.filter(t => t.id !== finalTask.id));
    }
  }

  const renderContent = () => {
      switch (currentView) {
          case 'INSIGHT':
              return <Insights tasks={tasks} />;
          case 'KNOWLEDGE':
              return <KnowledgeHub_ver2 />;
          case 'BOARD':
              return (
                <>
                    <header className="h-20 flex items-center justify-between px-8 z-10 shrink-0 backdrop-blur-sm bg-white/50 sticky top-0">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">프로젝트 보드</h1>
                            <p className="text-sm text-gray-500 mt-1">팀의 업무 흐름을 AI와 함께 최적화하세요.</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button onClick={handleStartCreateTask} className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg active:scale-95">
                                <Plus className="w-4 h-4" />
                                <span>새 요청 만들기</span>
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">ME</div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 pt-4">
                        <KanbanBoard 
                            tasks={tasks} 
                            onTaskClick={handleTaskClick}
                            onStatusChange={handleStatusChange}
                            onDeleteTask={handleDeleteTask}
                        />
                    </div>
                </>
              );
          case 'GEMINI':
              return <GeminiPage />;
          case 'SETTINGS':
              return <SettingsPage />;
          default:
            return null;
      }
  }

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
      
      {(selectedTask || tempTask) && (
        <AIModal 
          task={selectedTask || tempTask!}
          isOpen={isModalOpen}
          onClose={() => {
              setIsModalOpen(false);
              setTempTask(null);
          }}
          onUpdateTask={handleUpdateTask}
          onCreateTask={tempTask ? handleFinalizeCreateTask : undefined}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </Layout>
  );
}
