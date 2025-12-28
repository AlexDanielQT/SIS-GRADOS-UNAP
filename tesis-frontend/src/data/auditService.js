import { supabase } from './supabaseClient';

export const logAction = async (userId, action, details) => {
  try {
    // Simulamos una IP aleatoria para darle realismo
    const mockIp = `192.168.1.${Math.floor(Math.random() * 255)}`;

    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: userId,
        action: action,
        details: details,
        ip_address: mockIp
      }]);

    if (error) console.error("Error guardando log:", error.message);
  } catch (err) {
    console.error("Error crítico en auditoría:", err);
  }
};