const express = require('express');
const pool = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('store_owner'));

router.get('/dashboard', async (req, res) => {
  try {
    const storeResult = await pool.query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(AVG(r.rating_value), 0)::numeric(3,2) AS average_rating,
              COUNT(r.id)::int AS total_ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [req.user.id]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ message: 'No store assigned to this owner' });
    }

    const store = storeResult.rows[0];

    const ratingsResult = await pool.query(
      `SELECT r.id, r.rating_value, r.created_at, r.updated_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: parseFloat(store.average_rating),
        totalRatings: store.total_ratings,
      },
      ratings: ratingsResult.rows.map((row) => ({
        id: row.id,
        ratingValue: row.rating_value,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
        },
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch owner dashboard' });
  }
});

module.exports = router;
