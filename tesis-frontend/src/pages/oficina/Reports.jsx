import React, { useState, useEffect } from 'react';
import { supabase } from '../../data/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [filterFac, setFilterFac] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, student:users!student_id(name)');

      if (error) throw error;

      const formatted = data.map(p => ({
        ...p,
        studentName: p.student ? p.student.name : 'N/A'
      }));

      setProjects(formatted);
    } catch (err) {
      console.error("Error en reportes:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FILTROS DINÁMICOS ---
  // Obtenemos valores únicos directamente de la base de datos cargada
  const uniqueFaculties = ['Todas', ...new Set(projects.map(p => p.faculty).filter(Boolean))];
  const uniqueStatuses = ['Todos', ...new Set(projects.map(p => p.status).filter(Boolean))];

  const filteredProjects = projects.filter(p => {
    const matchFac = filterFac === 'Todas' || p.faculty === filterFac;
    const matchStatus = filterStatus === 'Todos' || p.status === filterStatus;
    return matchFac && matchStatus;
  });

  // --- EXPORTACIÓN ---
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredProjects.map(p => ({
      ID: `2025-${p.id}`,
      Facultad: p.faculty,
      Estudiante: p.studentName,
      Titulo: p.title,
      Fase: p.phase,
      Estado: p.status
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
    XLSX.writeFile(workbook, "Reporte_Investigacion.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.text("Reporte Institucional de Tesis - UNAP", 14, 20);
    autoTable(doc, {
      head: [["Código", "Facultad", "Tesista", "Título", "Fase", "Estado"]],
      body: filteredProjects.map(p => [`2025-${p.id}`, p.faculty, p.studentName, p.title, p.phase, p.status]),
      startY: 30,
      styles: { fontSize: 8 }
    });
    doc.save("Reporte_Investigacion.pdf");
  };

  return (
    <div>
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Reportes Institucionales</h2>
            <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Filtros dinámicos basados en la base de datos</span>
        </div>
      </div>

      {/* FILTROS UNO AL LADO DEL OTRO */}
      <div className="card" style={{ 
          display: 'flex', 
          flexDirection: 'row', // Alineación horizontal
          gap: '20px', 
          padding: '20px', 
          marginBottom: '20px',
          alignItems: 'center'
      }}>
         <div style={{ flex: 1 }}>
            <label style={{ display:'block', fontSize:'0.8rem', fontWeight:'bold', marginBottom:'8px', color: '#475569' }}>
                <i className="fa-solid fa-filter" style={{marginRight: 5}}></i> Facultad
            </label>
            <select 
                className="form-control" 
                value={filterFac} 
                onChange={e => setFilterFac(e.target.value)}
                style={{ width:'100%', padding:'10px', borderRadius:'8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
            >
                {uniqueFaculties.map(fac => (
                    <option key={fac} value={fac}>{fac}</option>
                ))}
            </select>
         </div>

         <div style={{ flex: 1 }}>
            <label style={{ display:'block', fontSize:'0.8rem', fontWeight:'bold', marginBottom:'8px', color: '#475569' }}>
                <i className="fa-solid fa-circle-info" style={{marginRight: 5}}></i> Estado del Proyecto
            </label>
            <select 
                className="form-control" 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                style={{ width:'100%', padding:'10px', borderRadius:'8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
            >
                {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
         </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Vista Previa ({filteredProjects.length} registros)</h3>
        
        {loading ? (
            <div style={{ textAlign:'center', padding:'30px' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando...</div>
        ) : (
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Facultad</th>
                            <th>Tesista</th>
                            <th>Título</th>
                            <th>Fase</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(p => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 'bold' }}>2025-{p.id}</td>
                                <td>{p.faculty}</td>
                                <td>{p.studentName}</td>
                                <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>{p.title}</td>
                                <td><span className="badge bg-gray">Fase {p.phase}</span></td>
                                <td>
                                    <span className={`badge ${p.status === 'Finalizado' ? 'bg-green' : (p.status === 'Observado' ? 'bg-red' : 'bg-blue')}`}>
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <button className="btn btn-outline" onClick={exportToExcel} style={{ width:'auto', borderColor:'#10b981', color:'#10b981' }}>
              <i className="fa-solid fa-file-excel"></i> Exportar Excel
          </button>
          <button className="btn btn-primary" onClick={exportToPDF} style={{ width:'auto' }}>
              <i className="fa-solid fa-file-pdf"></i> Exportar PDF
          </button>
      </div>
    </div>
  );
};

export default Reports;