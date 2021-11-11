module.exports = (req, res, next) => {
  if(!req.session.isLoggedIn) {
    req.flash('error','You can not access to this URL before sining in!');
    return res.status(401).redirect('/login');
  }
  next();
}