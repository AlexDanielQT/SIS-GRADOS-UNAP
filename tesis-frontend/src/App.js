import React, { useState } from 'react';

// 1. ESTILOS GLOBALES
import './scss/style.scss'; 
import './assets/styles/custom.css';

// 2. COMPONENTES ESTRUCTURALES
import Sidebar from './components/layout/Sidebar';
import Login from './pages/auth/Login';

// 3. VISTAS - INVESTIGADOR (Tesista)
import MyProject from './pages/investigador/MyProject';
import Repository from './pages/investigador/Repository';
import Schedule from './pages/investigador/Schedule';

// 4. VISTAS - DIRECTOR (Asesor)
import Supervision from './pages/director/Supervision';
import Alerts from './pages/director/Alerts';

// 5. VISTAS - SOPORTE (Admin)
import UserManagement from './pages/soporte/UserManagement';
import AuditLog from './pages/soporte/AuditLog';

// 6. VISTAS - OFICINA (Jefe)
import GeneralDashboard from './pages/oficina/GeneralDashboard';
import Reports from './pages/oficina/Reports';


function App() {
  // --- ESTADO GLOBAL ---
  const [user, setUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('home'); 

  // --- HANDLER DE LOGIN ---
  const handleLogin = (selectedUser) => {
    setUser(selectedUser);
    
    // DEFINIR LA PESTAÑA INICIAL AUTOMÁTICA SEGÚN EL ROL
    if (selectedUser.role === 'investigador') setActiveTab('project');
    else if (selectedUser.role === 'director') setActiveTab('supervision');
    else if (selectedUser.role === 'soporte') setActiveTab('users');
    else if (selectedUser.role === 'oficina') setActiveTab('dashboard');
    else setActiveTab('home');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('home');
  };

  // --- RENDERIZADO: PANTALLA DE LOGIN ---
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // --- RENDERIZADO: SISTEMA PRINCIPAL (LAYOUT) ---
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f1f5f9' }}>
      
      {/* 1. BARRA LATERAL (MENU) */}
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      {/* 2. ÁREA DE CONTENIDO DINÁMICO */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '30px', position: 'relative' }}>
        
        {/* =======================================================
            ROL: INVESTIGADOR / TESISTA
           ======================================================= */}
        {user.role === 'investigador' && activeTab === 'project' && (
            <MyProject user={user} />
        )}
        {user.role === 'investigador' && activeTab === 'schedule' && (
            <Schedule user={user} />
        )}
        {/* AQUÍ ESTABA EL ERROR: Ahora pasamos user={user} */}
        {user.role === 'investigador' && (activeTab === 'repo' || activeTab === 'repository') && (
            <Repository user={user} />
        )}


        {/* =======================================================
            ROL: DIRECTOR / ASESOR
           ======================================================= */}
        {user.role === 'director' && activeTab === 'supervision' && (
            <Supervision user={user} />
        )}
        {user.role === 'director' && activeTab === 'alerts' && (
            <Alerts user={user} />
        )}


        {/* =======================================================
            ROL: SOPORTE / ADMINISTRADOR
           ======================================================= */}
        {user.role === 'soporte' && activeTab === 'users' && (
            <UserManagement />
        )}
        {user.role === 'soporte' && activeTab === 'audit' && (
            <AuditLog />
        )}
        {user.role === 'soporte' && activeTab === 'backup' && (
            <div className="card">
                <h3><i className="fa-solid fa-database"></i> Copias de Seguridad</h3>
                <p>Historial de backups de la base de datos PostgreSQL.</p>
                <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', borderLeft: '4px solid #0ea5e9' }}>
                    <strong>Estado:</strong> Copia automática programada para las 00:00 hrs.
                </div>
                <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => alert("Simulando Backup...")}>
                    Generar Backup Manual
                </button>
            </div>
        )}


        {/* =======================================================
            ROL: OFICINA DE INVESTIGACIÓN
           ======================================================= */}
        {user.role === 'oficina' && (activeTab === 'dashboard' || activeTab === 'kpis') && (
            <GeneralDashboard />
        )}
        {user.role === 'oficina' && activeTab === 'reports' && (
            <Reports />
        )}

      </main>
    </div>
  );
}

export default App;