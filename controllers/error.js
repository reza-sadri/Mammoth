exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    path: '/404',
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Some error occurred',
    path: '/500',
  });
};

// ==========
// it does not work ↓↓↓ (you should use it in main controller (i think!!!!))
// exports.throw500Error = (errorMessage) => {
//   const error = new Error(errorMessage);
//   error.httpStatusCode = 500 ;
//   return next(error)
// }