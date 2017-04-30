var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var Student = require('../models/student');
var Faculty = require('../models/faculty');
var User;

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
      if(user.role == 'student') {
        User = Student;
      } else {
        User = Faculty;
      }
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
          done(null, user);
        });
    });

    passport.use('student-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'regno',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, regno, password, done) {
            if (regno)
                regno = regno.toUpperCase();
            process.nextTick(function() {
                Student.findOne({
                    'regno': regno
                }, function(err, student) {
                    if (err)
                        return done(err);

                    // if no user is found, return the message
                    if (!student)
                        return done(null, false, req.flash('loginMessage', 'No user found.'));

                    if (!student.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                    // all is well, return user
                    else
                        return done(null, student, req.flash('loginMessage', 'Successfully Logged in!!'));
                });
            });

        }));

    passport.use('faculty-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'empid',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, empid, password, done) {
            // asynchronous
            process.nextTick(function() {
                Faculty.findOne({
                    'empid': empid
                }, function(err, faculty) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);
                    // if no user is found, return the message
                    if (!faculty)
                        return done(null, false, req.flash('FacultyloginMessage', 'No user found.'));

                    if (!faculty.validPassword(password))
                        return done(null, false, req.flash('FacultyloginMessage', 'Oops! Wrong password.'));

                    // all is well, return user
                    else
                        return done(null, faculty, req.flash('FacultyloginMessage', 'Successfully Logged in!!'));
                });
            });

        }));

};
