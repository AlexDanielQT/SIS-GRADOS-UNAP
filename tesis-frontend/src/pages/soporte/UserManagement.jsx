import React, { useState, useEffect } from 'react';
import { supabase } from '../../data/supabaseClient'; // Cliente de conexión

const UserManagement = () => {
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'investigador', status: 'Activo' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "todos" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'investigador', status: 'Activo' });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData(user);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const userPayload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        label: formData.role === 'investigador' ? 'Tesista' : (formData.role === 'director' ? 'Director' : 'Personal'),
        avatar: formData.name.substring(0,2).toUpperCase()
    };

    try {
        if (editingUser) {
            const { error } = await supabase.from('users').update(userPayload).eq('id', editingUser.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('users').insert([userPayload]);
            if (error) throw error;
        }
        await fetchUsers();
        setShowModal(false);
    } catch (error) {
        alert("No se pudo guardar: " + error.message);
    }
  };

  const handleDelete = async (user) => {
    const newStatus = user.status === 'Activo' ? 'Inactivo' : 'Activo';
    if(window.confirm(`¿Confirma el cambio de estado para ${user.name}?`)) {
        try {
            const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', user.id);
            if (error) throw error;
            fetchUsers();
        } catch (error) {
            alert("Error al actualizar.");
        }
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'investigador': return 'bg-blue';
      case 'director': return 'bg-purple';
      case 'soporte': return 'bg-yellow';
      default: return 'bg-gray';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      
      {/* HEADER CON BOTÓN DE ACCIÓN */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Gestión de Usuarios</h2>
            <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Administración centralizada de cuentas</span>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate} style={{ width:'auto' }} >
            <i className="fa-solid fa-user-plus"></i> Nuevo Usuario
        </button>
      </div>

      <div className="card">
        {/* BARRA DE HERRAMIENTAS ALINEADA */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Buscador - Toma el espacio disponible */}
            <div style={{ position: 'relative', flex: 1 }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '15px', top: '12px', color: '#94a3b8' }}></i>
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o correo..." 
                    style={{ 
                        width: '100%', padding: '10px 10px 10px 40px', 
                        borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' 
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* Filtro de Rol */}
            <select 
                className="form-control" 
                style={{ width: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
            >
                <option value="todos">Todos los Roles</option>
                <option value="investigador">Investigadores</option>
                <option value="director">Directores</option>
                <option value="soporte">Soporte</option>
                <option value="oficina">Oficina</option>
            </select>

            {/* Botón Refrescar */}
            <button className="btn btn-outline" onClick={fetchUsers} title="Recargar Lista" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-rotate"></i>
            </button>
        </div>

        {/* TABLA */}
        <div className="table-container">
            {loading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Sincronizando datos...
                </div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} style={{ opacity: user.status === 'Inactivo' ? 0.6 : 1 }}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div className="table-avatar" style={{ background: user.role === 'soporte' ? '#f59e0b' : '#5c2d91' }}>
                                            {user.name ? user.name.charAt(0) : '?'}
                                        </div>
                                        <div>
                                            <strong style={{ display: 'block', fontSize: '0.9rem' }}>{user.name}</strong>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td><span className={`badge ${getRoleBadge(user.role)}`}>{user.role.toUpperCase()}</span></td>
                                <td>
                                    {user.status === 'Activo' 
                                        ? <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '0.8rem' }}><i className="fa-solid fa-circle" style={{fontSize:6}}></i> Activo</span>
                                        : <span style={{ color: 'var(--gray)', fontWeight: 'bold', fontSize: '0.8rem' }}><i className="fa-solid fa-ban"></i> Inactivo</span>
                                    }
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => handleOpenEdit(user)}>
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                        <button 
                                            className="btn btn-outline" 
                                            style={{ 
                                                padding: '6px 10px', 
                                                color: user.status === 'Activo' ? 'var(--danger)' : 'var(--success)', 
                                                borderColor: user.status === 'Activo' ? 'var(--danger)' : 'var(--success)' 
                                            }} 
                                            onClick={() => handleDelete(user)}
                                        >
                                            <i className={`fa-solid ${user.status === 'Activo' ? 'fa-ban' : 'fa-rotate-left'}`}></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>

      {/* MODAL (Igual al anterior pero optimizado) */}
      {showModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(3px)'
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '500px', padding: 0 }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0 }}>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                    <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <form onSubmit={handleSave} style={{ padding: '25px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nombre Completo</label>
                        <input required type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Correo Institucional</label>
                        <input required type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div style={{ marginBottom: '25px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' }}>
                        <select className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="investigador">Investigador</option>
                            <option value="director">Director</option>
                            <option value="soporte">Soporte</option>
                            <option value="oficina">Oficina</option>
                        </select>
                        <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;