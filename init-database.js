// Script para inicializar banco de dados no Docker
const { Pool } = require('@neondatabase/serverless');

async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not found, skipping database initialization');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Initializing database with admin user...');
    
    // Criar usuário admin
    await pool.query(`
      INSERT INTO users (email, name, password, role, is_active, require_password_change) 
      VALUES ('admin@dashboard.com', 'Administrador', 'admin123', 'admin', true, false) 
      ON CONFLICT (email) DO UPDATE SET 
        password = 'admin123', 
        is_active = true,
        role = 'admin';
    `);
    
    console.log('Admin user created/updated successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();