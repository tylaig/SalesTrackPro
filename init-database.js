// Script para inicializar banco de dados no Docker
const { Pool } = require('@neondatabase/serverless');

async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not found, skipping database initialization');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Verificar se a tabela users existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('Database tables already exist');
      
      // Criar usuário admin se não existir
      await pool.query(`
        INSERT INTO users (email, name, password, role, is_active, require_password_change) 
        VALUES ('admin@dashboard.com', 'Administrador', 'admin123', 'admin', true, false) 
        ON CONFLICT (email) DO UPDATE SET 
          password = 'admin123', 
          is_active = true,
          role = 'admin';
      `);
      
      console.log('Admin user created/updated successfully');
    } else {
      console.log('Database tables do not exist. Run npm run db:push first.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();