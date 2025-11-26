import { Task, TaskStatus } from "../types";
import { INITIAL_TASKS } from "../constants";
import { runFullAnalysis } from './geminiService';

const STORAGE_KEY = 'nexus_ai_tasks';

let memoryTasks: Task[] = [];

// 스토리지에서 태스크를 로드하는 함수
const loadTasksFromStorage = (): Task[] => {
  if (typeof window === 'undefined') return [...INITIAL_TASKS];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    
    saveTasksToStorage(INITIAL_TASKS);
    return [...INITIAL_TASKS];
  } catch (error) {
    console.error("스토리지에서 태스크를 불러오는 데 실패했습니다:", error);
    return [...INITIAL_TASKS];
  }
};

// 스토리지에 태스크를 저장하는 함수
const saveTasksToStorage = (tasks: Task[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("스토리지에 태스크를 저장하는 데 실패했습니다:", error);
  }
};

// --- 태스크 서비스 --- //

export const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    memoryTasks = loadTasksFromStorage();
    return new Promise(resolve => setTimeout(() => resolve([...memoryTasks]), 200));
  },

  createTask: async (task: Task): Promise<Task> => {
    const newTask: Task = {
      ...task,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      aiStatus: 'PENDING' 
    };

    memoryTasks.push(newTask);
    saveTasksToStorage(memoryTasks);

    return newTask; // 분석 완료를 기다리지 않고 즉시 반환
  },

  updateTask: async (updatedTask: Task): Promise<Task> => {
    const taskIndex = memoryTasks.findIndex(t => t.id === updatedTask.id);
    if (taskIndex > -1) {
      memoryTasks[taskIndex] = updatedTask;
      saveTasksToStorage(memoryTasks);
      return updatedTask;
    }
    throw new Error("태스크를 찾을 수 없습니다.");
  },

  deleteTask: async (taskId: string): Promise<void> => {
    const initialLength = memoryTasks.length;
    memoryTasks = memoryTasks.filter(t => t.id !== taskId);
    if (memoryTasks.length < initialLength) {
      saveTasksToStorage(memoryTasks);
    }
  },

  updateStatus: async (taskId: string, status: TaskStatus): Promise<Task> => {
    const task = memoryTasks.find(t => t.id === taskId);
    if (task) {
      return await taskService.updateTask({ ...task, status });
    }
    throw new Error("태스크를 찾을 수 없습니다.");
  },

  exportTasks: async (): Promise<void> => {
    // 생략
  }
};
