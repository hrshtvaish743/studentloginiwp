var Student = require('../models/student');
var Faculty = require('../models/faculty');
var Course = require('../models/course');
var Message = require('../models/message');
var Attendance = require('../models/attendance');
var Marks = require('../models/marks');
var Quiz = require('../models/quiz');
var QuizTemp = require('../models/quiztemp');
var QuizSubmission = require('../models/quizSubmission');
var jwt = require('jsonwebtoken');
var config = require('../config/config.js');
var shortid = require('shortid');

module.exports = {

  //*****************************************************
  //***************Join course with an access token*****************
  //*****************************************************
  joinCourse: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        Faculty.findOne({
          'tokens': {
            $elemMatch: {
              token: req.body.token
            }
          }
        }, function(err, faculty) {
          if (err) throw err;
          if (!faculty) failureResponse(req, res, 'Faculty or course not found or token might have expired.');
          else {
            var courseCode;
            for (i = 0; i < faculty.tokens.length; i++) {
              if (faculty.tokens[i].token == req.body.token) {
                courseCode = faculty.tokens[i].course;
                break;
              }
            }
            Course.findOne({
              'code': courseCode
            }, function(err, course) {
              if (err) throw err;
              if (!course) failureResponse(req, res, 'Course not found!');
              else {
                course.faculties = faculty.name;
                var enrolCourse = {
                  courseName: course.name,
                  courseCode: course.code,
                  courseFaculty: faculty.name,
                  facultyId: faculty.empid,
                  courseSlot: course.slot,
                  courseSemester: course.semester
                };
                student.courses.push(enrolCourse);
                student.save(function(err) {
                  if (err) throw err;
                  res.json({
                    status: 1,
                    message: 'Enrolled Succesfully'
                  });
                });
              }
            });
          }
        });
      }
    });
  },

  //*****************************************************
  //***************Get Timetable*****************
  //*****************************************************

  getTimetable: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        res.json({
          status : 1,
          timetable : student.courses,
          newToken : req.token
        });
      }
    });
  },

  //*****************************************************
  //***************Get marks of all courses*****************
  //*****************************************************

  getMarks: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        Marks.find({
          'regno': student.regno
        }, function(err, marksData) {
          if (err) throw err;
          if (!marksData) {
            res.json({
              status : 1,
              marks : null,
              newToken : req.token
            });
          }
          else {
            res.json({
              status : 1,
              marks : marksData,
              newToken : req.token
            });
          }
        });
      }
    });
  },

  //***************************************************************
  //***************Get all messages sent to the student*****************
  //**************************************************************

  getMessages: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        Message.find({
          to: {
            "$in": [
              student.regno
            ]
          }
        }, function(err, messages) {
          if (err) throw err;
          if (!messages) failureResponse(req, res, 'No messages!');
          else {
            res.json({
              status : 1,
              messages : messages,
              newToken : req.token
            });
          }
        });
      }
    });
  },

  //*****************************************************************
  //***************Get attendance for a particular subject*****************
  //****************************************************************

  getAttendance: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        Attendance.find({
          'courseCode': req.body.course,
          'facultyId': req.body.faculty
        }, function(err, attendanceData) {
          if (err) throw err;
          if (!attendance || attendance[0] == undefined) {
            failureResponse(req, res, 'Attendance not Updated!')
          } else {
            var finalData = [];
            for (i = 0; i < attendanceData.length; i++) {
              var present;
              for (j = 0; j < attendanceData[i].attendance.length; j++) {
                if (attendanceData[i].attendance[j].regno == student.regno) {
                  present = attendanceData[i].attendance[j].present;
                  break;
                }
              }
              var temp = {
                date: attendanceData[i].date,
                slot: attendanceData[i].slot,
                present: present
              }
              finalData.push(temp);
            }
            res.json({
              status: 1,
              attendance: finalData,
              newToken: req.token
            });
          }
        });
      }
    });
  },

  //*****************************************************
  //***************Send message to a faculty*****************
  //*****************************************************

  sendMessage: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        Faculty.findOne({
          'empid': req.body.empid
        }, function(err, faculty) {
          if (err) throw err;
          if (!faculty) failureResponse(req, res, 'Faculty or course not found or token might have expired.');
          else {
            var newMsg = new Message();
            newMsg.from = student.regno;
            newMsg.to.push(faculty.empid);
            newMsg.message = req.body.message;
            newMsg.save(function(err) {
              if (err) throw err;
              res.json({
                status : 1,
                message : "Message Sent!",
                newToken : req.token
              });
            })
          }
        });
      }
    });
  },

  //*****************************************************
  //***************Get quiz list for all courses*****************
  //*****************************************************

  getQuiz: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        var slots = [];
        for (i = 0; i < student.courses.length; i++) {
          slots.push(student.courses[i].courseSlot)
        }
        Quiz.find({
          'slot': {
            "$in": slots
          },
          'open': true
        }, function(err, quizes) {
          if (err) throw err;
          if (!quizes || quizes[0] == undefined) failureResponse(req, res, 'No quizes found!');
          else {
            var quizList = [];
            for (i = 0; i < quizes.length; i++) {
              var temp = {
                name: quizes[i].name,
                quizId: quizes[i].quizId,
                duration: quizes[i].duration,
                startDate: quizes[i].startDate,
                endDate: quizes[i].endDate,
                course: quizes[i].courseCode
              };
              quizList.push(temp);
            }
            res.json({
              status: 1,
              quizes: quizList,
              newToken: req.token
            });
          }
        });
      }
    });
  },

  //*****************************************************
  //***************Quiz attempt function*****************
  //*****************************************************

  attemptQuiz: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        Quiz.findOne({
          'quizId': req.body.quizId,
          'open': true
        }, function(err, quiz) {
          if (err) throw err;
          if (!quiz) failureResponse(req, res, 'No quiz found!');
          else {
            QuizTemp.findOne({
              'quizId': req.body.quizId,
              'regno': regno
            }, function(err, temp) {
              if (err) throw err;
              if (!temp) {
                var tempQuiz = new QuizTemp({
                  quizId: quiz.quizId,
                  regno: student.regno,
                  date: 'Date',
                  startTime: 'starttime',
                  submitted : false
                });
                var numberOfQuestions = quiz.numberOfQuestions;
                var randomQuestions = getRandom(quiz.questions, numberOfQuestions);
                for (i = 0; i < randomQuestions.length; i++) {
                  var tempQuestions = {};
                  tempQuestions.questionId = randomQuestions[i].questionId;
                  tempQuestions.attempted = false;
                  tempQuestions.marks = randomQuestions[i].marks;
                  tempQuiz.questions.push(tempQuestions);
                }
                tempQuiz.save(function(err) {
                  res.json({
                    status: 1,
                    quiz: {
                      name: quiz.name,
                      slot: quiz.slot,
                      numberOfQuestions: quiz.numberOfQuestions,
                      firstQuestion: tempQuiz.questions[0]
                    },
                    newToken: req.token
                  });
                });
              } else {
                failureResponse(req, res, 'Quiz already attempted!');
              }
            });
          }
        });
      }
    });
  },

  //*****************************************************
  //***************Get question with ID*****************
  //*****************************************************

  getQuestion: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        Quiz.findOne({
          'quizId': req.body.quizId
        }, function(err, quiz) {
          if (err) throw err;
          if (!quiz) failureResponse(req, res, 'No quiz found!');
          else {
            for (i = 0; i < quiz.questions.length; i++) {
              if (quiz.questions[i].questionId == req.body.questionId) {
                res.json({
                  status: 1,
                  question: quiz.questions[i].question,
                  options: quiz.questions[i].options,
                  marks: quiz.questions[i].marks,
                  newToken: req.token
                });
                break;
              }
            }
          }
        })
      }
    })
  },

  //**********************************************************
  //***************Submit answer and get next question*****************
  //**********************************************************

  nextQuestion: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        QuizTemp.findOne({
          'quizId': req.body.quizId,
          'regno': regno,
          'submitted': false
        }, function(err, temp) {
          if (err) throw err;
          if(!temp) failureResponse(req, res, 'Quiz already attempted or attempt not started yet!');
          else {
            var nextId, marks;
            if (req.body.attemptId) {
              for (i = 0; i < temp.questions.length; i++) {
                if (temp.questions[i].questionId == req.body.attemptId) {
                  temp.questions[i].attempted = true;
                  marks = temp.questions[i].marks;
                  break;
                }
              }
            }
            nextId = temp.questions[req.body.quesNum - 1].questionId;
            QuizSubmission.findOne({
              'quizId': req.body.quizId,
              'regno': regno
            }, function(err, submit) {
              if (err) throw err;
              if (!submit) {
                var newSubmit = new QuizSubmission({
                  quizId: temp.quizId,
                  regno: temp.regno,
                  date: 'date',
                  startTime: 'startTime',
                });
                if (req.body.attemptId) {
                  var solution = {
                    questionId: req.body.attemptId,
                    answer: req.body.answer,
                    marks: marks
                  };
                  newSubmit.solutions.push(solution);
                }
                temp.save(function(err) {
                  if (err) throw err;
                  newSubmit.save(function(err) {
                    if (err) throw err;
                    res.json({
                      status: 1,
                      nextQuestion: nextId
                    });
                  });
                });
              } else {
                if (req.body.attemptId) {
                  var index = search(submit.solutions, req.body.attemptId);
                  if (index >= 0) {
                    submit.solutions[index].answer = req.body.answer;
                  } else {
                    var solution = {
                      questionId: req.body.attemptId,
                      answer: req.body.answer,
                      marks: marks
                    };
                    submit.solutions.push(solution);
                  }
                }
                temp.save(function(err) {
                  if (err) throw err;
                  submit.save(function(err) {
                    if (err) throw err;
                    res.json({
                      status: 1,
                      nextQuestion: nextId
                    });
                  });
                });
              }
            });
          }
        });
      }
    });
  },

  //**********************************************************
  //***************Submit quiz and get marks*****************
  //**********************************************************

  submitQuiz: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        QuizTemp.findOne({
          'quizId': req.body.quizId,
          'regno': regno,
          'submitted' : false
        }, function(err, temp) {
          if (err) throw err;
          if(!temp) failureResponse(req, res, 'Quiz already submitted or attempt not started!')
          else {
            var marks;
            if (req.body.attemptId) {
              for (i = 0; i < temp.questions.length; i++) {
                if (temp.questions[i].questionId == req.body.attemptId) {
                  temp.questions[i].attempted = true;
                  marks = temp.questions[i].marks;
                  break;
                }
              }
            }
            QuizSubmission.findOne({
              'quizId': req.body.quizId,
              'regno': regno
            }, function(err, submit) {
              if (err) throw err;
              if (!submit) {
                var newSubmit = new QuizSubmission({
                  quizId: req.body.quizId,
                  regno: regno,
                  date: 'date',
                  startTime: 'startTime',
                });
                if (req.body.attemptId) {
                  var solution = {
                    questionId: req.body.attemptId,
                    answer: req.body.answer,
                    marks: marks
                  };
                  newSubmit.solutions.push(solution);
                }
                Quiz.findOne({
                  'quizId': req.body.quizId
                }, function(err, MainQuiz) {
                  if (err) throw err;
                  else {
                    var AcqMarks = 0;
                    for (i = 0; i < submit.solutions.length; i++) {
                      index = search(MainQuiz.questions, submit.solutions[i].questionId);
                      if (index >= 0) {
                        if (submit.solutions[i].answer == MainQuiz.questions[index].answer) {
                          AcqMarks = AcqMarks + MainQuiz.questions[index].marks;
                        }
                      }
                    }
                  }
                  var numOfAttempted = newSubmit.solutions.length;
                  var TotalQues = temp.questions.length;
                  var maxMarks = 0;
                  for (var i = 0; i < temp.questions.length; i++) {
                    maxMarks += temp.questions[i].marks;
                  }
                  newSubmit.submitted = true;
                  newSubmit.save(function(err) {
                    if (err) throw err;
                    res.json({
                      status: 1,
                      message: 'Quiz submitted',
                      TotalQues: TotalQues,
                      QuestionsAttempted: numOfAttempted,
                      scoredMarks: AcqMarks,
                      maxMarks: maxMarks
                    });
                  });
                });
              } else {
                if (req.body.attemptId) {
                  var index = search(submit.solutions, req.body.attemptId);
                  if (index >= 0) {
                    submit.solutions[index].answer = req.body.answer;
                  } else {
                    var solution = {
                      questionId: req.body.attemptId,
                      answer: req.body.answer,
                      marks: marks
                    };
                    submit.solutions.push(solution);
                  }
                }
                Quiz.findOne({
                  'quizId': req.body.quizId
                }, function(err, MainQuiz) {
                  if (err) throw err;
                  else {
                    var AcqMarks = 0;
                    for (i = 0; i < submit.solutions.length; i++) {
                      index = search(MainQuiz.questions, submit.solutions[i].questionId);
                      if (index >= 0) {
                        if (submit.solutions[i].answer == MainQuiz.questions[index].answer) {
                          AcqMarks = AcqMarks + MainQuiz.questions[index].marks;
                        }
                      }
                    }
                  }
                  var numOfAttempted = submit.solutions.length;
                  var TotalQues = temp.questions.length;
                  var maxMarks = 0;
                  for (var i = 0; i < temp.questions.length; i++) {
                    maxMarks += temp.questions[i].marks;
                  }
                  submit.submitted = true;
                  submit.save(function(err) {
                    if (err) throw err;
                    res.json({
                      status: 1,
                      message: 'Quiz submitted',
                      TotalQues: TotalQues,
                      QuestionsAttempted: numOfAttempted,
                      scoredMarks: AcqMarks,
                      maxMarks: maxMarks
                    });
                  });
                });
              }
            });
          }
        });
      }
    })
  }



}

function search(myArray, nameKey) {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i].questionId == nameKey) {
      return i;
    }
  }
  return -1;
}

function getRandom(questions, n) {
  var result = new Array(n),
    len = questions.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = questions[x in taken ? taken[x] : x];
    taken[x] = --len;
  }
  return result;
}

function failureResponse(req, res, message) {
  res.json({
    status: 0,
    message: message,
    newToken: req.token
  });
}
