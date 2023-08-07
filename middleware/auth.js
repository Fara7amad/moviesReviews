const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
      return next();
  }
  res.render('pages/404');
};

const isLoggedIn = (req) => {
  if (req.session && req.session.userId) {
    return true; 
  } else {
    return false;
  }
};

module.exports= {isLoggedIn,isAuthenticated };