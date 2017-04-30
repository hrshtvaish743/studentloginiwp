$(function() {
    $('#student-login-form-link').click(function(e) {
    	$("#student-login-form").delay(100).fadeIn(100);
 		$("#faculty-login-form").fadeOut(100);
		$('#faculty-login-form-link-div').removeClass('active-btn');
		$('#student-login-form-link-div').addClass('active-btn');
		e.preventDefault();
	});
	$('#faculty-login-form-link').click(function(e) {
		$("#faculty-login-form").delay(100).fadeIn(100);
 		$("#student-login-form").fadeOut(100);
		$('#student-login-form-link-div').removeClass('active-btn');
		$('#faculty-login-form-link-div').addClass('active-btn');
		e.preventDefault();
	});

});
