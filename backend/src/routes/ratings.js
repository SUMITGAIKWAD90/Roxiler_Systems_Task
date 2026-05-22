const express = require('express');
const pool = require('../db/pool');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ratingRules, ratingUpdateRules } = require('../utils/validators');

const router = express.Router();

router.post('/', authenticate, authorize('user'), ratingRules, validate, async (req, res) => {
  const { storeId, ratingValue } = req.body;

  try {
    const store = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (store.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const existing = await pool.query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [req.user.id, storeId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: 'You have already rated this store. Use update instead.',
        ratingId: existing.rows[0].id,
      });
    }

    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating_value)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, store_id, rating_value, created_at`,
      [req.user.id, storeId, ratingValue]
    );

    res.status(201).json({ rating: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
});

router.put('/:id', authenticate, authorize('user'), ratingUpdateRules, validate, async (req, res) => {
  const { id } = req.params;
  const { ratingValue } = req.body;

  try {
    const result = await pool.query(
      `UPDATE ratings SET rating_value = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, store_id, rating_value, updated_at`,
      [ratingValue, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rating not found or not yours' });
    }

    res.json({ rating: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update rating' });
  }
});

module.exports = router;
