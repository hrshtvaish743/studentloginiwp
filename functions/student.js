var Student = require('../models/student');
var Faculty = require('../models/faculty');
var Course = require('../models/course');
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
    }


}

function failureResponse(req, res, message) {
    res.json({
        status: 0,
        message: message,
        newToken: req.token
    });
}
