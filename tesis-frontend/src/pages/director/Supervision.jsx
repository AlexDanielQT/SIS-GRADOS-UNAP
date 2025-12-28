import React, { useState, useEffect } from 'react';
import { supabase } from '../../data/supabaseClient'; 
import ProjectDetailModal from '../../components/project/ProjectDetailModal';
import Swal from 'sweetalert2'; 
// 1. IMPORTAR LOG
import { logAction } from '../../data/auditService';

const Supervision = ({ user }) => {
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*, student:users!student_id(name)') 
        .eq('advisor_id', user.id)
        .order('id', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(p => ({
        ...p,
        studentId: p.student_id,
        advisorId: p.advisor_id,
        riskLevel: p.risk_level, 
        studentName: p.student ? p.student.name : 'Estudiante Desconocido',
      }));

      setMyProjects(formattedData);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  // --- APROBAR ---
  const handleApprove = (project) => {
    const currentPhase = project.phase || 1;

    if (project.status === 'Finalizado') {
      Swal.fire('Información', 'Este proyecto ya ha concluido exitosamente.', 'info');
      return;
    }

    const isLastStep = currentPhase === 4;
    const nextPhase = isLastStep ? 4 : currentPhase + 1;

    const titleText = isLastStep ? '¿Confirmar Sustentación?' : '¿Aprobar Avance?';
    const bodyText = isLastStep
      ? `Al aprobar, <b>${project.studentName}</b> obtendrá el grado y el proyecto finalizará.`
      : `El estudiante avanzará a la <b>Fase ${nextPhase}</b>.`;

    Swal.fire({
      title: titleText,
      html: bodyText,
      icon: isLastStep ? 'success' : 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: isLastStep ? 'Sí, Finalizar' : 'Sí, Aprobar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            const updates = isLastStep 
                ? { status: 'Finalizado', phase: 4, risk_level: 'Bajo' } 
                : { status: 'En Ejecución', phase: nextPhase, risk_level: 'Bajo' };

            const { error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', project.id);

            if (error) throw error;

            // --- 2. REGISTRAR EVENTO ---
            await logAction(user.id, 'PHASE_APPROVE', isLastStep 
              ? `Finalizó proyecto de ${project.studentName} (Sustentación)`
              : `Aprobó avance a Fase ${nextPhase} para ${project.studentName}`);

            Swal.fire(
              isLastStep ? '¡Felicidades!' : '¡Aprobado!',
              'El estado del proyecto ha sido actualizado.',
              'success'
            );
            fetchProjects(); 
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
      }
    });
  };

  // --- OBSERVAR ---
  const handleReject = (projectId) => {
    Swal.fire({
      title: 'Registrar Observación',
      input: 'textarea',
      inputLabel: 'Detalle el motivo:',
      inputPlaceholder: 'Ej: Faltan referencias...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) return '¡Debes escribir un motivo!';
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const reason = result.value;
        try {
            const { error: obsError } = await supabase
                .from('observations')
                .insert([{
                    project_id: projectId,
                    director_id: user.id,
                    comment: reason,
                    is_resolved: false
                }]);
            
            if (obsError) throw obsError;

            const { error: projError } = await supabase
                .from('projects')
                .update({ status: 'Observado', risk_level: 'Alto' })
                .eq('id', projectId);

            if (projError) throw projError;

            // --- 2. REGISTRAR EVENTO ---
            await logAction(user.id, 'OBSERVATION_CREATE', `Registró observación para proyecto ID ${projectId}`);

            Swal.fire('Enviado', 'Se ha notificado al estudiante.', 'success');
            fetchProjects(); 
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
      }
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Supervisión de Proyectos</h2>
        <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Gestión y aprobación de avances (Datos Reales)</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ marginBottom: 0, padding: '20px', display:'flex', alignItems:'center', gap:'15px' }}>
            <div style={{ width: 50, height: 50, borderRadius: '12px', background: '#dbeafe', color: '#1e40af', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}><i className="fa-solid fa-users"></i></div>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{loading ? '...' : myProjects.length}</h3>
                <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>Tesistas Asignados</span>
            </div>
        </div>
        <div className="card" style={{ marginBottom: 0, padding: '20px', display:'flex', alignItems:'center', gap:'15px' }}>
            <div style={{ width: 50, height: 50, borderRadius: '12px', background: '#fef9c3', color: '#854d0e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}><i className="fa-solid fa-clock"></i></div>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
                    {loading ? '...' : myProjects.filter(p => p.status === 'Pendiente' || p.status === 'En Ejecución').length}
                </h3>
                <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>Pendientes Revisión</span>
            </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Listado de Estudiantes</h3>
        
        {loading ? (
            <div style={{ textAlign:'center', padding:'20px' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando...</div>
        ) : (
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Proyecto</th>
                            <th>Fase</th>
                            <th>Riesgo</th>
                            <th>Estado</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myProjects.length === 0 && (
                            <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>No tienes tesistas asignados.</td></tr>
                        )}
                        {myProjects.map(project => (
                            <tr key={project.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span className="table-avatar" style={{background:'#3b82f6'}}>
                                            {project.studentName ? project.studentName.substring(0,2).toUpperCase() : 'NN'}
                                        </span>
                                        <div>
                                            <strong style={{ display: 'block', fontSize: '0.9rem' }}>{project.studentName}</strong>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>ID: {project.studentId}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{project.title ? project.title.substring(0, 40) : 'Sin Título'}...</td>
                                <td><span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Fase {project.phase}</span></td>
                                <td>
                                    {project.riskLevel === 'Alto' ? <span className="badge bg-red">Alto</span> : <span className="badge bg-green">Bajo</span>}
                                </td>
                                <td>
                                    <span className={`badge ${project.status === 'Aprobado' ? 'bg-green' : (project.status === 'Observado' ? 'bg-red' : 'bg-yellow')}`}>
                                        {project.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-primary" style={{ padding: '6px 12px' }} title="Aprobar" onClick={() => handleApprove(project)}>
                                            <i className="fa-solid fa-check"></i>
                                        </button>
                                        <button className="btn btn-outline" style={{ padding: '6px 12px', borderColor:'var(--danger)', color:'var(--danger)' }} title="Observar" onClick={() => handleReject(project.id)}>
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                        <button className="btn btn-outline" style={{ padding: '6px 12px' }} title="Ver Detalles" onClick={() => setSelectedProject(project)}>
                                            <i className="fa-solid fa-eye"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {selectedProject && (
        <ProjectDetailModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
        />
      )}
    </div>
  );
};

export default Supervision;