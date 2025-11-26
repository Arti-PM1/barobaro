import React, { useMemo, useState } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { KANBAN_COLUMNS } from '../constants';
import { getSortedAndFilteredTasks, SortOption } from '../utils/taskHelpers';
import { KanbanToolbar } from './KanbanToolbar';
import { KanbanColumn } from './KanbanColumn';

interface KanbanProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanBoard: React.FC<KanbanProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onDeleteTask,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL');
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('NONE');

  const onArchiveAll = () => {
    tasks.forEach(task => {
        if(task.status !== TaskStatus.ARCHIVED) {
            onStatusChange(task.id, TaskStatus.ARCHIVED)
        }
    });
  }

  const processedTasks = useMemo(() => {
    const visibleTasks = tasks.filter(t => t.status !== TaskStatus.ARCHIVED);
    return getSortedAndFilteredTasks(
      visibleTasks,
      {
        query: searchQuery,
        priority: filterPriority,
        onlyMyTasks,
        currentUserId: 'u1',
      },
      sortBy
    );
  }, [tasks, searchQuery, filterPriority, onlyMyTasks, sortBy]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== status) setDragOverColumn(status);
  };

  const handleDragLeave = () => setDragOverColumn(null);

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) onStatusChange(taskId, status);
    setDragOverColumn(null);
    setDraggedTaskId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <KanbanToolbar {...{ searchQuery, setSearchQuery, onlyMyTasks, setOnlyMyTasks, filterPriority, setFilterPriority, sortBy, setSortBy, onArchiveAll }} />
      <div className="flex gap-8 h-full min-w-max pb-4 flex-1">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            dotColor={col.dotColor}
            tasks={processedTasks.filter((t) => t.status === col.id)}
            draggedTaskId={draggedTaskId}
            dragOverColumn={dragOverColumn}
            onTaskClick={onTaskClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDeleteTask={onDeleteTask}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
};
