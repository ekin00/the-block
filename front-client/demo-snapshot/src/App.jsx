import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { UserProvider } from './context/UserContext';
import { DemoProvider } from './context/DemoContext';
import { DataGridDemoApp } from './DataGridDemo';
import Home from './pages/Home';
import './App.css';

export default function App() {
  return (
    <UserProvider>
      <DemoProvider>
        <BrowserRouter basename="/demo">
          <MainLayout>
            <Routes>
              <Route path="/welcome" element={<Home initialOpen />} />
              <Route path="/*" element={<DataGridDemoApp />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </DemoProvider>
    </UserProvider>
  );
}
