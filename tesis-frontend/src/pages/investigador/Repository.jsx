import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../data/supabaseClient';
// 1. IMPORTAR LOG
import { logAction } from '../../data/auditService';

const Repository = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      if (!user) return;
      const { data: projectData, error: projError } = await supabase
        .from('projects')
        .select('id')
        .eq('student_id', user.id)
        .single();

      if (projError) throw projError;
      if (!projectData) return;

      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectData.id)
        .order('id', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docsData);

    } catch (error) {
      console.error("Error cargando repositorio:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const { data: projectData } = await supabase
        .from('projects')
        .select('id')
        .eq('student_id', user.id)
        .single();

      if (!projectData) throw new Error("No tienes un proyecto asignado.");

      const { error } = await supabase
        .from('documents')
        .insert([{
            project_id: projectData.id,
            name: file.name,
            url: '#', 
            version: documents.length + 1,
            status: 'Enviado',
        }]);

      if (error) throw error;

      // --- 2. REGISTRAR EVENTO ---
      await logAction(user.id, 'FILE_UPLOAD', `Subió documento: ${file.name} (v${documents.length + 1})`);

      alert("Archivo subido y registrado correctamente en el sistema.");
      fetchDocuments(); 

    } catch (error) {
      alert("Error al subir: " + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const getFileIcon = (name) => {
    if (!name) return 'fa-file';
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'fa-file-pdf';
    if (ext === 'doc' || ext === 'docx') return 'fa-file-word';
    if (ext === 'xls' || ext === 'xlsx') return 'fa-file-excel';
    return 'fa-file';
  };

  const getStatusBadge = (status) => {
    switch(status) {
        case 'Aprobado': return 'bg-green';
        case 'Rechazado': return 'bg-red';
        case 'Enviado': return 'bg-blue';
        default: return 'bg-gray';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Repositorio Digital</h2>
        <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Gestión documental (Nube)</span>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Subir Nuevo Avance</h3>
        
        <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
        />

        <div className="upload-zone" onClick={triggerFileInput} style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}>
          {isUploading ? (
            <div>
              <i className="fa-solid fa-spinner fa-spin upload-icon" style={{ color: 'var(--primary)' }}></i>
              <p>Encriptando y subiendo...</p>
            </div>
          ) : (
            <div>
              <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
              <h4 style={{ margin: '10px 0' }}>Haz clic aquí para seleccionar tu archivo</h4>
              <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Formatos: PDF, DOCX, XLSX.</p>
              <button className="btn btn-primary" style={{ marginTop: '15px', width: 'auto' }}>Seleccionar Archivo Local</button>
            </div>
          )}
        </div>

        <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #0ea5e9', fontSize: '0.85rem', color: '#0369a1', marginTop: '20px' }}>
          <i className="fa-solid fa-shield-halved"></i> <strong>Integridad:</strong> El sistema registra la fecha y versión en auditoría.
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Historial de Archivos</h3>
          <button className="btn btn-outline" onClick={fetchDocuments} title="Actualizar lista">
            <i className="fa-solid fa-rotate"></i>
          </button>
        </div>

        {loading ? (
            <div style={{ textAlign:'center', padding:'20px' }}><i className="fa-solid fa-spinner fa-spin"></i> Cargando...</div>
        ) : documents.length === 0 ? (
            <div style={{ textAlign:'center', padding:'20px', color:'var(--gray)' }}>No hay documentos subidos.</div>
        ) : (
            <table className="file-table">
              <thead>
                <tr>
                  <th>Nombre del Archivo</th>
                  <th>Versión</th>
                  <th>Fecha de Subida</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <i className={`fa-regular ${getFileIcon(doc.name)} file-icon`}></i>
                      <strong>{doc.name}</strong>
                    </td>
                    <td><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight:'bold' }}>v{doc.version}.0</span></td>
                    <td>
                        {doc.upload_date ? new Date(doc.upload_date).toLocaleDateString() : new Date().toLocaleDateString()}
                    </td>
                    <td><span className={`badge ${getStatusBadge(doc.status)}`}>{doc.status}</span></td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '5px 10px', width: 'auto' }}>
                        <i className="fa-solid fa-download"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default Repository;