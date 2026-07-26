import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastStack } from './components/ToastStack';
import { useAuth } from './context/AuthContext';
import { homeByRole } from './lib/roleHome';
import { Login } from './pages/Login';
import { SignupRequestPage } from './pages/SignupRequestPage';
import { NotFound } from './pages/NotFound';
import { MemberDashboard } from './pages/member/MemberDashboard';
import { MemberClasses } from './pages/member/MemberClasses';
import { MemberRoutine } from './pages/member/MemberRoutine';
import { MemberMembership } from './pages/member/MemberMembership';
import { MemberProfile } from './pages/member/MemberProfile';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMembers } from './pages/admin/AdminMembers';
import { AdminMemberDetail } from './pages/admin/AdminMemberDetail';
import { AdminClasses } from './pages/admin/AdminClasses';
import { AdminTrainers } from './pages/admin/AdminTrainers';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminPackages } from './pages/admin/AdminPackages';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSignups } from './pages/admin/AdminSignups';
import { AdminAuditLog } from './pages/admin/AdminAuditLog';
import { TrainerSchedule } from './pages/trainer/TrainerSchedule';
import { TrainerStudents } from './pages/trainer/TrainerStudents';
import { TrainerProfile } from './pages/trainer/TrainerProfile';
import { CheckIn } from './pages/CheckIn';
import { StaffProfile } from './pages/StaffProfile';

function CatchAll() {
  const { session } = useAuth();
  return <NotFound homePath={session ? homeByRole[session.role] : '/login'} />;
}

export default function App() {
  return (
    <>
      <ToastStack />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/inscripcion" element={<SignupRequestPage />} />

        <Route
          element={
            <ProtectedRoute role="member">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<MemberDashboard />} />
          <Route path="/clases" element={<MemberClasses />} />
          <Route path="/rutina" element={<MemberRoutine />} />
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
          <Route path="/admin/checkin" element={<CheckIn />} />
          <Route path="/admin/miembros" element={<AdminMembers />} />
          <Route path="/admin/miembros/:id" element={<AdminMemberDetail />} />
          <Route path="/admin/clases" element={<AdminClasses />} />
          <Route path="/admin/entrenadores" element={<AdminTrainers />} />
          <Route path="/admin/pagos" element={<AdminPayments />} />
          <Route path="/admin/paquetes" element={<AdminPackages />} />
          <Route path="/admin/reportes" element={<AdminReports />} />
          <Route path="/admin/solicitudes" element={<AdminSignups />} />
          <Route path="/admin/bitacora" element={<AdminAuditLog />} />
          <Route path="/admin/perfil" element={<StaffProfile />} />
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
          <Route path="/entrenador/perfil" element={<TrainerProfile />} />
        </Route>

        <Route
          element={
            <ProtectedRoute role="reception">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/recepcion" element={<CheckIn />} />
          <Route path="/recepcion/pagos" element={<AdminPayments />} />
          <Route path="/recepcion/perfil" element={<StaffProfile />} />
        </Route>

        <Route path="*" element={<CatchAll />} />
      </Routes>
    </>
  );
}
