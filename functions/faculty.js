var Student = require('../models/student');
var Faculty = require('../models/faculty');
var Course = require('../models/course');
var Attendance = require('../models/attendance');
var Message = require('../models/message');
var Quiz = require('../models/quiz');
var jwt = require('jsonwebtoken');
var config = require('../config/config.js');
var shortid = require('shortid');
var FacFunctions = require('./faculty');

module.exports = {
  GetRegisteredCourses: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      Course.find({
        faculties: {
          "$in": [faculty.name]
        }
      }, function(err, courselist) {
        if (err) throw err;
        if (courselist[0] == undefined || courselist == null) failureResponse(req, res, 'No alloted course found!');
        else {
          res.json({
            status: 1,
            courses: courselist,
            newToken: req.token
          });
        }
      });
    });
  },

  getAccessToken: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      Course.findOne({
        'code': req.body.code,
        faculties: {
          "$in": [
            faculty.name
          ]
        }
      }, function(err, course) {
        if (err) throw err;
        if (!course) failureResponse(req, res, 'No course found with this code.');
        else {
          var token = {
            course: req.body.code,
            token: shortid.generate()
          };
          faculty.tokens.push(token);
          faculty.save(function(err) {
            if (err) throw err;
            res.json({
              status: 1,
              accessToken: token,
              newToken: req.token
            });
          });
        }
      })
    });
  },

  getStudentList: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      Student.find({
        'courses': {
          $elemMatch: {
            courseFaculty: faculty.name,
            courseSlot: req.body.slot
          }
        }
      }, function(err, students) {
        if (err) throw err;
        if (!students || students[0] == undefined) failureResponse(req, res, 'No student registered in this course or slot!');
        else {
          var response = [];
          for (i = 0; i < students.length; i++) {
            var temp = {
              name: students[i].name,
              regno: students[i].regno,
              email: students[i].email,
              phone: students[i].phone
            }
            response.push(temp);
          }
          res.json({
            status: 1,
            students: response,
            newToken: req.token
          });
        }
      });
    });
  },

  getAttendance: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      if (!faculty) failureResponse(req, res, 'Faculty not found!');
      else {
        Attendance.find({
          'facultyId': faculty.empid,
          'courseCode': req.body.course,
          'date': req.body.date
        }, function(err, data) {
          if (err) throw err;
          if (!data || data[0] == undefined) {
            failureResponse(req, res, 'Attendance not found!');
          } else {
            res.json({
              status: 1,
              attendance: data,
              newToken: req.token
            });
          }
        })
      }
    });
  },

  postAttendance: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      if (!faculty) failureResponse(req, res, 'Faculty not found!');
      else {
        Attendance.findOne({
          'facultyId': faculty.empid,
          'courseCode': req.body.course,
          'date': req.body.date
        }, function(err, data) {
          if (err) throw err;
          if (!data) {
            attendance = new Attendance();
            attendance.facultyId = faculty.empid;
            attendance.date = req.body.date;
            attendance.slot = req.body.slot;
            attendance.courseCode = req.body.course;
            attendance.attendance = req.body.attendance;
            attendance.save(function(err) {
              if (err) throw err;
              res.send(attendance);
            });
          } else {
            res.send('attendance already updated');
          }
        })
      }
    });
  },

  getMessages: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      if (!faculty) failureResponse(req, res, 'Faculty not found!');
      else {
        Message.find({
          to: {
            "$in": [
              faculty.empid
            ]
          }
        }, function(err, messages) {
          if (err) throw err;
          if (!messages || messages[0] == undefined) failureResponse(req, res, 'No messages');
          else {
            var i = 0;
            for (i = 0; i < messages.length; i++) {
              Student.findOne({
                'regno': messages[i].from
              }, function(err, student) {
                if (err) throw err;
                else {
                  messages[i].studentName = student.name;
                }
              });
            }
            while (i >= messages.length) {
              res.json({
                status: 1,
                messages: messages,
                newToken: req.token
              });
              break;
            }
          }
        });
      }
    });
  },

  sendGroupMessage: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        var to = [];
        Student.find({
          'courses': {
            $elemMatch: {
              courseFaculty: faculty.name,
              courseSlot: req.body.slot
            }
          }
        }, function(err, students) {
          if (err) throw err;
          if (!students || students[0] == undefined) failureResponse(req, res, 'No student registered in this course or slot!');
          else {
            for (i = 0; i < students.length; i++) {
              to.push(students[i].regno);
            }
            newMessage = new Message();
            newMessage.from = faculty.empid;
            newMessage.to = to;
            newMessage.date = req.body.date;
            newMessage.message = req.body.message;
            newMessage.save(function(err) {
              if (err) throw err;
              res.json({
                status: 1,
                message: 'Message Sent',
                newToken: req.token
              });
            });
          }
        });
      }
    });
  },

  sendIndMessage: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        newMessage = new Message();
        newMessage.from = faculty.empid;
        newMessage.to.push(req.body.to);
        newMessage.date = req.body.date;
        newMessage.message = req.body.message;
        newMessage.save(function(err) {
          if (err) throw err;
          res.json({
            status: 1,
            message: 'Message sent Succesfully!',
            newToken: req.token
          });
        });
      }
    });
  },

  getQuizes: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.find({}, function(err, quizes) {
          if (err) throw err;
          if (!quizes || quizes[0] == undefined) {
            failureResponse(req, res, 'No quiz added yet!');
          } else {
            res.json({
              status: 1,
              quizes: quizes,
              newToken: req.token
            })
          }
        })
      }
    })
  },

  addQuiz: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        newQuiz = new Quiz();
        newQuiz.quizId = shortid.generate();
        newQuiz.name = req.body.name;
        newQuiz.courseCode = req.body.course;
        newQuiz.facultyId = faculty.empid;
        newQuiz.slot = req.body.slot;
        newQuiz.date = req.body.date;
        newQuiz.startDate = req.body.startDate;
        newQuiz.endDate = req.body.endDate;
        newQuiz.numberOfAttempts = req.body.numberOfAttempts;
        newQuiz.numberOfQuestions = req.body.numberOfQuestions;
        newQuiz.duration = req.body.duration;
        newQuiz.open = false;
        newQuiz.save(function(err) {
          if (err) throw err;
          res.json({
            status: 1,
            message: 'Quiz Added!',
            newToken: req.token
          });
        });
      }
    });
  },

  addQuizQuestion: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.findOne({
          'quizId': req.body.quizid
        }, function(err, quiz) {
          if (err) throw err;
          else {
            var question = {
              questionId: shortid.generate(),
              question: req.body.question,
              options: req.body.options,
              answer: req.body.answer,
              marks: req.body.marks
            };
            quiz.questions.push(question);
            quiz.save(function(err) {
              if (err) throw err;
              res.json({
                status: 1,
                message: 'Question added to the quiz',
                quiz: quiz,
                newToken: req.token
              });
            });
          }
        })
      }
    });
  },

  deleteQuizQuestion: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.findOne({
          'quizId': req.body.quizid
        }, function(err, quiz) {
          if (err) throw err;
          else {
            var questions = [];
            for (i = 0; i < quiz.questions.length; i++) {
              if (quiz.questions[i].questionId != req.body.questionId) {
                questions.push(quiz.questions[i]);
              }
            }
            quiz.questions = questions;
            quiz.save(function(err) {
              if (err) throw err;
              res.json({
                status: 1,
                message: 'Question Deleted',
                quiz: quiz,
                newToken: req.token
              })
            })
          }
        })
      }
    })
  },

  updateQuizQuestion: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.findOne({
          'quizId': req.body.quizid
        }, function(err, quiz) {
          if (err) throw err;
          else {
            var questions = [];
            for (i = 0; i < quiz.questions.length; i++) {
              if (quiz.questions[i].questionId != req.body.questionId) {
                questions.push(quiz.questions[i]);
              } else {
                questions.push(req.body.question);
              }
            }
            quiz.questions = questions;
            quiz.save(function(err) {
              if (err) throw err;
              res.json({
                status: 1,
                message: 'Question updated',
                quiz: quiz,
                newToken: req.token
              })
            })
          }
        })
      }
    })
  },

  openQuiz: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.findOne({
          'quizId': req.body.quizid
        }, function(err, quiz) {
          if (err) throw err;
          else {
            quiz.open = true;
            quiz.save(function(err) {
              res.json({
                status : 1,
                message : 'Quiz is now Live!',
                newToken : req.token
              });
            });
          }
        });
      }
    });
  },

  closeQuiz: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.findOne({
          'quizId': req.body.quizid
        }, function(err, quiz) {
          if (err) throw err;
          else {
            quiz.open = false;
            quiz.save(function(err) {
              res.json({
                status : 1,
                message : 'Quiz is now closed!',
                newToken : req.token
              });
            });
          }
        });
      }
    });
  }

}

function failureResponse(req, res, message) {
  res.json({
    status: 0,
    message: message,
    newToken: req.token
  });
}
