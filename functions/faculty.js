var Student = require('../models/student');
var Faculty = require('../models/faculty');
var Course = require('../models/course');
var Attendance = require('../models/attendance');
var Message = require('../models/message');
var Quiz = require('../models/quiz');
var Marks = require('../models/marks');
var jwt = require('jsonwebtoken');
var config = require('../config/config.js');
var shortid = require('shortid');
var FacFunctions = require('./faculty');

module.exports = {

  //*********************************************
  //******** Get list of registered courses ******
  //*********************************************
  GetRegisteredCourses: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      Course.find({
        'facultyId' : faculty.empid
      }, function(err, courselist) {
        if (err) throw err;
        if (courselist[0] == undefined || courselist == null) res.render('faculty/course', {
          faculty : req.user,
          courses : null,
          alertMessage : "No registered course found"
        })
        else {
          res.render('faculty/course', {
            courses: courselist,
            faculty : req.user
          });
        }
      });
    });
  },

  //*********************************************
  //******** Get list of registered courses ******
  //*********************************************
  GetComponents: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      Course.findOne({
        'facultyId' : faculty.empid,
        'slot' : req.body.slot
      }, function(err, course) {
        if (err) throw err;
        if (!course) res.json({
          status : 0,
          message : "No registered course found"
        })
        else {
          res.json({
            components : course.marksSplitUp
          });
        }
      });
    });
  },
  //******************************************************************
  //******** Create and get access token for a course **********************
  //***************************************************************

  getAccessToken: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      Course.findOne({
        'code': req.body.code,
        'facultyName' : faculty.name,
        'type' : req.body.type
      }, function(err, course) {
        if (err) throw err;
        if (!course) failureResponse(req, res, 'No course found with this code.');
        else {
          var token = {
            course: req.body.code,
            type : req.body.type,
            token: shortid.generate()
          };
          faculty.tokens.push(token);
          faculty.save(function(err) {
            if (err) throw err;
            res.json({
              accessToken: token
            });
          });
        }
      })
    });
  },


  //*****************************************************************
  //******** Get List of students registered in a course **********************
  //*****************************************************************

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
            students: response
          });
        }
      });
    });
  },

  //*************************************************************
  //******** Get Attendance report for aparticular slot **********************
  //***********************************************************

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
          'slot' : req.body.slot,
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
        });
      }
    });
  },

  //************************************************************
  //******** Post attendance for a particular slot **********************
  //************************************************************

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

  //*********************************************
  //******** Get Messages **********************
  //*********************************************

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
              res.render('faculty/messages', {
                messages: messages,
                faculty : req.user
              });
          }
        });
      }
    });
  },

  //*********************************************
  //******** Send Group Message *****************
  //*********************************************

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
            newMessage.fromName = faculty.name;
            newMessage.to = to;
            newMessage.date = req.body.date;
            newMessage.message = req.body.message;
            newMessage.save(function(err) {
              if (err) throw err;
              res.json({
                status: 1,
                message: 'Message Sent'
              });
            });
          }
        });
      }
    });
  },

  //*********************************************
  //******** Send Individual Message *****************
  //*********************************************

  sendIndMessage: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        newMessage = new Message();
        newMessage.from = faculty.empid;
        newMessage.fromName = faculty.name;
        newMessage.to.push(req.body.to);
        newMessage.date = req.body.date;
        newMessage.message = req.body.message;
        newMessage.save(function(err) {
          if (err) throw err;
          res.json({
            status: 1,
            message: 'Message sent Succesfully!'
          });
        });
      }
    });
  },

  //************************************************
  //******** Get quizzes open or close **********************
  //************************************************

  getquizzes: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.find({
          'facultyId' : faculty.empid
        }, function(err, quizzes) {
          if (err) throw err;
          if (!quizzes || quizzes[0] == undefined) {
            res.render('faculty/quiz', {
              quizzes : null,
              faculty : req.user,
              alertMessage : "No quiz Added yet"
            })
          } else {
            res.render('faculty/quiz', {
              quizzes: quizzes,
              faculty : req.user,
              alertMessage : ""
            })
          }
        })
      }
    })
  },

  //*********************************************
  //******** Add a quiz for a slot **********************
  //*********************************************

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
        newQuiz.numberOfQuestions = req.body.numberOfQuestions;
        newQuiz.duration = req.body.duration;
        newQuiz.open = false;
        console.log(newQuiz);
        newQuiz.save(function(err) {
          if (err) throw err;
          res.json({
            status: 1,
            message: 'Quiz Added!'
          });
        });
      }
    });
  },

  //*************************************************
  //******** Edit quiz **********************
  //*************************************************

  editQuiz : function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.findOne({
          'quizId' : req.body.quizId
        }, function(err, quiz) {
          if (err) throw err;
          if (!quiz) {
            res.render('faculty/quiz', {
              quizzes : null,
              faculty : req.user,
              alertMessage : "No quiz Added yet"
            });
          } else {
            res.render('faculty/editquiz', {
              quiz: quiz,
              faculty : req.user
            });
          }
        })
      }
    })
  },

  //*************************************************
  //******** Delete quiz **********************
  //*************************************************
  deleteQuiz : function (req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.findOneAndRemove({
          'quizId' : req.body.quizId
        }, function(err, quiz) {
          if (err) throw err;
          if (!quiz) {
            res.render('faculty/quiz', {
              quizzes : null,
              faculty : req.user,
              alertMessage : "No quiz Added yet"
            });
          } else {
            res.redirect('/faculty/quiz');
          }
        })
      }
    })
  },
  //*************************************************
  //******** Add a question to a quiz **********************
  //*************************************************

  addQuizQuestion: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.findOne({
          'quizId': req.body.quizId
        }, function(err, quiz) {
          if (err) throw err;
          else {
            var question = {
              questionId: shortid.generate(),
              question: req.body.question,
              options: req.body.options,
              answer: req.body.answer,
              marks: 1
            };
            quiz.questions.push(question);
            quiz.save(function(err) {
              if (err) throw err;
              res.json({
                status: 1,
                message: 'Question added to the quiz',
                quiz: quiz
              });
            });
          }
        })
      }
    });
  },

  //**************************************************
  //******** Delete a quiz question **********************
  //**************************************************

  deleteQuizQuestion: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.findOne({
          'quizId': req.body.quizId
        }, function(err, quiz) {
          if (err) throw err;
          else {
            var questions = [];
            console.log(req.body.questionId);
            for (i = 0; i < quiz.questions.length; i++) {
              if (quiz.questions[i].questionId != req.body.questionId) {
                questions.push(quiz.questions[i]);
              }
            }
            quiz.questions = questions;
            console.log(quiz.questions);
            quiz.save(function(err) {
              if (err) throw err;
              res.render('faculty/editquiz', {
                quiz : quiz,
                faculty : req.user
              });
            });
          }
        });
      }
    });
  },

  //*************************************************
  //******** Update quiz question **********************
  //************************************************

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


  //*********************************************
  //******** Open a quiz **********************
  //*********************************************

  openQuiz: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.findOne({
          'quizId': req.body.quizId
        }, function(err, quiz) {
          if (err) throw err;
          else {
            quiz.open = true;
            quiz.save(function(err) {
              res.json({
                status: 1,
                message: 'Quiz is now Live!',
                newToken: req.token
              });
            });
          }
        });
      }
    });
  },

  //*********************************************
  //******** Close a quiz **********************
  //*********************************************

  closeQuiz: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Quiz.findOne({
          'quizId': req.body.quizId
        }, function(err, quiz) {
          if (err) throw err;
          else {
            quiz.open = false;
            quiz.save(function(err) {
              res.json({
                message: 'Quiz is now closed!'
              });
            });
          }
        });
      }
    });
  },

  //*********************************************************
  //******** Add marks split up for a course ****************
  //*********************************************************

  addSplitUp : function (req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Course.findOne({
          'code' : req.body.code,
          'slot' : req.body.slot,
          'facultyId' : faculty.empid
        }, function(err, course) {
          if(err) throw err;
          else {
            var temp = {
              component : req.body.component,
              maxMarks : req.body.maxMarks
            };
            course.marksSplitUp.push(temp);
            console.log(course);
            course.save(function(err) {
              if(err) throw err;
              res.json({
                message : 'Marks component added!'
              });
            });
          }
        });
      }
    });
  },

  //*****************************************************
  //******** Post marks for slot **********************
  //****************************************************

  postMarks: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Marks.findOne({
          'facultyId' : faculty.empid,
          'slot' : req.body.slot,
          'component' : req.body.component,
          'courseCode' : req.body.code
        }, function(err, data) {
          if(err) throw err;
          if(!data) {
            var marks = new Marks({
              facultyId : faculty.empid,
              slot : req.body.slot,
              component : req.body.component,
              courseCode  : req.body.code
            });
            marks.marks = req.body.marks;
            console.log(marks);
            marks.save(function(err) {
              if(err) throw err;
              res.json({
                message : "Marks Updated!"
              });
            });
          }
          else {
            data.marks = req.body.marks;
            data.save(function(err) {
              if(err) throw err;
              res.json({
                message : "Marks Updated!"
              });
            });
          }
        })
      }
    });
  },

  //*****************************************************
  //******** Get marks for slot **********************
  //****************************************************

  getMarks: function(req, res, emp_id) {
    Faculty.findOne({
      'empid': emp_id
    }, function(err, faculty) {
      if (err) throw err;
      else {
        Marks.findOne({
          'facultyId' : faculty.empid,
          'slot' : req.body.slot,
          'component' : req.body.component,
          'courseCode' : req.body.code
        }, function(err, data) {
          if(err) throw err;
          if(!data) {
            res.json({
              status : 0
            });
          }
          else {
            res.json({
              status : 1,
              marks : data
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
