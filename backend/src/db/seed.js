const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function seed() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  try {
    const adminCheck = await pool.query(
      "SELECT id FROM users WHERE email = 'admin@storeplatform.com'"
    );

    if (adminCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, address, role)
         VALUES ($1, $2, $3, $4, 'admin')`,
        [
          'System Administrator Account',
          'admin@storeplatform.com',
          passwordHash,
          '100 Admin Boulevard, Central District, Metropolitan City Area',
        ]
      );
      console.log('Default admin created: admin@storeplatform.com / Admin@123');
    } else {
      console.log('Admin already exists, skipping seed.');
    }
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
