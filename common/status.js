var status = {

	success: function(server,result,message) {
		var data = {
			status:"success",
			status_code:200,
			message:message,
			result:result
		};
		
		server.res.send(data);
	},

	no_record: function(server) {
		var data = {
			status:"no_record",
			status_code:204,
			message:'No record found',
		};
		server.res.send(data);
	},

	conflict: function(server){
		var data = {
			status:"conflict",
			status_code:205,
			message:'Conflict found',
		};
		server.res.send(data);
	},

}

var error = {
	// 7xx - client related errors
	// parameter - 700 - 709
	no_param: function(server) {
		var data = {"error": {"reason": "no parameter","message":"No parameter found","code": 700,"error_type": "no_parameter"}};
		server.res.send(data);
	},
	param_required: function(server,message,field) {
		var data = {"error": {"reason":"parameter missing","message":message,"field_name":field,"code": 701,"error_type": "missing_parameter"}};
		server.res.send(data);
	},
	required: function(server,message) {
		var data = {"error": {"reason": "required field","message":message,"code": 702,"error_type": "required"}};
		server.res.send(data);
	},
	server_error: function(server,message) {
		var data = {"error": {"message":message,"code": 500,"error_type": "server_error"}};
		server.res.send(data);
	},
	select_error: function(server) {
		var data = {"error": {"message":'Something went wrong while select the record',"code": 603,"error_type": "select_error"}};
		server.res.send(data);
	},
	invalid_access: function(server) {
		var data = {"error": {"message":"Invalid token / unauthorized access","code": 611,"error_type": "invalid_access"}};
		server.res.send(data);
	},
	// datatase - 600-609
	insert_error: function(server) {
		var data = {"error": {"reason": "Record insert error","message":'Something went wrong whil adding the record',"code": 601,"error_type": "db_insert_error"}};
		server.res.send(data);
	}, 
	//email errors 710-719
	invalid_email: function(server,message){
		var data = {"error": {"reason": "Invalid email","message": message+' is not an email address',"code": 710,"error_type": "invalid_email"}};
		server.res.send(data);
	},
	conflict_email: function(server){
		var data = {"error": {"reason": "conflict email","message": 'Email already exists',"code": 711,"error_type": "conflict_email"}};
		server.res.send(data);
	},

	//phone
	invalid_phone: function(server,message){
		var data = {"error": {"reason": "Invalid phone","message": message+' is not an valid phone number',"code": 810,"error_type": "invalid_phone"}};
		server.res.send(data);
	},

	invalid_password: function(server){
		var data = {"error": {"reason": "Invalid password","message": 'Your password must contain minimum 4 chars, maximum 25 chars',"code": 781,"error_type": "invalid_password"}};
		server.res.send(data);
	},

	password_mismatch: function(server){
		var data = {"error": {"reason": "password mismatch","message": 'Password that you entered is incorrect, maximum 25 chars',"code": 782,"error_type": "password_mismatch"}};
		server.res.send(data);
	},

	new_confirm_password_mismatch: function(server){
		var data = {"error": {"reason": "password mismatch","message": "New Password doesn't match with confirm password field","code": 799,"error_type": "new_confirm_password_mismatch"}};
		server.res.send(data);
	},
	
	wrong_password: function(server){
		var data = {"error": {"reason": "Wrong password","message": 'Your entered password is incorrect',"code": 783,"error_type": "wrong_password"}};
		server.res.send(data);
	},
	order_failed: function(server){
		var data = {"error": {"reason": "Order Failed","message": 'Your Order is failed try again',"code": 800,"error_type": "order_failed"}};
		server.res.send(data);
	},
	existing_file_delete_error: function(server) {
		var data = {"error": {"message":'Failed to delete existing file',"code": 801,"error_type": "existing_file_delete_error"}};
		server.res.send(data);
	},
}

module.exports = { status , error };