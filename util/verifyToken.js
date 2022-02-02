const jwt = require('jsonwebtoken');

function verify(req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied.');
    try {
        const verifiedId = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verifiedId;
        next();
    } catch (err) {
        res.status(400).send('Invalid token.');
    }
}

module.exports = verify;