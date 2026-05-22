const express = require('express');
const pool = require('../db/pool');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { query } = require('express-validator');

const router = express.Router();

const storeSearchRules = [
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['name', 'email']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

router.get(
  '/',
  authenticate,
  authorize('user', 'admin'),
  storeSearchRules,
  validate,
  async (req, res) => {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const conditions = [];
    const params = [req.user.id];
    let paramIndex = 2;

    if (search) {
      conditions.push(`(s.name ILIKE $${paramIndex} OR s.address ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const orderColumn = sortBy === 'email' ? 's.email' : 's.name';
    const orderDir = sortOrder === 'desc' ? 'DESC' : 'ASC';

    try {
      const result = await pool.query(
        `SELECT s.id, s.name, s.address,
                COALESCE(AVG(r.rating_value), 0)::numeric(3,2) AS overall_rating,
                ur.rating_value AS user_rating,
                ur.id AS user_rating_id
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $1
         ${whereClause}
         GROUP BY s.id, ur.rating_value, ur.id
         ORDER BY ${orderColumn} ${orderDir}`,
        params
      );

      res.json({ stores: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch stores' });
    }
  }
);

module.exports = router;
