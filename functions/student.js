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
            var courseType;
            for (i = 0; i < faculty.tokens.length; i++) {
              if (faculty.tokens[i].token == req.body.token) {
                courseCode = faculty.tokens[i].course;
                courseType = faculty.tokens[i].type;
                break;
              }
            }
            Course.findOne({
              'code': courseCode,
              'type' : courseType
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
                  courseSemester: course.semester,
                  type : course.type
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
        res.render('student/timetable', {
          timetable: student.courses,
          student: req.user
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
        var slots = [];
        var faculties = [];
        var courseCodes = [];
        for(i = 0; i < student.courses.length; i++) {
          slots.push(student.courses[i].courseSlot);
          faculties.push(student.courses[i].facultyId);
          courseCodes.push(student.courses[i].courseCode);
        }
        Marks.find({
          slot : {
            $in : slots
          },
          facultyId : {
            $in : faculties
          },
          courseCode : {
            $in : courseCodes
          }
        }, function(err, marksData) {
          if (err) throw err;
          if (!marksData || marksData[0] == undefined) {
            res.json({
              status : 0
            });
          } else {
            for(i = 0; i < marksData.length; i++) {
              var marks = [];
              for(j = 0; j < marksData[i].marks.length; j++) {
                if(marksData[i].marks[j].regno == student.regno) {
                  var temp = {
                    regno : marksData[i].marks[j].regno,
                    marks : marksData[i].marks[j].marks
                  }
                  marks.push(temp);
                }
              }
              marksData[i].marks = marks;
            }
            res.json({
              marks: marksData,
              status : 1
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
          if (!messages || messages[0] == undefined) res.render('student/messages', {
            messages : null,
            student : req.user,
            alertMessage : "No messages"
          });
          else {
            res.render('student/messages', {
              messages: messages,
              student: req.user
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
          'empid': req.body.to
        }, function(err, faculty) {
          if (err) throw err;
          if (!faculty) failureResponse(req, res, 'Faculty or course not found or token might have expired.');
          else {
            var newMsg = new Message();
            newMsg.from = student.regno;
            newMsg.fromName = student.name;
            newMsg.to.push(faculty.empid);
            newMsg.message = req.body.message;
            newMsg.date = req.body.date;
            newMsg.save(function(err) {
              if (err) throw err;
              res.json({
                status: 1,
                message: "Message Sent!"
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
          if (!quizes || quizes[0] == undefined) res.render('student/quiz', {
            quizes : null,
            student : req.user,
            alertMessage : "No Quizes Found"
          })
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
            res.render('student/quiz', {
              quizes: quizList,
              student: req.user,
              alertMessage : ""
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
          if (!quiz) res.render('student/quiz', {
            quizes: null,
            student: req.user,
            alertMessage : "No Quiz Found"
          });
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
                  submitted: false
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
                  res.render('student/attemptquiz', {
                    status: 1,
                    quiz: {
                      quizId: quiz.quizId,
                      name: quiz.name,
                      slot: quiz.slot,
                      numberOfQuestions: quiz.numberOfQuestions,
                      questionIds: tempQuiz.questions,
                      duration : quiz.duration
                    },
                    student: req.user,
                    alertMessage : ""
                  });
                });
              } else {
                res.render('student/attemptquiz', {
                  status: 1,
                  quiz: null,
                  student: req.user,
                  alertMessage : "Quiz already Attempted"
                });
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
          if (!temp) failureResponse(req, res, 'Quiz already attempted or attempt not started yet!');
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
          'submitted': false
        }, function(err, temp) {
          if (err) throw err;
          if (!temp) failureResponse(req, res, 'Quiz already submitted or attempt not started!')
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
                var numOfAttempted = 0;
                var TotalQues = temp.questions.length;
                var maxMarks = 0;
                for (var i = 0; i < temp.questions.length; i++) {
                  maxMarks += temp.questions[i].marks;
                }
                res.json({
                  status: 1,
                  message: 'Quiz submitted',
                  TotalQues: TotalQues,
                  QuestionsAttempted: numOfAttempted,
                  scoredMarks: 0,
                  maxMarks: maxMarks
                });
              } else {
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
