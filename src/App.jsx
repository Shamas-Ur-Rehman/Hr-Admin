import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import AddEmployee from './pages/AddEmployee';
import Branch from './pages/Branch';
import Attendance from './pages/Attendance';
import DashboardLyout from './pages/DashboardLyout';
import MainContent from './componets/MainContent';
import DailyActivity from './componets/DailyActivity';
import UserManagement from './componets/UserManagement';
import AddUser from './pages/AddUser';
import PayrollManagement from './pages/PayrollManagement';
import EmployeeManagement from './pages/AddEmployee';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/*" element={<DashboardLyout />}>
          <Route index element={<MainContent />} />
          <Route path="employee" element={<AddEmployee />} />
          <Route path="branch" element={<Branch />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="activity" element={<DailyActivity />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="addUser" element={<AddUser />} />
          <Route path="payroll" element={<PayrollManagement />} />





        </Route>
      </Routes>
  );
}

export default App;
