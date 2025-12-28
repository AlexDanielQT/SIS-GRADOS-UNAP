import React, { useState, useEffect } from 'react';
import { supabase } from '../../data/supabaseClient'; // Cliente BD

const Schedule = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DEL MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // true = Editar, false = Crear
  const [currentTaskId, setCurrentTaskId] = useState(null); // ID de la tarea a editar

  // Estado del Formulario
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    progress: 0
  });

  // 1. CARGAR DATOS
  const fetchSchedule = async () => {
    try {
      if (!user) return;

      // A. ID del Proyecto
      const { data: projectData, error: projError } = await supabase
        .from('projects')
        .select('id, title')
        .eq('student_id', user.id)
        .single();

      if (projError) throw projError;
      if (!projectData) return;

      setProjectTitle(projectData.title);
      setProjectId(projectData.id);

      // B. Tareas
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectData.id)
        .order('start_date', { ascending: true });

      if (tasksError) throw tasksError;
      setTasks(tasksData);

    } catch (error) {
      console.error("Error cargando cronograma:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [user]);

  // --- MANEJO DEL MODAL ---

  // A. Abrir para CREAR
  const openCreateModal = () => {
    if (!projectId) return alert("No tienes un proyecto asignado.");
    setIsEditing(false);
    setCurrentTaskId(null);
    // Valores por defecto: Hoy y Mañana
    const today = new Date().toISOString().split('T')[0];
    setFormData({
        name: '',
        start_date: today,
        end_date: today, // O sumar días si prefieres
        progress: 0
    });
    setShowModal(true);
  };

  // B. Abrir para EDITAR
  const openEditModal = (task) => {
    setIsEditing(true);
    setCurrentTaskId(task.id);
    setFormData({
        name: task.name,
        start_date: task.start_date,
        end_date: task.end_date,
        progress: task.progress
    });
    setShowModal(true);
  };

  // C. GUARDAR (Create o Update)
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Calculamos estado automático según progreso
    let computedStatus = 'Pendiente';
    if (formData.progress > 0 && formData.progress < 100) computedStatus = 'En Proceso';
    if (formData.progress == 100) computedStatus = 'Completado';

    const payload = {
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        progress: parseInt(formData.progress),
        status: computedStatus,
        project_id: projectId // Necesario para crear
    };

    try {
        if (isEditing) {
            // --- ACTUALIZAR ---
            const { error } = await supabase
                .from('tasks')
                .update(payload)
                .eq('id', currentTaskId);
            
            if (error) throw error;
            // Actualizar localmente
            setTasks(tasks.map(t => t.id === currentTaskId ? { ...t, ...payload } : t));

        } else {
            // --- CREAR ---
            const { data, error } = await supabase
                .from('tasks')
                .insert([payload])
                .select();
            
            if (error) throw error;
            // Agregar localmente
            setTasks([...tasks, data[0]]);
        }

        setShowModal(false);
    } catch (error) {
        alert("Error al guardar: " + error.message);
    }
  };

  // D. ELIMINAR
  const handleDeleteTask = async (id) => {
    if (!confirm("¿Eliminar esta actividad permanentemente?")) return;
    try {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
        setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
        alert("Error: " + error.message);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '25px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Cronograma de Actividades</h2>
          <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Gestión detallada de tiempos y entregables</span>
        </div>
      </div>

      {/* TABLA */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
            {loading ? 'Cargando...' : (projectTitle || 'Sin Proyecto')}
        </h3>

        {loading ? (
           <div style={{textAlign:'center', padding:'20px'}}><i className="fa-solid fa-spinner fa-spin"></i></div>
        ) : tasks.length === 0 ? (
           <p style={{color:'var(--gray)', textAlign:'center', padding:'20px'}}>No hay actividades registradas aún.</p>
        ) : (
          <div className="table-container">
            <table className="task-table">
            <thead>
                <tr style={{ color:'var(--gray)', fontSize:'0.85rem', textAlign:'left' }}>
                <th style={{ paddingLeft:15 }}>Actividad</th>
                <th>Fechas</th>
                <th>Responsable</th>
                <th>Avance</th>
                <th>Estado</th>
                <th style={{ textAlign:'right' }}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {tasks.map(task => (
                <tr key={task.id} className="task-row">
                    <td style={{ fontWeight:'600' }}>{task.name}</td>
                    <td style={{ fontSize:'0.85rem' }}>
                        <div style={{ color:'var(--gray)' }}>Del: {task.start_date}</div>
                        <div style={{ color:'var(--danger)' }}>Al: {task.end_date}</div>
                    </td>
                    <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                            <div style={{ width:24, height:24, background:'#e2e8f0', borderRadius:'50%', fontSize:'0.7rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                {user.name.charAt(0)}
                            </div>
                            <span style={{ fontSize:'0.85rem' }}>Tú</span>
                        </div>
                    </td>
                    <td style={{ width:'20%' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:2 }}>
                            <span>{task.progress}%</span>
                        </div>
                        <div className="progress-bg">
                            <div className="progress-fill" style={{ width: `${task.progress}%`, background: task.progress < 30 ? 'var(--danger)' : (task.progress < 100 ? 'var(--secondary)' : 'var(--success)') }}></div>
                        </div>
                    </td>
                    <td>
                        <span className={`badge ${task.status === 'Completado' ? 'bg-green' : (task.status === 'En Proceso' ? 'bg-blue' : 'bg-yellow')}`}>
                            {task.status}
                        </span>
                    </td>
                    <td style={{ textAlign:'right' }}>
                        <button className="btn btn-outline" style={{ padding:'5px 10px', marginRight:'5px' }} onClick={() => openEditModal(task)} title="Editar Detalles">
                            <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button className="btn btn-outline" style={{ padding:'5px 10px', color:'#ef4444', borderColor:'#ef4444' }} onClick={() => handleDeleteTask(task.id)} title="Eliminar">
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL UNIFICADO (CREAR / EDITAR) --- */}
      {showModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(3px)'
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '500px', margin: 0, padding: 0 }}>
                {/* Header Modal */}
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
                    <h3 style={{ margin: 0 }}>{isEditing ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
                    <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color:'#64748b' }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                {/* Body Form */}
                <form onSubmit={handleSave} style={{ padding: '25px' }}>
                    
                    {/* Input Nombre */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize:'0.9rem' }}>Descripción de la Tarea</label>
                        <input 
                            required 
                            type="text" 
                            className="form-control"
                            placeholder="Ej: Redacción del Marco Teórico"
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    {/* Row Fechas */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize:'0.9rem' }}>Fecha Inicio</label>
                            <input 
                                required 
                                type="date" 
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily:'inherit' }}
                                value={formData.start_date} 
                                onChange={e => setFormData({...formData, start_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize:'0.9rem' }}>Fecha Fin</label>
                            <input 
                                required 
                                type="date" 
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily:'inherit' }}
                                value={formData.end_date} 
                                onChange={e => setFormData({...formData, end_date: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Input Progreso (Slider + Number) */}
                    <div style={{ marginBottom: '25px', background:'#f8fafc', padding:'15px', borderRadius:'8px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                            <label style={{ fontWeight: '600', fontSize:'0.9rem' }}>Porcentaje de Avance</label>
                            <span style={{ fontWeight:'bold', color:'var(--primary)' }}>{formData.progress}%</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                style={{ flex: 1, cursor:'pointer' }}
                                value={formData.progress}
                                onChange={e => setFormData({...formData, progress: e.target.value})}
                            />
                            {/* Input numérico pequeño para precisión */}
                            <input 
                                type="number" 
                                min="0" max="100"
                                style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign:'center' }}
                                value={formData.progress}
                                onChange={e => setFormData({...formData, progress: e.target.value})}
                            />
                        </div>
                        <div style={{ fontSize:'0.8rem', color:'var(--gray)', marginTop:'5px' }}>
                            Estado automático: 
                            {formData.progress == 0 && <span className="badge bg-yellow" style={{marginLeft:5}}>Pendiente</span>}
                            {formData.progress > 0 && formData.progress < 100 && <span className="badge bg-blue" style={{marginLeft:5}}>En Proceso</span>}
                            {formData.progress == 100 && <span className="badge bg-green" style={{marginLeft:5}}>Completado</span>}
                        </div>
                    </div>
                    
                    {/* Footer Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop:'1px solid #f1f5f9', paddingTop:'15px' }}>
                        <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">
                            <i className="fa-solid fa-save"></i> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
        <button className="btn btn-primary" onClick={openCreateModal} style={{ width:'auto' }}>
            <i className="fa-solid fa-plus"></i> Nueva Tarea
        </button>
    </div>
  );
};

export default Schedule;