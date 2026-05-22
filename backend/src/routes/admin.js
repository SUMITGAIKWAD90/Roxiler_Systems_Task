const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  userCreateRules,
  userUpdateRules,
  storeRules,
  storeUpdateRules,
  listQueryRules,
} = require('../utils/validators');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', async (req, res) => {
  try {
    const [users, stores, ratings] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM stores'),
      pool.query('SELECT COUNT(*)::int AS count FROM ratings'),
    ]);

    res.json({
      totalUsers: users.rows[0].count,
      totalStores: stores.rows[0].count,
      totalRatings: ratings.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard' });
  }
});

function buildUserListQuery(query) {
  const { search, role, sortBy = 'name', sortOrder = 'asc' } = query;
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(
      `(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.address ILIKE $${paramIndex})`
    );
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (role) {
    conditions.push(`u.role = $${paramIndex}`);
    params.push(role);
    paramIndex++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderColumn = sortBy === 'email' ? 'u.email' : 'u.name';
  const orderDir = sortOrder === 'desc' ? 'DESC' : 'ASC';

  return { whereClause, params, orderColumn, orderDir, paramIndex };
}

router.get('/users', listQueryRules, validate, async (req, res) => {
  const { whereClause, params, orderColumn, orderDir } = buildUserListQuery(req.query);

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
              s.id AS store_id, s.name AS store_name,
              COALESCE(AVG(r.rating_value), 0)::numeric(3,2) AS store_avg_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereClause}
       GROUP BY u.id, s.id, s.name
       ORDER BY ${orderColumn} ${orderDir}`,
      params
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const userResult = await pool.query(
      `SELECT id, name, email, address, role, created_at FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    let storeInfo = null;

    if (user.role === 'store_owner') {
      const storeResult = await pool.query(
        `SELECT s.id, s.name, s.email, s.address,
                COALESCE(AVG(r.rating_value), 0)::numeric(3,2) AS average_rating,
                COUNT(r.id)::int AS total_ratings
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = $1
         GROUP BY s.id`,
        [id]
      );
      storeInfo = storeResult.rows[0] || null;
    }

    res.json({ user, store: storeInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

router.post('/users', userCreateRules, validate, async (req, res) => {
  const { name, email, address, password, role } = req.body;

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role`,
      [name, email, passwordHash, address, role]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

router.put('/users/:id', userUpdateRules, validate, async (req, res) => {
  const { id } = req.params;
  const { name, email, address, role, password } = req.body;

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) { fields.push(`name = $${idx++}`); values.push(name); }
    if (email) { fields.push(`email = $${idx++}`); values.push(email); }
    if (address) { fields.push(`address = $${idx++}`); values.push(address); }
    if (role) { fields.push(`role = $${idx++}`); values.push(role); }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      fields.push(`password_hash = $${idx++}`);
      values.push(passwordHash);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, name, email, address, role`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  if (parseInt(id, 10) === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

function buildStoreListQuery(query) {
  const { search, sortBy = 'name', sortOrder = 'asc' } = query;
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(
      `(s.name ILIKE $${paramIndex} OR s.email ILIKE $${paramIndex} OR s.address ILIKE $${paramIndex})`
    );
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderColumn = sortBy === 'email' ? 's.email' : 's.name';
  const orderDir = sortOrder === 'desc' ? 'DESC' : 'ASC';

  return { whereClause, params, orderColumn, orderDir };
}

router.get('/stores', listQueryRules, validate, async (req, res) => {
  const { whereClause, params, orderColumn, orderDir } = buildStoreListQuery(req.query);

  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id,
              u.name AS owner_name, u.email AS owner_email,
              COALESCE(AVG(r.rating_value), 0)::numeric(3,2) AS average_rating,
              COUNT(r.id)::int AS total_ratings
       FROM stores s
       JOIN users u ON u.id = s.owner_id
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereClause}
       GROUP BY s.id, u.name, u.email
       ORDER BY ${orderColumn} ${orderDir}`,
      params
    );

    res.json({ stores: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stores' });
  }
});

router.post('/stores', storeRules, validate, async (req, res) => {
  const { name, email, address, ownerId } = req.body;

  try {
    const owner = await pool.query(
      "SELECT id, role FROM users WHERE id = $1",
      [ownerId]
    );

    if (owner.rows.length === 0) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    if (owner.rows[0].role !== 'store_owner') {
      return res.status(400).json({ message: 'Owner must have store_owner role' });
    }

    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE owner_id = $1',
      [ownerId]
    );
    if (existingStore.rows.length > 0) {
      return res.status(409).json({ message: 'This owner already has a store' });
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id`,
      [name, email, address, ownerId]
    );

    res.status(201).json({ store: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create store' });
  }
});

router.put('/stores/:id', storeUpdateRules, validate, async (req, res) => {
  const { id } = req.params;
  const { name, email, address, ownerId } = req.body;

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name) { fields.push(`name = $${idx++}`); values.push(name); }
    if (email) { fields.push(`email = $${idx++}`); values.push(email); }
    if (address) { fields.push(`address = $${idx++}`); values.push(address); }
    if (ownerId) { fields.push(`owner_id = $${idx++}`); values.push(ownerId); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE stores SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, name, email, address, owner_id`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json({ store: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update store' });
  }
});

router.delete('/stores/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM stores WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json({ message: 'Store deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete store' });
  }
});

module.exports = router;
