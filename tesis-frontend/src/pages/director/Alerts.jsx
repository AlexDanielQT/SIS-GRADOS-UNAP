import React, { useState, useEffect } from 'react';
import { supabase } from '../../data/supabaseClient';
import Swal from 'sweetalert2';

const Alerts = ({ user }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // Filtros: all, danger, warning

  useEffect(() => {
    const fetchAndGenerateAlerts = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // A. Traer proyectos (Datos crudos)
        const { data: projects, error: projError } = await supabase
            .from('projects')
            .select('*, student:users!student_id(name, email)')
            .eq('advisor_id', user.id);

        if (projError) throw projError;

        // B. Traer lista de alertas YA archivadas por este usuario
        const { data: dismissedData, error: dismissError } = await supabase
            .from('dismissed_alerts')
            .select('alert_id')
            .eq('user_id', user.id);
            
        if (dismissError) throw dismissError;

        // Convertimos a un Set para filtrar rápido (ej: tiene 'risk-1', 'turnitin-5')
        const dismissedIds = new Set(dismissedData.map(d => d.alert_id));

        // C. Generar Alertas Dinámicas
        const generatedAlerts = [];
        const today = new Date();

        projects.forEach(p => {
          const studentName = p.student ? p.student.name : 'Estudiante';
          const studentEmail = p.student ? p.student.email : '';
          
          const endDate = new Date(p.end_date);
          const diffTime = endDate - today;
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // REGLA 1: Tiempos (Vencido o Por vencer)
          if (daysRemaining < 0 && p.status === 'En Ejecución') {
             generatedAlerts.push({
                id: `time-over-${p.id}`,
                type: 'danger',
                icon: 'fa-hourglass-end',
                title: 'Plazo Vencido',
                message: `El proyecto de ${studentName} venció el ${p.end_date} y sigue activo.`,
                date: `Hace ${Math.abs(daysRemaining)} días`,
                student: studentName,
                email: studentEmail
             });
          } else if (daysRemaining > 0 && daysRemaining <= 15 && p.status === 'En Ejecución') {
             generatedAlerts.push({
                id: `time-warn-${p.id}`,
                type: 'warning',
                icon: 'fa-clock',
                title: 'Cierre Próximo',
                message: `Quedan solo ${daysRemaining} días para finalizar el proyecto de ${studentName}.`,
                date: 'Por vencer',
                student: studentName,
                email: studentEmail
             });
          }

          // REGLA 2: Riesgo Alto
          if (p.risk_level === 'Alto') {
            generatedAlerts.push({
              id: `risk-${p.id}`,
              type: 'danger',
              icon: 'fa-triangle-exclamation',
              title: 'Riesgo Académico',
              message: `El proyecto de ${studentName} está marcado con Riesgo ALTO.`,
              date: 'Urgente',
              student: studentName,
              email: studentEmail
            });
          }

          // REGLA 3: Turnitin > 20%
          if (p.turnitin > 20) {
            generatedAlerts.push({
              id: `turnitin-${p.id}`,
              type: 'warning',
              icon: 'fa-file-circle-xmark',
              title: 'Similitud Alta (Turnitin)',
              message: `El informe de ${studentName} tiene ${p.turnitin}% de similitud.`,
              date: 'Revisión',
              student: studentName,
              email: studentEmail
            });
          }

          // REGLA 4: Observado
          if (p.status === 'Observado') {
            generatedAlerts.push({
              id: `obs-${p.id}`,
              type: 'info',
              icon: 'fa-circle-info',
              title: 'Correcciones Pendientes',
              message: `${studentName} tiene observaciones sin resolver.`,
              date: 'Seguimiento',
              student: studentName,
              email: studentEmail
            });
          }
        });

        // D. FILTRADO FINAL: Quitamos las que están en dismissedIds
        const visibleAlerts = generatedAlerts.filter(a => !dismissedIds.has(a.id));

        setAlerts(visibleAlerts);

      } catch (err) {
        console.error("Error alertas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndGenerateAlerts();
  }, [user]);

  // --- ACCIÓN: CONTACTAR (Simulado) ---
  const handleContact = (alert) => {
    Swal.fire({
        title: `Contactar a ${alert.student.split(' ')[0]}`,
        input: 'textarea',
        inputLabel: 'Mensaje:',
        inputValue: `Estimado(a) ${alert.student},\n\nAtención a la alerta: "${alert.title}".\n\nSaludos.`,
        showCancelButton: true,
        confirmButtonText: 'Enviar',
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('Enviado', `Notificación enviada a ${alert.email}`, 'success');
        }
    });
  };

  // --- ACCIÓN: ARCHIVAR (Guardar en BD) ---
  const handleDismiss = async (alertId) => {
    try {
        // 1. Guardar en Supabase
        const { error } = await supabase
            .from('dismissed_alerts')
            .insert([{
                user_id: user.id,
                alert_id: alertId
            }]);

        if (error) throw error;

        // 2. Eliminar visualmente (Optimistic UI)
        setAlerts(prev => prev.filter(a => a.id !== alertId));

        // 3. Feedback visual
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'success',
            title: 'Alerta archivada'
        });

    } catch (error) {
        Swal.fire('Error', 'No se pudo archivar la alerta: ' + error.message, 'error');
    }
  };

  // --- RENDER ---
  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);
  
  const getStyles = (type) => {
    switch(type) {
        case 'danger': return { borderLeft: '5px solid #dc2626', iconColor: '#dc2626', bg: '#fef2f2' };
        case 'warning': return { borderLeft: '5px solid #d97706', iconColor: '#d97706', bg: '#fffbeb' };
        default: return { borderLeft: '5px solid #3b82f6', iconColor: '#3b82f6', bg: '#eff6ff' };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '25px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Alertas Académicas</h2>
            <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Sistema de Alerta Temprana (SAT)</span>
        </div>
        <div style={{ display:'flex', gap:'5px' }}>
            <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')} style={{fontSize:'0.8rem', padding:'5px 10px'}}>Todas</button>
            <button className={`btn ${filter === 'danger' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('danger')} style={{fontSize:'0.8rem', padding:'5px 10px', color: filter==='danger'?'white':'#dc2626', borderColor:'#dc2626', background: filter==='danger'?'#dc2626':'transparent'}}>Críticas</button>
        </div>
      </div>

      {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
          </div>
      ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {filteredAlerts.length === 0 && (
                <div className="card" style={{ textAlign:'center', padding:'40px' }}>
                    <div style={{ fontSize:'3rem', color:'#10b981', marginBottom:'15px' }}><i className="fa-solid fa-shield-cat"></i></div>
                    <h3>Todo limpio</h3>
                    <p style={{ color:'var(--gray)' }}>No hay alertas activas en esta categoría.</p>
                </div>
            )}

            {filteredAlerts.map(alert => {
                const style = getStyles(alert.type);
                return (
                    <div key={alert.id} className="card" style={{ 
                        marginBottom: 0,
                        borderLeft: style.borderLeft,
                        display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '20px'
                    }}>
                        <div style={{ 
                            minWidth: '45px', height: '45px', borderRadius: '50%', 
                            background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem', color: style.iconColor
                        }}>
                            <i className={`fa-solid ${alert.icon}`}></i>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{alert.title}</h4>
                                <span style={{ fontSize:'0.75rem', color:'#64748b' }}>{alert.date}</span>
                            </div>
                            <p style={{ margin: '5px 0 15px 0', color: '#475569', fontSize:'0.9rem' }}>{alert.message}</p>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: '0.8rem', width: 'auto' }} onClick={() => handleContact(alert)}>
                                    <i className="fa-solid fa-envelope"></i> Notificar
                                </button>
                                <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.8rem', width: 'auto' }} onClick={() => handleDismiss(alert.id)}>
                                    <i className="fa-solid fa-check"></i> Archivar
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
      )}
    </div>
  );
};

export default Alerts;