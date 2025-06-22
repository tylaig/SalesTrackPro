-- Script para criar usuário admin no banco de dados
INSERT INTO users (email, name, password, role, is_active, require_password_change) 
VALUES ('admin@dashboard.com', 'Administrador', 'admin123', 'admin', true, false) 
ON CONFLICT (email) DO UPDATE SET 
  password = 'admin123', 
  is_active = true,
  role = 'admin';