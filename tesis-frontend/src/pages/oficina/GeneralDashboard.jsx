import React, { useState, useEffect } from 'react';
import { supabase } from '../../data/supabaseClient';

const GeneralDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    risk: 0,
    budget: 0,
    faculties: [],
    loading: true
  });

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    try {
      // 1. Obtener todos los proyectos
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*');

      if (error) throw error;

      // 2. Procesar estadísticas locales (Agregación)
      const total = projects.length;
      const completed = projects.filter(p => p.status === 'Finalizado').length;
      const risk = projects.filter(p => p.risk_level === 'Alto').length;
      const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

      // 3. Agrupar por facultades de forma dinámica
      const facultyGroups = projects.reduce((acc, p) => {
        const fac = p.faculty || 'Otras';
        acc[fac] = (acc[fac] || 0) + 1;
        return acc;
      }, {});

      const facultyList = Object.keys(facultyGroups).map((name, index) => ({
        name,
        count: facultyGroups[name],
        color: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'][index % 5]
      }));

      setStats({
        total,
        completed,
        risk,
        budget: totalBudget,
        faculties: facultyList,
        loading: false
      });

    } catch (err) {
      console.error("Error en Dashboard:", err.message);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
            <p>Generando indicadores institucionales...</p>
        </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Dashboard Institucional</h2>
            <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Monitoreo de investigación en tiempo real</span>
        </div>
        <div style={{ background: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <i className="fa-solid fa-calendar"></i> Año Académico 2025
        </div>
      </div>

      {/* TARJETAS DE KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        <div className="card" style={{ marginBottom: 0, borderLeft: '4px solid #6366f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <span style={{ color: 'var(--gray)', fontSize: '0.85rem', fontWeight: '600' }}>TOTAL TESIS</span>
                    <h3 style={{ fontSize: '2rem', margin: '5px 0' }}>{stats.total}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Registradas en sistema</span>
                </div>
                <div style={{ padding: '10px', background: '#e0e7ff', borderRadius: '8px', color: '#6366f1' }}>
                    <i className="fa-solid fa-folder-tree"></i>
                </div>
            </div>
        </div>

        <div className="card" style={{ marginBottom: 0, borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <span style={{ color: 'var(--gray)', fontSize: '0.85rem', fontWeight: '600' }}>SUSTENTADAS</span>
                    <h3 style={{ fontSize: '2rem', margin: '5px 0' }}>{stats.completed}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Grados obtenidos</span>
                </div>
                <div style={{ padding: '10px', background: '#d1fae5', borderRadius: '8px', color: '#10b981' }}>
                    <i className="fa-solid fa-check-double"></i>
                </div>
            </div>
        </div>

        <div className="card" style={{ marginBottom: 0, borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <span style={{ color: 'var(--gray)', fontSize: '0.85rem', fontWeight: '600' }}>ALERTAS SAT</span>
                    <h3 style={{ fontSize: '2rem', margin: '5px 0' }}>{stats.risk}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>Críticos / Riesgo alto</span>
                </div>
                <div style={{ padding: '10px', background: '#fee2e2', borderRadius: '8px', color: '#ef4444' }}>
                    <i className="fa-solid fa-bell"></i>
                </div>
            </div>
        </div>

        <div className="card" style={{ marginBottom: 0, borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                    <span style={{ color: 'var(--gray)', fontSize: '0.85rem', fontWeight: '600' }}>INVERSIÓN TOTAL</span>
                    <h3 style={{ fontSize: '2rem', margin: '5px 0' }}>S/ {(stats.budget / 1000).toFixed(1)}k</h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Presupuesto asignado</span>
                </div>
                <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '8px', color: '#f59e0b' }}>
                    <i className="fa-solid fa-coins"></i>
                </div>
            </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* GRÁFICO DE BARRAS DINÁMICO */}
        <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Proyectos por Facultad</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {stats.faculties.length > 0 ? stats.faculties.map((fac, index) => (
                    <div key={index}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: '600' }}>{fac.name}</span>
                            <span style={{ color: 'var(--gray)' }}>{fac.count} tesis</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: `${(fac.count / stats.total) * 100}%`, 
                                height: '100%', 
                                background: fac.color, 
                                borderRadius: '5px' 
                            }}></div>
                        </div>
                    </div>
                )) : <p>No hay datos por facultad disponibles.</p>}
            </div>
        </div>

        {/* ESTADO GLOBAL (DONUT CHART CSS) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', alignSelf: 'flex-start' }}>Estado Global</h3>
            
            <div style={{ 
                width: '180px', height: '180px', borderRadius: '50%', 
                background: `conic-gradient(#10b981 0% ${(stats.completed/stats.total)*100 || 0}%, #3b82f6 ${(stats.completed/stats.total)*100 || 0}% 85%, #ef4444 85% 100%)`,
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px'
            }}>
                <div style={{ width: '140px', height: '140px', background: 'white', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                        {((stats.completed / stats.total) * 100 || 0).toFixed(0)}%
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Concluidas</span>
                </div>
            </div>

            <div style={{ width: '100%', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{width:10, height:10, background:'#10b981', borderRadius:'50%'}}></div> Sustentadas</span>
                    <span style={{ fontWeight: 'bold' }}>{stats.completed}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{width:10, height:10, background:'#3b82f6', borderRadius:'50%'}}></div> En Proceso</span>
                    <span style={{ fontWeight: 'bold' }}>{stats.total - stats.completed - stats.risk}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{width:10, height:10, background:'#ef4444', borderRadius:'50%'}}></div> Críticos</span>
                    <span style={{ fontWeight: 'bold' }}>{stats.risk}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralDashboard;