module.exports = (req, res, next) => {
  if(!req.session.isLoggedIn || !(req.user.pr === 'admin')) {
    req.flash('error','You can not access to this URL!');
    return res.status(403).redirect('/');
  }
  next();
}