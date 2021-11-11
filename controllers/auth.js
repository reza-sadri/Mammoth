const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: 'aaaaaajeeeeeeeeeeelllllll',
    },
  })
);

exports.postSingup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash('error', 'E-Mail is already exist, please try another');
        return res.status(422).redirect('/singup');
      }
      if (!(password === confirmPassword)) {
        req.flash('error', 'Confirm password does not mach, please try agein.');
        return res.status(422).redirect('/singup');
      } else {
        if (password.length < 6) {
          req.flash('error', 'Your password is too short, please try another.');
          return res.status(422).redirect('/singup');
        } else {
          if (password === email) {
            req.flash(
              'error',
              'Your password should not be same as your email, please try another'
            );
            return res.status(422).redirect('/singup');
          } else {
            return bcrypt
              .hash(password, 12)
              .then((hashedPassword) => {
                const user = new User({
                  email: email,
                  password: hashedPassword,
                  cart: { items: [] },
                  pr: 'user',
                });
                return user.save();
              })
              .then((result) => {
                req.flash(
                  'success',
                  'Your account is now created, Please login!'
                );
                res.status(201).redirect('/login');
              });
          }
        }
      }
    })
    .catch((err) => {
      {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      }
    });
};

exports.getSingup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/singup', {
    path: '/singup',
    pageTitle: 'Singup',
    errorMessage: message,
  });
};
exports.getLogin = (req, res, next) => {
  let eMessage = req.flash('error');
  if (eMessage.length > 0) {
    eMessage = eMessage[0];
  } else {
    eMessage = null;
  }
  let sMessage = req.flash('success');
  if (sMessage.length > 0) {
    sMessage = sMessage[0];
  } else {
    sMessage = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: eMessage,
    successMessage: sMessage,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.status(422).redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err)
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.status(422).redirect('/login');
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err)
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let eMessage = req.flash('error');
  if (eMessage.length > 0) {
    eMessage = eMessage[0];
  } else {
    eMessage = null;
  }
  let sMessage = req.flash('success');
  if (sMessage.length > 0) {
    sMessage = sMessage[0];
  } else {
    sMessage = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: eMessage,
    successMessage: sMessage,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      }
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account found.');
          return res.status(422).redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExp = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.status(201).redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'shop@node-complete.com',
          subject: 'Password reset',
          html: `
            <h3>You requested a password reset<h3>
            <p>Click this <a href="http://localhost:2222/reset/${token}">link</a> to reset your password.</p>
          `,
        });
      })
      .catch((err) => {
        {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        }
      });
  });
};

exports.getResetWToken = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExp: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Tocken is Invalid');
        return res.status(404).redirect(`/reset`);
      }

      let eMessage = req.flash('error');
      if (eMessage.length > 0) {
        eMessage = eMessage[0];
      } else {
        eMessage = null;
      }
      let sMessage = req.flash('success');
      if (sMessage.length > 0) {
        sMessage = sMessage[0];
      } else {
        sMessage = null;
      }

      res.render('auth/new-password', {
        path: '/reset',
        pageTitle: 'Update Password',
        errorMessage: eMessage,
        userId: user._id.toString(),
        token: token,
      });
    })
    .catch((err) => {
      {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      }
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExp: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      if (newPassword.length < 6) {
        req.flash('error', 'Your password is too short, please try another.');
        return res.status(422).redirect(`http://localhost:2222/reset/${passwordToken}`);
      } else {
        if (user.email === newPassword) {
          req.flash(
            'error',
            'Your password should not be same as your email, please try another'
          );
          return res.status(422).redirect(`http://localhost:2222/reset/${passwordToken}`);
        } else {
          return bcrypt
            .hash(newPassword, 12)
            .then((hashedPassword) => {
              resetUser.password = hashedPassword;
              resetUser.resetToken = undefined;
              resetUser.resetTokenExp = undefined;
              return resetUser.save();
            })
            .then((result) => {
              req.flash(
                'success',
                'Your password chenged successfully. Please Login!'
              );
              res.status(201).redirect('login');
            });
        }
      }
    })
    .catch((err) => {
      {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      }
    });
};
