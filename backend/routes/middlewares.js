// Для проверки, авторизованные ли пользователи
function checkAuthorization(req, res, next) {
  if (req.session && req.session.isAuthorized) {
    console.log('REQUEST GRANTED');
    // Пропускаем запрос в следующую Middleware
    next();
  } else {
    console.log('UNAUTHORIZED');
    res.status(403).render('login');
  }
}

module.exports = { checkAuthorization };
