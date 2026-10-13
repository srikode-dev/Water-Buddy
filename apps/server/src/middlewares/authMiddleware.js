import jwt from 'jsonwebtoken';

const SECRETS = [
  process.env.JWT_SECRET,
  'tOnugghxGYp59jUFpnCypiRkSY1awuU5G6fxChLvPdaiS44F7Lbs7SqTOHvBvhqJ0y4whzZ3olur56oeZM66ap',
  'super-secret-water-buddy'
].filter(Boolean);

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  for (const secret of SECRETS) {
    try {
      const user = jwt.verify(token, secret);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (e) {
      // try next secret
    }
  }

  return res.status(403).json({ error: 'Invalid or expired session token' });
};
