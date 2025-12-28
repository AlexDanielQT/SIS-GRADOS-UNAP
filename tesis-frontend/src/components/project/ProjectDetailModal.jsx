import React from 'react';
import Stepper from './Stepper';

const ProjectDetailModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', // Fondo oscuro semitransparente
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(3px)'
    }}>
      <div className="card" style={{
        width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
        margin: 0, position: 'relative', padding: '0'
      }}>
        
        {/* --- HEADER DEL MODAL --- */}
        <div style={{
          padding: '20px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#f8fafc', borderRadius: '16px 16px 0 0'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Detalle del Proyecto</h3>
            <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
              Estudiante: <strong>{project.studentName}</strong>
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--gray)'
          }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* --- CUERPO DEL MODAL --- */}
        <div style={{ padding: '30px' }}>
          
          {/* Título y Estado */}
          <div style={{ marginBottom: '30px' }}>
             <span className={`badge ${project.status === 'En Ejecución' ? 'bg-blue' : 'bg-yellow'}`} style={{ marginBottom: 10 }}>
                {project.status}
             </span>
             <h2 style={{ fontSize: '1.4rem', margin: '0 0 10px 0', lineHeight: '1.3' }}>
               {project.title}
             </h2>
             <div style={{ display:'flex', gap:'20px', fontSize:'0.9rem', color:'var(--gray)' }}>
                <span><i className="fa-solid fa-building-columns"></i> {project.faculty}</span>
                <span><i className="fa-solid fa-money-bill"></i> Presupuesto: S/ {project.budget}</span>
             </div>
          </div>

          {/* Línea de Tiempo (Stepper) */}
          <div style={{ background:'#f8fafc', padding:'10px', borderRadius:'12px', marginBottom:'30px' }}>
             <h4 style={{ margin:'10px 0 0 10px', fontSize:'0.9rem', color:'var(--gray)' }}>Progreso de Fases</h4>
             <div style={{ transform: 'scale(0.9)', margin:'-20px 0' }}>
               <Stepper currentPhase={project.phase} />
             </div>
          </div>

          {/* Grid de Información Crítica */}
          <div className="info-grid" style={{ marginBottom:'30px' }}>
             
             {/* Caja de Turnitin */}
             <div style={{ border:'1px solid #e2e8f0', borderRadius:'8px', padding:'15px' }}>
                <h4 style={{ margin:'0 0 10px 0', fontSize:'1rem' }}>
                    <i className="fa-solid fa-file-lines"></i> Reporte de Similitud
                </h4>
                <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>
                    <div style={{ 
                        fontSize:'2rem', fontWeight:'bold', 
                        color: project.turnitin > 20 ? 'var(--danger)' : 'var(--success)' 
                    }}>
                        {project.turnitin}%
                    </div>
                    <div style={{ fontSize:'0.8rem', color:'var(--gray)', lineHeight:'1.2' }}>
                        {project.turnitin > 20 
                            ? "El índice supera el umbral permitido (20%). Se recomienda revisar."
                            : "El índice se encuentra dentro de los parámetros aceptables."
                        }
                    </div>
                </div>
             </div>

             {/* Caja de Archivos (Simulada) */}
             <div style={{ border:'1px solid #e2e8f0', borderRadius:'8px', padding:'15px' }}>
                <h4 style={{ margin:'0 0 10px 0', fontSize:'1rem' }}>
                    <i className="fa-solid fa-folder-open"></i> Archivos Recientes
                </h4>
                <ul style={{ listStyle:'none', padding:0, margin:0, fontSize:'0.85rem' }}>
                    <li style={{ padding:'5px 0', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between' }}>
                        <span><i className="fa-solid fa-file-pdf" style={{color:'var(--danger)'}}></i> Borrador_V2.pdf</span>
                        <a href="#" style={{color:'var(--primary)'}}>Ver</a>
                    </li>
                    <li style={{ padding:'5px 0', display:'flex', justifyContent:'space-between' }}>
                        <span><i className="fa-solid fa-file-word" style={{color:'#2563eb'}}></i> Matriz_Datos.docx</span>
                        <a href="#" style={{color:'var(--primary)'}}>Ver</a>
                    </li>
                </ul>
             </div>

          </div>

        </div>

        {/* --- FOOTER CON ACCIONES --- */}
        <div style={{
          padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
          borderRadius: '0 0 16px 16px', display: 'flex', justifyContent: 'flex-end', gap: '10px'
        }}>
          <button className="btn btn-outline" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={() => { alert("Descargando informe completo..."); }}>
            <i className="fa-solid fa-download"></i> Descargar Expte.
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectDetailModal;