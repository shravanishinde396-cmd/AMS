/**
 * Generate the full attendance link for a session
 * @param {string} sessionToken - The UUID session token
 * @returns {string} Full URL for the attendance link
 */
const generateSessionLink = (sessionToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${clientUrl}/attend/${sessionToken}`;
};

module.exports = { generateSessionLink };
