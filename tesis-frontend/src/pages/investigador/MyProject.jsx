import React, { useState, useEffect } from 'react';
import { supabase } from '../../data/supabaseClient'; // Conexión a BD
import Stepper from '../../components/project/Stepper'; 

const MyProject = ({ user }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para traer datos de la nube
    const fetchProjectData = async () => {
      if (!user || !user.id) return;

      try {
        // 1. Traemos el proyecto del usuario logueado
        // Nota: usamos .select(`*, advisor:users!advisor_id(name)`) para hacer un JOIN y traer el nombre del asesor
        const { data, error } = await supabase
          .from('projects')
          .select('*, advisor:users!advisor_id(name)') 
          .eq('student_id', user.id)
          .single();

        if (error) {
           console.warn("No se encontró proyecto (o error de conexión):", error.message);
        } else if (data) {
           // Mapeamos los datos de la BD (snake_case) al formato que usa tu UI (camelCase)
           const formattedProject = {
             ...data,
             advisorName: data.advisor ? data.advisor.name : 'Asesor No Asignado', // Nombre extraído del JOIN
             // Los demás campos (title, status, phase, turnitin) coinciden con la BD
           };
           setProject(formattedProject);
        }
      } catch (err) {
        console.error("Error general:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [user]);

  // --- RENDERIZADO ---

  if (loading) {
    return (
      <div className="card" style={{ textAlign:'center', padding:'50px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize:'2rem', color:'var(--primary)' }}></i>
        <p>Cargando información de tu proyecto...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card">
        <h3><i className="fa-solid fa-folder-plus"></i> Sin Proyecto</h3>
        <p>Actualmente no tienes un proyecto de tesis registrado en la base de datos.</p>
        <button className="btn btn-primary">Registrar Nuevo Proyecto</button>
      </div>
    );
  }

  return (
    <div>
      {/* TÍTULO PRINCIPAL */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Mi Camino al Título</h2>
        <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Gestión de trámites académicos y de Investigación</span>
      </div>

      {/* --- TARJETA GRANDE SUPERIOR --- */}
      <div className="card">
        
        {/* Encabezado: Badge y Estado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span className="badge bg-purple">Tesis Universitaria</span>
          <span className={`badge ${project.status === 'En Ejecución' ? 'bg-blue' : 'bg-yellow'}`}>
            {project.status}
          </span>
        </div>

        {/* Título de Tesis */}
        <h3 style={{ fontSize: '1.3rem', margin: '0 0 5px 0' }}>{project.title}</h3>
        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
          <i className="fa-solid fa-user-tie"></i> Asesor: <strong>{project.advisorName}</strong>
        </div>

        {/* STEPPER (Línea de tiempo) */}
        <Stepper currentPhase={project.phase} />

        {/* Caja Gris Inferior (Turnitin y Botón) */}
        <div style={{ 
          marginTop: '30px', 
          backgroundColor: '#f8fafc', 
          padding: '20px', 
          borderRadius: '12px',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#5c2d91', fontWeight: 'bold' }}>Estado Actual: {project.status}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Índice de Similitud (Turnitin)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>{project.turnitin || 0}%</div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '5px' }}>Acciones Pendientes</div>
            <button className="btn btn-outline" style={{ padding: '8px 16px', width: 'auto' }}>
              <i className="fa-solid fa-upload"></i> Subir Informe Avance
            </button>
          </div>
        </div>
      </div>

      {/* --- GRID INFERIOR (Dos Tarjetas) --- */ }
      <div className="info-grid">
        
        {/* Tarjeta Izquierda: Requisitos */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h4 style={{ color: '#d97706', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-list-check"></i> Requisitos Admin.
          </h4>
          
          <div className="req-item">
            <span><i className="fa-solid fa-check" style={{ color: '#059669', marginRight: '8px' }}></i> Grado Bachiller</span>
            <span className="badge bg-green">OK</span>
          </div>
          
          <div className="req-item">
            <span><i className="fa-solid fa-check" style={{ color: '#059669', marginRight: '8px' }}></i> Constancia Idiomas</span>
            <span className="badge bg-green">OK</span>
          </div>

          <div className="req-item">
             <span><i className="fa-solid fa-xmark" style={{ color: '#dc2626', marginRight: '8px' }}></i> Constancia No Adeudar</span>
             <span className="badge bg-red">PENDIENTE</span>
          </div>

          <button className="btn btn-outline" style={{ marginTop: '20px' }}>
            Solicitar Constancia Faltante
          </button>
        </div>

        {/* Tarjeta Derecha: Repositorio */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ color: '#5c2d91', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-book"></i> Repositorio
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
              Recuerda que para la sustentación, tu tesis debe estar subida al repositorio institucional y tener el acta de conformidad.
            </p>
          </div>
          
          <button className="btn btn-primary" onClick={() => window.open('https://repositorio.unap.edu.pe', '_blank')}>
            <i className="fa-solid fa-up-right-from-square"></i> Ir al Repositorio UNAP
          </button>
        </div>

      </div>
    </div>
  );
};

export default MyProject;