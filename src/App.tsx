import React, { useState } from 'react';
import { WorkFlowProvider, useWorkFlow } from './context/WorkFlowContext';
import { PWAProvider } from './context/PWAContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { CalendarView } from './components/calendar/CalendarView';
import { TasksView } from './components/tasks/TasksView';
import { RemindersView } from './components/reminders/RemindersView';
import { FollowUpView } from './components/followup/FollowUpView';
import { FriendsView } from './components/friends/FriendsView';
import { AiAssistantView } from './components/ai/AiAssistantView';
import { WeeklyReportView } from './components/weekly/WeeklyReportView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskModal } from './components/tasks/TaskModal';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { PWAInstallModals } from './components/pwa/PWAInstallModals';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const { activeTab } = useWorkFlow();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F7FC] text-[#514B62]">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Sticky Header */}
        <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-safe">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'tasks' && <TasksView />}
            {activeTab === 'friends' && <FriendsView />}
            {activeTab === 'reminders' && <RemindersView />}
            {activeTab === 'followup' && <FollowUpView />}
            {activeTab === 'ai' && <AiAssistantView />}
            {activeTab === 'weekly' && <WeeklyReportView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Task Modal */}
      <TaskModal />

      {/* Global Profile Edit Modal */}
      <EditProfileModal />

      {/* PWA Install & iOS Guidance Modals */}
      <PWAInstallModals />

      {/* Firebase Auth Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <PWAProvider>
      <AuthProvider>
        <WorkFlowProvider>
          <AppContent />
        </WorkFlowProvider>
      </AuthProvider>
    </PWAProvider>
  );
}

