import React from 'react';
import { Priority } from '../types';
import { Search, Filter, User, ArrowUpDown, Sparkles, XCircle } from './Icons';
import { SortOption } from '../utils/taskHelpers';

interface KanbanToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onlyMyTasks: boolean;
  setOnlyMyTasks: (onlyMy: boolean) => void;
  filterPriority: Priority | 'ALL';
  setFilterPriority: (priority: Priority | 'ALL') => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export const KanbanToolbar: React.FC<KanbanToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  onlyMyTasks,
  setOnlyMyTasks,
  filterPriority,
  setFilterPriority,
  sortBy,
  setSortBy,
}) => {
  const toggleSort = () => {
    const modes: SortOption[] = ['NONE', 'SMART', 'DUE_DATE', 'PRIORITY'];
    const nextIdx = (modes.indexOf(sortBy) + 1) % modes.length;
    setSortBy(modes[nextIdx]);
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 px-2 flex-shrink-0 pt-6">
      {/* Left: Search */}
      <div className="relative group w-full xl:w-72">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-google-blue transition-colors" />
        <input
          type="text"
          placeholder="업무, 태그, 설명 검색..."
          className="w-full bg-white pl-10 pr-8 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-google-blue transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right: Filters & Sort */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 no-scrollbar">
        {/* My Tasks Toggle */}
        <button
          onClick={() => setOnlyMyTasks(!onlyMyTasks)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shadow-md
                        ${
                          onlyMyTasks
                            ? 'bg-black text-white border-transparent hover:bg-gray-800'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
        >
          <User className={`w-4 h-4 ${onlyMyTasks ? 'text-white' : 'text-gray-500'}`} />
          내 업무
        </button>

        {/* Priority Chips */}
        <div className="flex bg-white rounded-full p-1 border border-gray-300 shadow-sm">
          {(['ALL', Priority.HIGH, Priority.MEDIUM, Priority.LOW] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                                ${
                                  filterPriority === p
                                    ? 'bg-black text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
            >
              {p === 'ALL'
                ? '전체'
                : p === Priority.HIGH
                ? '높음'
                : p === Priority.MEDIUM
                ? '중간'
                : '낮음'}
            </button>
          ))}
        </div>
        
        <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>

        {/* Sort Dropdown */}
        <button
          onClick={toggleSort}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap min-w-[140px] justify-center
                        ${
                          sortBy !== 'NONE'
                            ? 'bg-gray-100 text-gray-800 border-gray-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
        >
          {sortBy === 'SMART' ? (
            <Sparkles className="w-4 h-4 text-purple-500" />
          ) : (
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
          )}
          <span>
            {sortBy === 'NONE' && '정렬'}
            {sortBy === 'SMART' && '스마트 정렬'}
            {sortBy === 'DUE_DATE' && '마감일순'}
            {sortBy === 'PRIORITY' && '우선순위순'}
          </span>
        </button>
      </div>
    </div>
  );
};
