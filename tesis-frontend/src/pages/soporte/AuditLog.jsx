import React, { useState, useEffect } from 'react';
import { supabase } from '../../data/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; // Importamos librería para Excel

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`*, user:users (name, role)`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLogs = data.map(log => ({
        id: log.id,
        date: new Date(log.created_at).toLocaleString(),
        user: log.user ? log.user.name : 'Sistema / Desconocido',
        role: log.user ? log.user.role : 'System',
        action: log.action,
        details: log.details,
        ip: log.ip_address || '127.0.0.1',
        type: determineType(log.action)
      }));

      setLogs(formattedLogs);
    } catch (error) {
      console.error("Error cargando auditoría:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // --- EXPORTAR A EXCEL ---
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredLogs.map(log => ({
      'Fecha y Hora': log.date,
      'Usuario': log.user,
      'Rol': log.role.toUpperCase(),
      'Acción': log.action,
      'Detalles del Evento': log.details,
      'Dirección IP': log.ip
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs de Auditoría");
    
    // Generar archivo con fecha actual
    const fileName = `Auditoria_UNAP_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // --- EXPORTAR A PDF ---
  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(18);
    doc.text("Reporte de Auditoría del Sistema - UNAP", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);

    const tableColumn = ["Fecha/Hora", "Usuario", "Rol", "Acción", "Detalle", "IP"];
    const tableRows = filteredLogs.map(log => [
      log.date,
      log.user,
      log.role.toUpperCase(),
      log.action,
      log.details,
      log.ip
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`Auditoria_UNAP_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const determineType = (action) => {
    const act = action.toUpperCase();
    if (act.includes('FAIL') || act.includes('DELETE') || act.includes('ERROR')) return 'danger';
    if (act.includes('SUCCESS') || act.includes('APPROVE') || act.includes('CREATE')) return 'success';
    if (act.includes('OBSERVE') || act.includes('WARNING')) return 'warning';
    return 'info';
  };

  const getBadgeStyle = (type) => {
    switch(type) {
        case 'success': return { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
        case 'danger': return { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' };
        case 'warning': return { background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' };
        default: return { background: '#e0f2fe', color: '#075985', border: '1px solid #bae6fd' };
    }
  };

  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* HEADER CON BOTONES DE EXPORTACIÓN */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Auditoría del Sistema</h2>
            <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Trazabilidad y seguridad de eventos</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" onClick={handleExportExcel} style={{ width:'auto', borderColor: '#10b981', color: '#10b981' }}>
                <i className="fa-solid fa-file-excel"></i> Excel
            </button>
            <button className="btn btn-primary" onClick={handleExportPDF} style={{ width:'auto' }}>
                <i className="fa-solid fa-file-pdf"></i> PDF
            </button>
        </div>
      </div>

      <div className="card">
        {/* BARRA DE HERRAMIENTAS UNIFICADA */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '15px', top: '12px', color: '#94a3b8' }}></i>
                <input 
                    type="text" 
                    placeholder="Buscar por usuario, acción, detalle o IP..." 
                    style={{ 
                        width: '100%', padding: '10px 10px 10px 40px', 
                        borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' 
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button 
                className="btn btn-outline" 
                onClick={fetchLogs} 
                title="Actualizar Datos"
                style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <i className="fa-solid fa-rotate"></i>
            </button>
        </div>

        {/* TABLA DE LOGS */}
        <div className="table-container">
            {loading ? (
                <div style={{ textAlign:'center', padding:'30px', color:'var(--gray)' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Sincronizando logs...
                </div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Fecha / Hora</th>
                            <th>Usuario</th>
                            <th>Acción</th>
                            <th>Detalle</th>
                            <th>IP Origen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--gray)' }}>
                                    No se encontraron registros.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map(log => (
                                <tr key={log.id}>
                                    <td style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace:'nowrap' }}>
                                        <i className="fa-regular fa-clock" style={{ marginRight:5 }}></i>
                                        {log.date}
                                    </td>
                                    <td>
                                        <strong>{log.user}</strong>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.role}</div>
                                    </td>
                                    <td>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                                            ...getBadgeStyle(log.type)
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: '300px', fontSize: '0.9rem' }}>
                                        {log.details}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#475569' }}>
                                        {log.ip}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuditLog;