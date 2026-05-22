const { body, param, query } = require('express-validator');

const NAME_MIN = 20;
const NAME_MAX = 60;
const ADDRESS_MAX = 400;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 16;

const nameRules = (field = 'name') =>
  body(field)
    .trim()
    .isLength({ min: NAME_MIN, max: NAME_MAX })
    .withMessage(`Name must be between ${NAME_MIN} and ${NAME_MAX} characters`);

const addressRules = (field = 'address') =>
  body(field)
    .trim()
    .isLength({ min: 1, max: ADDRESS_MAX })
    .withMessage(`Address must not exceed ${ADDRESS_MAX} characters`);

const emailRules = (field = 'email') =>
  body(field)
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail();

const passwordRules = (field = 'password') =>
  body(field)
    .isLength({ min: PASSWORD_MIN, max: PASSWORD_MAX })
    .withMessage(`Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters`)
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/)
    .withMessage('Password must contain at least one special character');

const registerRules = [
  nameRules(),
  emailRules(),
  addressRules(),
  passwordRules(),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRules('newPassword'),
];

const userCreateRules = [
  nameRules(),
  emailRules(),
  addressRules(),
  passwordRules(),
  body('role')
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be admin, user, or store_owner'),
];

const userUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),
  nameRules().optional(),
  emailRules().optional(),
  addressRules().optional(),
  body('role')
    .optional()
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be admin, user, or store_owner'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: PASSWORD_MIN, max: PASSWORD_MAX })
    .withMessage(`Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters`)
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/)
    .withMessage('Password must contain at least one special character'),
];

const storeRules = [
  nameRules(),
  body('email').trim().isEmail().withMessage('Invalid store email format').normalizeEmail(),
  addressRules(),
  body('ownerId').isInt({ min: 1 }).withMessage('Valid owner ID is required'),
];

const storeUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('Invalid store ID'),
  nameRules().optional(),
  body('email').optional().trim().isEmail().withMessage('Invalid store email format'),
  addressRules().optional(),
  body('ownerId').optional().isInt({ min: 1 }).withMessage('Valid owner ID is required'),
];

const ratingRules = [
  body('storeId').isInt({ min: 1 }).withMessage('Valid store ID is required'),
  body('ratingValue')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];

const ratingUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('Invalid rating ID'),
  body('ratingValue')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];

const listQueryRules = [
  query('search').optional().trim(),
  query('role').optional().isIn(['admin', 'user', 'store_owner']),
  query('sortBy').optional().isIn(['name', 'email']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  registerRules,
  loginRules,
  changePasswordRules,
  userCreateRules,
  userUpdateRules,
  storeRules,
  storeUpdateRules,
  ratingRules,
  ratingUpdateRules,
  listQueryRules,
};
