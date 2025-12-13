// Middleware untuk cek apakah user sudah login
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    
    // Redirect ke login jika belum login
    return res.redirect('/login');
}

// Middleware untuk cek role admin
function isAdmin(req, res, next) {
    if (req.session && req.session.userId && req.session.userRole === 'admin') {
        return next();
    }
    
    // Jika bukan admin, kirim error atau redirect
    return res.status(403).send('Akses ditolak. Hanya admin yang bisa mengakses halaman ini.');
}

// Middleware untuk cek role mahasiswa
function isMahasiswa(req, res, next) {
    if (req.session && req.session.userId && req.session.userRole === 'mahasiswa') {
        return next();
    }
    
    // Jika bukan mahasiswa, kirim error atau redirect
    return res.status(403).send('Akses ditolak. Hanya mahasiswa yang bisa mengakses halaman ini.');
}

// Middleware untuk inject user data ke views
function injectUserData(req, res, next) {
    res.locals.user = req.session ? {
        id: req.session.userId,
        username: req.session.username,
        nama: req.session.nama,
        role: req.session.userRole,
        isAuthenticated: !!req.session.userId
    } : {
        isAuthenticated: false
    };
    next();
}

module.exports = {
    isAuthenticated,
    isAdmin,
    isMahasiswa,
    injectUserData
};
