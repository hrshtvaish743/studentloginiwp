var Student = require('../models/student');
var Faculty = require('../models/faculty');
var Course = require('../models/course');
var Message = require('../models/message');
var Attendance = require('../models/attendance');
var Marks = require('../models/marks');
var jwt = require('jsonwebtoken');
var config = require('../config/config.js');
var shortid = require('shortid');

module.exports = {
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

  getTimetable: function(req, res, regno) {
    Student.findOne({
      'regno': regno
    }, function(err, student) {
      if (err) throw err;
      if (!student) failureResponse(req, res, 'Student not registered!');
      else {
        res.send(student.courses);
      }
    });
  },

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
          if (!marksData) failureResponse(req, res, 'Marks not posted yet!');
          else {
            res.send(marksData);
          }
        });
      }
    });
  },

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
            res.send(messages);
          }
        });
      }
    });
  },

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
            res.send('attendance not uploaded')
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
            res.send(finalData);
          }
        });
      }
    });
  },

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
            newMsg.to = faculty.empid;
            newMsg.message = req.body.message;
            newMsg.save(function(err) {
              if (err) throw err;
              res.send('Message Sent');
            })
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
