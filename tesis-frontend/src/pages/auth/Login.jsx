import React, { useState } from 'react';
import { supabase } from '../../data/supabaseClient'; 
import { getRoleIcon } from '../../data/mockUsers'; 
import { logAction } from '../../data/auditService';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const roleButtons = [
    { role: 'investigador', label: 'Tesista / Investigador' },
    { role: 'director', label: 'Director / Asesor' },
    { role: 'soporte', label: 'Administrador' },
    { role: 'oficina', label: 'Oficina Investigación' }
  ];

  const handleRoleSelect = async (roleKey) => {
    setLoading(true);
    try {
      // CORRECCIÓN: Quitamos .single() para evitar el error de múltiples objetos JSON
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', roleKey)
        .eq('status', 'Activo')
        .limit(1); // Solo limitamos a 1, esto devuelve un array

      if (error) throw error;

      // Al no usar .single(), verificamos si el array 'data' tiene contenido
      if (data && data.length > 0) {
        const user = data[0]; // Tomamos el primer usuario encontrado

        // REGISTRAR EVENTO EN AUDITORÍA
        await logAction(user.id, 'LOGIN_SUCCESS', `Inicio de sesión exitoso como ${user.role}`);
        
        onLogin(user); 
      } else {
        alert("No se encontraron usuarios activos con este rol en la Base de Datos.");
      }
    } catch (err) {
      console.error("Error de conexión:", err.message);
      alert("Error al intentar ingresar. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen" style={{
      position: 'fixed', inset: 0, 
      background: 'linear-gradient(135deg, var(--primary) 0%, #3b0764 100%)', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 
    }}>
      <div className="login-box" style={{
        background: 'white', padding: '40px', borderRadius: '20px', 
        width: '90%', maxWidth: '800px', textAlign: 'center', 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        {loading ? (
           <div style={{ padding: '40px' }}>
             <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '3rem', color: 'var(--primary)' }}></i>
             <p style={{ marginTop: '15px', color: '#64748b' }}>Conectando a la Base de Datos...</p>
           </div>
        ) : (
           <>
            <i className="fa-solid fa-graduation-cap" style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '15px' }}></i>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '1.8rem' }}>SIS-GRADOS UNAP</h1>
            <p style={{ color: 'var(--gray)', margin: 0 }}>Plataforma Integral de Gestión de Investigación</p>
            
            <div className="roles-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '20px', marginTop: '40px'
            }}>
              {roleButtons.map((btn) => (
                <div 
                  key={btn.role} 
                  className="role-card" 
                  onClick={() => handleRoleSelect(btn.role)}
                  style={{
                    padding: '25px', border: '1px solid #e2e8f0', borderRadius: '16px', 
                    cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', 
                    background: 'white'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: 60, height: 60, background: '#f3e8ff', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className={`fa-solid ${getRoleIcon(btn.role)}`} style={{ fontSize: '1.8rem', color: 'var(--primary)' }}></i>
                  </div>
                  
                  <div>
                    <strong style={{ display:'block', fontSize:'0.95rem' }}>{btn.label}</strong>
                    <span style={{ fontSize:'0.75rem', color:'var(--gray)' }}>Ingreso Demo</span>
                  </div>
                </div>
              ))}
            </div>
            
            <p style={{ marginTop: '40px', fontSize: '0.8rem', color: '#94a3b8' }}>
              Seleccione un perfil para acceder al sistema en tiempo real
            </p>
           </>
        )}
      </div>
    </div>
  );
};

export default Login;