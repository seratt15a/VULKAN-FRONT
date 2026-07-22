import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastStack } from './components/ToastStack';
import { Login } from './pages/Login';
import { MemberDashboard } from './pages/member/MemberDashboard';
import { MemberClasses } from './pages/member/MemberClasses';
import { MemberMembership } from './pages/member/MemberMembership';
import { MemberProfile } from './pages/member/MemberProfile';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMembers } from './pages/admin/AdminMembers';
import { AdminClasses } from './pages/admin/AdminClasses';
import { AdminTrainers } from './pages/admin/AdminTrainers';
import { AdminPayments } from './pages/admin/AdminPayments';
import { TrainerSchedule } from './pages/trainer/TrainerSchedule';
import { TrainerStudents } from './pages/trainer/TrainerStudents';

export default function App() {
  return (
    <>
      <ToastStack />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute role="member">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<MemberDashboard />} />
          <Route path="/clases" element={<MemberClasses />} />
          <Route path="/membresia" element={<MemberMembership />} />
          <Route path="/perfil" element={<MemberProfile />} />
        </Route>

        <Route
          element={
            <ProtectedRoute role="admin">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/miembros" element={<AdminMembers />} />
          <Route path="/admin/clases" element={<AdminClasses />} />
          <Route path="/admin/entrenadores" element={<AdminTrainers />} />
          <Route path="/admin/pagos" element={<AdminPayments />} />
        </Route>

        <Route
          element={
            <ProtectedRoute role="trainer">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/entrenador" element={<TrainerSchedule />} />
          <Route path="/entrenador/alumnos" element={<TrainerStudents />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
