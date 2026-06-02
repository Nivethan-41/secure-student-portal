const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password
 * @param {string} password - The plain text password
 * @returns {Promise<string>} The hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verifies a plain text password against a hashed password
 * @param {string} password - The plain text password
 * @param {string} hash - The hashed password from the database
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  verifyPassword
};
