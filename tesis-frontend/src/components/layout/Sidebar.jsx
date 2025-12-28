import React from 'react';
// Aseguramos que los iconos funcionen (aunque ya están en index.html, es buena práctica tenerlos presentes)

const Sidebar = ({ user, activeTab, setActiveTab, onLogout }) => {
  
  // Definición de Menús por Rol (Igual que en tu prototipo HTML)
  const getMenu = (role) => {
    switch(role) {
      case 'investigador':
      return [
        { id: 'project', icon: 'fa-folder-open', label: 'Mi Proyecto' },
        { id: 'schedule', icon: 'fa-calendar-days', label: 'Cronograma' }, // <--- NUEVA LÍNEA
        { id: 'repo', icon: 'fa-book', label: 'Repositorio' }
      ];
      case 'director':
        return [
          { id: 'supervision', icon: 'fa-list-check', label: 'Supervisión' },
          { id: 'alerts', icon: 'fa-bell', label: 'Alertas' }
        ];
      case 'soporte': // Antes 'admin'
        return [
          { id: 'users', icon: 'fa-users-gear', label: 'Usuarios' },
          { id: 'audit', icon: 'fa-shield-halved', label: 'Auditoría' }
        ];
      case 'oficina':
        return [
          { id: 'kpis', icon: 'fa-chart-line', label: 'KPIs' },
          { id: 'reports', icon: 'fa-file-export', label: 'Reportes' }
        ];
      default:
        return [{ id: 'home', icon: 'fa-home', label: 'Inicio' }];
    }
  };

  const menuItems = getMenu(user?.role);

  return (
    <aside style={{ width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      
      {/* 1. ENCABEZADO (Logo UNAP) */}
      <div className="sidebar-head" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ 
          width: '35px', height: '35px', 
          background: 'var(--primary)', 
          borderRadius: '8px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: 'white', fontWeight: 'bold' 
        }}>
          U
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>UNAP</h3>
          <small style={{ color: 'var(--gray)' }}>Investigación</small>
        </div>
      </div>

      {/* 2. LISTA DE NAVEGACIÓN */}
      <ul className="nav-list" style={{ listStyle: 'none', padding: '20px', flex: 1, margin: 0 }}>
        {menuItems.map((item, index) => (
          <li 
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px', marginBottom: '5px',
              borderRadius: '8px', cursor: 'pointer', transition: '0.2s',
              // Aplicamos estilos condicionales aquí para asegurar que se vea igual al HTML
              background: activeTab === item.id ? '#f3e8ff' : 'transparent',
              color: activeTab === item.id ? 'var(--primary)' : 'var(--gray)',
              fontWeight: activeTab === item.id ? '600' : 'normal'
            }}
          >
            <i className={`fa-solid ${item.icon}`} style={{ width: '20px', textAlign: 'center' }}></i>
            {item.label}
          </li>
        ))}
      </ul>

      {/* 3. PIE DE PÁGINA (Usuario) */}
      <div className="user-foot" style={{ 
        padding: '20px', borderTop: '1px solid #e2e8f0', 
        display: 'flex', alignItems: 'center', gap: '10px', 
        background: '#f8fafc' 
      }}>
        {/* Avatar Circular con Iniciales */}
        <div style={{ 
          width: '35px', height: '35px', 
          background: 'var(--secondary)', 
          borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: 'white', fontWeight: 'bold', fontSize: '0.9rem'
        }}>
          {user?.avatar || user?.name.substring(0,2).toUpperCase()}
        </div>

        {/* Info Texto */}
        <div style={{ flex: 1 }}>
          <strong style={{ display: 'block', fontSize: '0.9rem', lineHeight: '1.2' }}>{user?.name}</strong>
          <small style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>{user?.label}</small>
        </div>

        {/* Botón Salir */}
        <button 
          onClick={onLogout} 
          style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem' }}
          title="Cerrar Sesión"
        >
          <i className="fa-solid fa-power-off"></i>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;