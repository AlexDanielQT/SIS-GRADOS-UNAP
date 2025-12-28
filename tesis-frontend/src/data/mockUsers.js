export const users = [
    { 
        id: 1, 
        name: "Juan Pérez", 
        role: "investigador", 
        label: "Tesista",
        avatar: "JP",
        email: "juan.perez@est.unap.edu.pe", // Agregado para Soporte
        status: "Activo" // Agregado para Soporte
    },
    { 
        id: 2, 
        name: "Dr. Roberto Ticona", 
        role: "director", 
        label: "Director",
        avatar: "RT",
        email: "rticona@unap.edu.pe",
        status: "Activo"
    },
    { 
        id: 3, 
        name: "Ing. Sistemas (Soporte)", 
        role: "soporte", 
        label: "Admin Sistema", 
        avatar: "AD",
        email: "admin.sistemas@unap.edu.pe",
        status: "Activo"
    },
    { 
        id: 4, 
        name: "Jefe de Oficina", 
        role: "oficina", 
        label: "Oficina Inv.", 
        avatar: "OF",
        email: "oficina.investigacion@unap.edu.pe",
        status: "Activo"
    },
    { 
        id: 5, 
        name: "Maria Gomez", 
        role: "investigador", 
        label: "Tesista", 
        avatar: "MG",
        email: "m.gomez@est.unap.edu.pe",
        status: "Activo"
    }
];

// Helper para obtener iconos según el rol (para el Login)
export const getRoleIcon = (role) => {
    switch(role) {
        case 'investigador': return 'fa-user-graduate';
        case 'director': return 'fa-chalkboard-user';
        case 'soporte': return 'fa-gears';
        case 'oficina': return 'fa-chart-pie';
        default: return 'fa-user';
    }
};