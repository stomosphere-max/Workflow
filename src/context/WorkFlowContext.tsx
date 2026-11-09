import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { CategoryDef, FollowUpItem, Task, UserSettings } from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_FOLLOW_UPS,
  INITIAL_TASKS,
  INITIAL_USER_SETTINGS,
} from '../utils/initialData';
import { hasTimeConflict } from '../utils/thaiDate';
import { doc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type MainNavTab =
  | 'dashboard'
  | 'calendar'
  | 'tasks'
  | 'reminders'
  | 'followup'
  | 'friends'
  | 'ai'
  | 'weekly'
  | 'settings';

interface ConflictInfo {
  task1: Task;
  task2: Task;
  message: string;
}

interface WorkFlowContextType {
  tasks: Task[];
  categories: CategoryDef[];
  followUps: FollowUpItem[];
  userSettings: UserSettings;
  activeTab: MainNavTab;
  setActiveTab: (tab: MainNavTab) => void;
  isAddTaskModalOpen: boolean;
  editingTask: Task | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: string;
  setFilterCategory: (c: string) => void;
  filterPriority: string;
  setFilterPriority: (p: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  timeConflict: ConflictInfo | null;
  dismissConflict: () => void;

  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  openAddTaskModal: (initialDateOrData?: Partial<Task> | string) => void;
  openEditTaskModal: (task: Task) => void;
  closeTaskModal: () => void;

  // Profile modal actions
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;

  // Follow-up actions
  addFollowUp: (item: Omit<FollowUpItem, 'id' | 'createdAt'>) => void;
  updateFollowUp: (id: string, updates: Partial<FollowUpItem>) => void;
  deleteFollowUp: (id: string) => void;

  // Settings & Category actions
  updateUserSettings: (updates: Partial<UserSettings>) => void;
  addCategory: (category: CategoryDef) => void;
  deleteCategory: (id: string) => void;

  // Data helpers
  resetToSampleData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;

  // Statistics
  stats: {
    total: number;
    done: number;
    inProgress: number;
    todo: number;
    waiting: number;
    overdue: number;
    urgent: number;
    completionRate: number;
  };
}

const WorkFlowContext = createContext<WorkFlowContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TASKS: 'workflow_tasks_v1',
  CATEGORIES: 'workflow_categories_v1',
  FOLLOW_UPS: 'workflow_followups_v1',
  SETTINGS: 'workflow_settings_v1',
};

export const WorkFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (saved) {
        const parsed: Task[] = JSON.parse(saved);
        const mockTaskIds = new Set(['task-1', 'task-2', 'task-3', 'task-4', 'task-5', 'task-6', 'task-7']);
        return parsed.filter((t) => !mockTaskIds.has(t.id));
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Load categories
  const [categories, setCategories] = useState<CategoryDef[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CATEGORIES;
  });

  // Load follow-ups
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
      if (saved) {
        const parsed: FollowUpItem[] = JSON.parse(saved);
        const mockFuIds = new Set(['fu-1', 'fu-2', 'fu-3', 'fu-4']);
        return parsed.filter((f) => !mockFuIds.has(f.id));
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Load settings
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USER_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<MainNavTab>('dashboard');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [timeConflict, setTimeConflict] = useState<ConflictInfo | null>(null);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(followUps));
  }, [followUps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(userSettings));
  }, [userSettings]);

  // Check for time conflicts whenever tasks change
  const checkForConflicts = (currentTasks: Task[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dateMap = new Map<string, Task[]>();

    for (const t of currentTasks) {
      if (t.status === 'done' || !t.startTime || !t.endTime) continue;
      const list = dateMap.get(t.dueDate) || [];
      list.push(t);
      dateMap.set(t.dueDate, list);
    }

    for (const [date, list] of dateMap.entries()) {
      if (list.length < 2) continue;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const t1 = list[i];
          const t2 = list[j];
          if (hasTimeConflict(t1.startTime, t1.endTime, t2.startTime, t2.endTime)) {
            return {
              task1: t1,
              task2: t2,
              message: `แจ้งเตือนเวลาซ้อนกันในวันที่ ${date}: "${t1.title}" (${t1.startTime}-${t1.endTime}) ชนกับ "${t2.title}" (${t2.startTime}-${t2.endTime})`,
            };
          }
        }
      }
    }
    return null;
  };

  const dismissConflict = () => {
    setTimeConflict(null);
  };

  // Trigger confetti effect on task completion
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#9B82D7', '#E9E1FF', '#DDF3E7', '#FCE3EF', '#FFF0D9'],
      });
    } catch (e) {
      // ignore
    }
  };

  const addTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>): string => {
    const id = `task-${Date.now()}`;
    const newTask: Task = {
      ...newTaskData,
      id,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => {
      const updated = [newTask, ...prev];
      const conflict = checkForConflicts(updated);
      if (conflict) setTimeConflict(conflict);
      return updated;
    });

    if (auth.currentUser) {
      setDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', id), {
        id,
        userId: auth.currentUser.uid,
        title: newTask.title,
        category: newTask.category,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.dueDate,
        startTime: newTask.startTime || '',
        endTime: newTask.endTime || '',
        description: newTask.description || '',
        department: newTask.department || '',
        isSharedWithFriends: true,
        createdAt: newTask.createdAt,
      }).catch((e) => console.warn('Sync task to firestore:', e));
    }

    return id;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      const conflict = checkForConflicts(updated);
      if (conflict) setTimeConflict(conflict);
      return updated;
    });

    if (auth.currentUser) {
      updateDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', id), updates).catch(() => {});
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (auth.currentUser) {
      deleteDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', id)).catch(() => {});
    }
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowDone = t.status !== 'done';
          if (isNowDone) {
            triggerCelebration();
          }
          if (auth.currentUser) {
            updateDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', id), {
              status: isNowDone ? 'done' : 'in_progress',
            }).catch(() => {});
          }
          return {
            ...t,
            status: isNowDone ? 'done' : 'in_progress',
            completedAt: isNowDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSub: { id: string; title: string; completed: boolean } = {
            id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: title.trim(),
            completed: false,
          };
          return { ...t, subtasks: [...t.subtasks, newSub] };
        }
        return t;
      })
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) };
        }
        return t;
      })
    );
  };

  const openAddTaskModal = (initialDateOrData?: Partial<Task> | string) => {
    if (typeof initialDateOrData === 'string') {
      setEditingTask({
        id: '',
        title: '',
        category: categories[0]?.name || 'ทั่วไป',
        priority: 'medium',
        status: 'todo',
        dueDate: initialDateOrData,
        startTime: '09:00',
        endTime: '10:00',
        subtasks: [],
        createdAt: '',
      });
    } else if (initialDateOrData && typeof initialDateOrData === 'object') {
      setEditingTask({
        id: '',
        title: initialDateOrData.title || '',
        category: initialDateOrData.category || categories[0]?.name || 'ทั่วไป',
        priority: initialDateOrData.priority || 'medium',
        status: initialDateOrData.status || 'todo',
        dueDate: initialDateOrData.dueDate || new Date().toISOString().split('T')[0],
        startTime: initialDateOrData.startTime || '09:00',
        endTime: initialDateOrData.endTime || '10:00',
        subtasks: initialDateOrData.subtasks || [],
        description: initialDateOrData.description || '',
        department: initialDateOrData.department || '',
        createdAt: '',
      });
    } else {
      setEditingTask(null);
    }
    setIsAddTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsAddTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setEditingTask(null);
  };

  // Follow-up actions
  const addFollowUp = (item: Omit<FollowUpItem, 'id' | 'createdAt'>) => {
    const newItem: FollowUpItem = {
      ...item,
      id: `fu-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFollowUps((prev) => [newItem, ...prev]);
  };

  const updateFollowUp = (id: string, updates: Partial<FollowUpItem>) => {
    setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteFollowUp = (id: string) => {
    setFollowUps((prev) => prev.filter((f) => f.id !== id));
  };

  // User Settings & Categories
  const updateUserSettings = (updates: Partial<UserSettings>) => {
    setUserSettings((prev) => ({ ...prev, ...updates }));
  };

  const addCategory = (category: CategoryDef) => {
    setCategories((prev) => [...prev, category]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const resetToSampleData = () => {
    setTasks(INITIAL_TASKS);
    setCategories(INITIAL_CATEGORIES);
    setFollowUps(INITIAL_FOLLOW_UPS);
    setUserSettings(INITIAL_USER_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.FOLLOW_UPS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  const exportDataJson = (): string => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      categories,
      followUps,
      userSettings,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (Array.isArray(data.followUps)) setFollowUps(data.followUps);
      if (data.userSettings) setUserSettings(data.userSettings);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  };

  // Compute stats
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let done = 0;
    let inProgress = 0;
    let todo = 0;
    let waiting = 0;
    let overdue = 0;
    let urgent = 0;

    for (const t of tasks) {
      if (t.status === 'done') {
        done++;
      } else {
        if (t.status === 'in_progress') inProgress++;
        if (t.status === 'todo') todo++;
        if (t.status === 'waiting') waiting++;

        if (t.dueDate < todayStr) overdue++;
        if (t.priority === 'urgent' || t.priority === 'high') urgent++;
      }
    }

    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      done,
      inProgress,
      todo,
      waiting,
      overdue,
      urgent,
      completionRate,
    };
  }, [tasks]);

  return (
    <WorkFlowContext.Provider
      value={{
        tasks,
        categories,
        followUps,
        userSettings,
        activeTab,
        setActiveTab,
        isAddTaskModalOpen,
        editingTask,
        searchQuery,
        setSearchQuery,
        filterCategory,
        setFilterCategory,
        filterPriority,
        setFilterPriority,
        filterStatus,
        setFilterStatus,
        timeConflict,
        dismissConflict,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        openAddTaskModal,
        openEditTaskModal,
        closeTaskModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        addFollowUp,
        updateFollowUp,
        deleteFollowUp,
        updateUserSettings,
        addCategory,
        deleteCategory,
        resetToSampleData,
        exportDataJson,
        importDataJson,
        stats,
      }}
    >
      {children}
    </WorkFlowContext.Provider>
  );
};

export const useWorkFlow = (): WorkFlowContextType => {
  const context = useContext(WorkFlowContext);
  if (!context) {
    throw new Error('useWorkFlow must be used within a WorkFlowProvider');
  }
  return context;
};
