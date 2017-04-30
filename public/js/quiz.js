var currentQues = 1;
var answered = [];

//Get first question on page load
window.onload = function() {
  getQues();

}


//Get question function to get question and options using ID
function getQues() {
  $('#quiz').html("");
  $('#loadbar').show();
  $('#quiz').fadeOut();
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "http://localhost:3000/student/getquizquestion",
    "method": "POST",
    "headers": {
      "content-type": "application/x-www-form-urlencoded"
    },
    "data": {
      "quizId": quizId,
      "questionId": $('#question').attr('questionId')
    }
  }
  $.ajax(settings).done(function(response) {
    $('#loadbar').hide();
    $('#question').html(response.question);
    $('#qid').html(currentQues);
    for (i = 0; i < response.options.length; i++) {
      var optionValues = {
        id: response.options[i].optionId,
        option: response.options[i].option
      };
      var options = "<label id=\"" + optionValues.id + "\" class=\"element-animation1 btn btn-lg btn-primary btn-block\" onclick=\"submitAnswer('" + optionValues.id + "');\"> " +
        "<span class=\"btn-label\"><i class=\"glyphicon glyphicon-chevron-right\"></i></span>" +
        "<input type=\"radio\" name=\"q_answer\" value=\"" + optionValues.id + "\">" +
        optionValues.id + " - " + optionValues.option + "</label>";
      $('#quiz').append(options);
    }
    markAnswered();
    $('#quiz').show();
    $('#loadbar').fadeOut();
    startTimer();
  });
}



function submitAnswer(answer) {
  markAnswer(answer);
  $('#loadbar').show();
  $('#quiz').fadeOut();
  incrementQuesNum();
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "http://localhost:3000/student/nextques",
    "method": "POST",
    "headers": {
      "content-type": "application/x-www-form-urlencoded"
    },
    "data": {
      "quizId": quizId,
      "attemptId": $('#question').attr('questionId'),
      "quesNum": currentQues,
      "answer": answer
    }
  }
  $.ajax(settings).done(function(response) {
    $('#question').attr('questionId', response.nextQuestion);
    getQues();
  });
}

function nextQuestion(id) {
  currentQues = parseInt(id);
  $('#loadbar').show();
  $('#quiz').fadeOut();
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "http://localhost:3000/student/nextques",
    "method": "POST",
    "headers": {
      "content-type": "application/x-www-form-urlencoded"
    },
    "data": {
      "quizId": quizId,
      "quesNum": currentQues
    }
  }
  console.log(settings);
  $.ajax(settings).done(function(response) {
    $('#question').attr('questionId', response.nextQuestion);
    getQues();
  });
}

function confirmSubmit() {
  var ch = confirm("Do you want to submit the quiz?");
  if (ch) {
    $('#loadbar').show();
    $('#quiz').fadeOut();
    $('.pagination').hide();
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://localhost:3000/student/quizsubmit",
      "method": "POST",
      "headers": {
        "content-type": "application/x-www-form-urlencoded"
      },
      "data": {
        "quizId": quizId,
        "questionId": $('#question').attr('questionId')
      }
    }
    $.ajax(settings).done(function(response) {
      $('#qid').hide();
      $('#loadbar').hide();
      $('#question').html(response.message);
      $('#quiz').html("");
      var results = "<label class=\"element-animation1 btn btn-lg btn-primary btn-block\"> " +
        "<span class=\"btn-label\"><i class=\"glyphicon glyphicon-chevron-right\"></i></span>" +
        "Total Questions - " + response.TotalQues + "</label>";

      results += "<label class=\"element-animation1 btn btn-lg btn-primary btn-block\"> " +
        "<span class=\"btn-label\"><i class=\"glyphicon glyphicon-chevron-right\"></i></span>" +
        "Questions Attempted - " + response.QuestionsAttempted + "</label>";

      results += "<label class=\"element-animation1 btn btn-lg btn-primary btn-block\"> " +
        "<span class=\"btn-label\"><i class=\"glyphicon glyphicon-chevron-right\"></i></span>" +
        "Maximum Marks - " + response.maxMarks + "</label>";

      results += "<label class=\"element-animation1 btn btn-lg btn-danger btn-block\"> " +
        "<span class=\"btn-label\"><i class=\"glyphicon glyphicon-chevron-right\"></i></span>" +
        "Marks Scored - " + response.scoredMarks + "</label>";
      $("#quiz").show();
      $('#quiz').append(results);
      clearInterval(x);
    });
  }
}

function forceSubmit() {
    $('#loadbar').show();
    $('#quiz').fadeOut();
    $('.pagination').hide();
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://localhost:3000/student/quizsubmit",
      "method": "POST",
      "headers": {
        "content-type": "application/x-www-form-urlencoded"
      },
      "data": {
        "quizId": quizId,
        "questionId": $('#question').attr('questionId')
      }
    }
    $.ajax(settings).done(function(response) {
      $('#qid').hide();
      $('#loadbar').hide();
      $('#question').html(response.message);
      $('#quiz').html("");
      var results = "<label class=\"element-animation1 btn btn-lg btn-primary btn-block\"> " +
        "<span class=\"btn-label\"><i class=\"glyphicon glyphicon-chevron-right\"></i></span>" +
        "Total Questions - " + response.TotalQues + "</label>";

      results += "<label class=\"element-animation1 btn btn-lg btn-primary btn-block\"> " +
        "<span class=\"btn-label\"><i class=\"glyphicon glyphicon-chevron-right\"></i></span>" +
        "Questions Attempted - " + response.QuestionsAttempted + "</label>";

      results += "<label class=\"element-animation1 btn btn-lg btn-primary btn-block\"> " +
        "<span class=\"btn-label\"><i class=\"glyphicon glyphicon-chevron-right\"></i></span>" +
        "Maximum Marks - " + response.maxMarks + "</label>";

      results += "<label class=\"element-animation1 btn btn-lg btn-danger btn-block\"> " +
        "<span class=\"btn-label\"><i class=\"glyphicon glyphicon-chevron-right\"></i></span>" +
        "Marks Scored - " + response.scoredMarks + "</label>";
      $("#quiz").show();
      $('#quiz').append(results);
    });
}

function markAnswered() {
  if (answered.length > 0) {
    for (i = 0; i < answered.length; i++) {
      if (answered[i].questionId == $('#question').attr('questionId')) {
        var answer = answered[i].answer;
        $('#' + answer).addClass('btn-success');
      }
    }
  }

}

function markAnswer(answer) {
  for (i = 0; i < answered.length; i++) {
    if (answered[i].questionId == $('#question').attr('questionId')) {
      answered[i].answer = answer;
      return;
    }
  }
  temp = {
    questionId: $('#question').attr('questionId'),
    answer: answer
  }
  answered.push(temp);
}

function incrementQuesNum() {
  if (currentQues == numberOfQuestions) {
    currentQues = 1;
  } else {
    currentQues += 1;
  }
}

//****************** Timer ******************


var timerFlag = 0;
var x
function startTimer() {
  if (timerFlag == 0) {
    var countDownDate = new Date().getTime() + duration * 60 * 1000;
    x = setInterval(function() {
      timerFlag = 1; 
      var now = new Date().getTime(); 
      var distance = countDownDate - now; 
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); 
      var minutes = Math.floor(distance / (1000 * 60)); 
      var seconds = Math.floor((distance % (1000 * 60)) / 1000); 
      document.getElementById("timer").innerHTML = hours + ":"  + minutes + ":" + seconds; 
      if (distance < 0) {   
        clearInterval(x);
        forceSubmit();   
        document.getElementById("timer").innerHTML = "EXPIRED"; 
      } else if (distance < 60000) { 
        $('#timer').addClass('btn-danger'); 
      }
    }, 1000);
  }
}
