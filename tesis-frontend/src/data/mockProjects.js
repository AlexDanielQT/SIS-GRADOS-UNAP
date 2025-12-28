// src/data/mockProjects.js

export const projects = [
    { 
        id: 101, 
        studentId: 1, // Vinculado a Juan Pérez
        studentName: "Juan Pérez", 
        advisorId: 2, // Vinculado al Dr. Ticona
        advisorName: "Dr. Roberto Ticona",
        title: "Implementación de IA en detección de plagas en cultivos de Quinua en Puno", 
        faculty: "Ingeniería de Sistemas",
        budget: 12500.00,
        startDate: "2025-01-10",
        endDate: "2025-06-10",
        
        // Estado y Fase para el Stepper
        status: "En Ejecución", // Pendiente, En Ejecución, Observado, Finalizado
        phase: 2, // 1: Plan, 2: Ejecución, 3: Borrador, 4: Sustentación
        
        // Indicadores de riesgo (para el Dashboard de Oficina/Director)
        riskLevel: "Bajo", // Bajo, Medio, Alto
        turnitin: 12, // Porcentaje de similitud
        
        // Cronograma General (Fases Grandes)
        timeline: [
            { id: 1, name: "Plan de Tesis", status: "completed", date: "2025-01-15" },
            { id: 2, name: "Ejecución/Avances", status: "active", date: "En proceso" },
            { id: 3, name: "Borrador Final", status: "pending", date: "Estimado: 2025-05-20" },
            { id: 4, name: "Sustentación", status: "pending", date: "Estimado: 2025-06-15" }
        ],

        // --- NUEVO: Tareas Específicas para la vista de Cronograma ---
        tasks: [
            { id: 1, name: "Revisión Bibliográfica", start: "2025-01-10", end: "2025-01-25", progress: 100, status: "Completado" },
            { id: 2, name: "Diseño de Instrumentos", start: "2025-01-26", end: "2025-02-10", progress: 100, status: "Completado" },
            { id: 3, name: "Recolección de Datos (Campo)", start: "2025-02-11", end: "2025-03-15", progress: 45, status: "En Proceso" },
            { id: 4, name: "Procesamiento de Datos", start: "2025-03-16", end: "2025-04-01", progress: 0, status: "Pendiente" },
            { id: 5, name: "Redacción de Resultados", start: "2025-04-02", end: "2025-05-10", progress: 0, status: "Pendiente" }
        ]
    },
    { 
        id: 102, 
        studentId: 99, // Otro estudiante
        studentName: "Maria Gomez", 
        advisorId: 2, // Mismo director (Dr. Ticona)
        advisorName: "Dr. Roberto Ticona",
        title: "Optimización de redes neuronales para el tratamiento de aguas residuales", 
        faculty: "Ingeniería Química",
        budget: 8200.50,
        startDate: "2025-02-01",
        endDate: "2025-07-01",
        
        status: "Pendiente", 
        phase: 1, 
        
        riskLevel: "Alto", 
        turnitin: 0, 
        
        timeline: [
            { id: 1, name: "Plan de Tesis", status: "active", date: "En revisión" },
            { id: 2, name: "Ejecución", status: "pending", date: "-" },
            { id: 3, name: "Borrador Final", status: "pending", date: "-" },
            { id: 4, name: "Sustentación", status: "pending", date: "-" }
        ]
    },
    { 
        id: 103, 
        studentId: 100, 
        studentName: "Carlos Mamani", 
        advisorId: 5, 
        advisorName: "Dra. Elena Flores",
        title: "Sistema de gestión documental basado en Blockchain", 
        faculty: "Ingeniería de Sistemas",
        budget: 5000.00,
        startDate: "2024-08-01",
        endDate: "2024-12-15",
        
        status: "Finalizado", 
        phase: 4, 
        
        riskLevel: "Bajo",
        turnitin: 8, 
        
        timeline: [
            { id: 1, name: "Plan de Tesis", status: "completed", date: "2024-08-15" },
            { id: 2, name: "Ejecución", status: "completed", date: "2024-11-01" },
            { id: 3, name: "Borrador Final", status: "completed", date: "2024-12-01" },
            { id: 4, name: "Sustentación", status: "completed", date: "2024-12-20" }
        ]
    }
];

// Helper para obtener estadísticas rápidas (Para la Oficina)
export const getStats = () => {
    return {
        total: projects.length,
        active: projects.filter(p => p.status === 'En Ejecución').length,
        pending: projects.filter(p => p.status === 'Pendiente').length,
        risk: projects.filter(p => p.riskLevel === 'Alto').length
    };
};