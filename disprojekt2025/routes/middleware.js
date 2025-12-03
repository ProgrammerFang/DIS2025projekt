// Middleware der tjekker både session og custom cookie
const secureLoginMiddleware = (req, res, next) => {
    if (
        req.session && req.session.user &&
        req.cookies && req.cookies.myCookie === 'cookieValue'
    ) {
        next();
    } else {
        res.status(401).json({ message: 'Ikke logget ind eller mangler cookie!' });
    }
};

module.exports = { secureLoginMiddleware };
