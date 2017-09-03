var mongoose = require('mongoose');
mongoose.Promise = global.Promise; 

mongoose.connect(keys.dbConnectionString);

var playerCredentialsModel = mongoose.model('playerCredentialsModel', mongoose.Schema({
	email: String,
	password: String,
	score: Number
}));
var secondarySchema = new mongoose.Schema({
	imageLink: String
});

var dataModel = mongoose.model('dataModel', mongoose.Schema({
	primaryImage: String,
	secondaryImages: [secondarySchema]
}));

var submissionModel = mongoose.model('submissionModel',mongoose.Schema({
	email: String,
	questions: String,
	answers: String,
	status: String,
	matched_with: String,
	time_stamp: String
}))

var sess;

app.post('/submitResult',function(req, res){
	sess = req.session;
	questions = req.body.questions;
	newanswers  = req.body.answers;
	if(!sess.email){
		sess.email=req.body.user;
	}
	submissionModel.findOne({status:"pending",matched_with:sess.email},function(err, result){
		if(err){
			console.log("Error in searching a match");
			res.redirect('/');
		}
		if(result){
			
			var arrayResult = result.answers.split(',');
			console.log(arrayResult);
			console.log(newanswers);
			var flag=0;
			for(i=0;i<newanswers.length;i++){
				if (arrayResult[i]!=','&&arrayResult[i]==newanswers[i]) {
					flag++;
				}
				if(flag==newanswers.length-4){
					playerCredentialsModel.findOneAndUpdate({email:sess.email},{$inc:{score: 1}},function(err, result){
						if(result){
							console.log(sess.email+" rewarded"+ 1);
						}
					})
					playerCredentialsModel.findOneAndUpdate({email:result.email},{$inc:{score: 1}},function(err, result){
						if(result){
							console.log(result.email+" rewarded"+ 1);
						}
					})
					res.json({'status':1});
				}
			}
			
			console.log(flag+ ' match');

			submissionModel.findOneAndUpdate({email:result.email,status:"pending",matched_with:sess.email},{status:"done"},function(err){
				console.log('submission of '+ result.email +' closed');
			})
			var newSubmission = new submissionModel({email:sess.email,
				questions:questions,
				answers:newanswers,
				status:"done",
				matched_with:result.email,
				time_stamp:new Date()
			});	
			newSubmission.save(function(err){
				if(err){
					console.log('Error in saving new pending Submission');
				}
				console.log('submission of '+ sess.email +' created and closed');
			});
			
			



		}else{
			var newSubmission = new submissionModel({email:sess.email,
				questions:questions,
				answers:newanswers,
				status:"pending",
				matched_with:"",
				time_stamp:new Date()
			});
			newSubmission.save(function(err){
				if(err){
					console.log('Error in saving new pending Submission');
				}
				res.json({'status':0});
			});

		}
	})
})

app.get('/game',function(req, res){
	console.log('game start');
	sess = req.session;
	if(sess.email){
		var curr_time = new Date();

		submissionModel.find({status:"pending"},
			function(err, result){
				if(err){
					console.log('error in finding submissions');
					res.redirect('/');
				}
				var flag=0;
				if(result){
					for(x in result){
						if(result[x].matched_with=""){
							console.log('Matched with'+ result[x].email);
							res.render('game',{email:sess.email,score:sess.score,questions:result[x].questions})
							submissionModel.findOneAndUpdate({email:result[x].email,status:"pending"},{matched_with:sess.email,time_stamp:curr_time},function(err,result){
								if(result){
									console.log(result[x]+' updated and matched with'+ sess.email );
								}
							})
							flag=1;
							break;						
						}else if(result[x].email!=sess.email){

							data_time = new Date(result[x].time_stamp);
							data_time.setMinutes = data_time.getMinutes()+15;
							if(data_time<curr_time){
								console.log('Matched with'+ result[x].email);
								res.render('game',{email:sess.email,score:sess.score,questions:result[x].questions})
								submissionModel.findOneAndUpdate({email:result[x].email,status:"pending"},{matched_with:sess.email,time_stamp:curr_time},function(err,result){
									if(result){
										console.log(result[x]+' updated and matched with'+ sess.email );
									}
								})
								flag=1;
								break;
							}
						}
					}
					
					
				}
				if(!result||flag==0){
					console.log('not matched, new questions to be sent');

					var QuestionIds = []
					while(QuestionIds.length < keys.maxQuestionsPerPlayer){
						var randomnumber = Math.ceil(Math.random()*keys.totalNoOfQuestions)
						if(QuestionIds.indexOf(randomnumber-1) == -1) 
							QuestionIds[QuestionIds.length] = randomnumber-1;
					}
					console.log('arr'+QuestionIds);
					var questionsToSend=[];
					data="";
					dataModel.find({},{_id:0},function(err,resu){
						if(err){
							console.log('Error in retieving questions');
							res.redirect('/');
						}else{
							data=resu;
							for(i=0;i<QuestionIds.length;i++){
								questionsToSend.push(data[QuestionIds[i]]);
							}
				//console.log('ques'+questionsToSend);
				tt = JSON.stringify(questionsToSend);
				res.render('game',{email:sess.email,score:sess.score,questions:tt});
			}
		})				
				}
			}).sort( {time_stamp: 1 })

		
	}else{
		res.redirect('/');
	}
})

function isEmpty(value) {
	return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
}


app.post('/register', function (req, res) {
	if(req.body.email&&req.body.password&&!isEmpty(req.body.email)&&!isEmpty(req.body.password)){
		playerCredentialsModel.findOne({ email:req.body.email},function(error,result){
			console.log('result--> '+result);
			if(error){
				console.log("Error in searching"+ error);
				res.redirect('/');
			}
			if(result){
				console.log('Already exists'+result);
				res.render('login',{error:'none',registerError:'block'});
			}else{
				console.log("New registration: "+req.body.email);
				var newUser = new playerCredentialsModel({ email:req.body.email,password:req.body.password,score:0});
				newUser.save(function (err) {
					if (err) {
						console.log('Error in registration');
						console.log(err);
						res.redirect('/');
					} else {
						console.log('Registered');
						sess = req.session;
						sess.email = req.body.email;
						sess.score = 0;
						res.redirect('/game');
					}
				});				
			}
		})

	}else{
		res.send('Email/Password is invalid');
	}
})


app.post('/login', function (req, res) {
	sess = req.session;
	if(sess.email) {
		console.log('Login: '+sess.email);
		res.redirect('/game');
	}else {
		playerCredentialsModel.findOne({email:req.body.email,password:req.body.password},
			function(error, result) { 
				if(error){
					console.log("Error in logging in");
					console.log(error);
					res.redirect('/');
				}else if(result){
					console.log("Username password correct");
					sess.email = req.body.email;
					sess.score = result.score;
					res.redirect('/game');
				}else{
					console.log("Invalid username/password");
					res.render('login',{error:'block',registerError:'none'});
				}
			});
	}
})

app.post('/feedData',function(req, res){
	var primary = 'images/'+req.body.primary;	
	var newData = new dataModel({
		primaryImage:primary
	});
	newData.secondaryImages.push({imageLink:"images/"+req.body.s1});
	newData.secondaryImages.push({imageLink:"images/"+req.body.s2});
	newData.secondaryImages.push({imageLink:"images/"+req.body.s3});
	newData.secondaryImages.push({imageLink:"images/"+req.body.s4});
	newData.save(function(err){
		if(err){
			console.log('Error saving'+err);
			res.redirect('/');
		}else{
			console.log('Data feeded');
			res.send('Data feeded');
		}
	})
})

app.get('/feedDataMlab',function(req, res){
	for(x in keys.feedData){
		var primary = keys.feedData[x].primaryImage;	
		var newData = new dataModel({
			primaryImage:primary
		});
		newData.secondaryImages.push({imageLink:keys.feedData[x].secondaryImages[0].imageLink});
		newData.secondaryImages.push({imageLink:keys.feedData[x].secondaryImages[1].imageLink});
		newData.secondaryImages.push({imageLink:keys.feedData[x].secondaryImages[2].imageLink});
		newData.secondaryImages.push({imageLink:keys.feedData[x].secondaryImages[3].imageLink});
		newData.save(function(err){
			if(err){
				console.log('Error saving'+err);
				//res.redirect('/');
			}else{
				console.log('Data feeded');
				//res.send('Data feeded');
			}
		})		
	}
	res.send("Doing");
})

app.get('/initialize',function(req, res){
	for(x in keys.feedData){
		var primary = keys.feedData[x].primaryImage;	
		var newData = new dataModel({
			primaryImage:primary
		});
		newData.secondaryImages.push({imageLink:keys.feedData[x].secondaryImages[0].imageLink});
		newData.secondaryImages.push({imageLink:keys.feedData[x].secondaryImages[1].imageLink});
		newData.secondaryImages.push({imageLink:keys.feedData[x].secondaryImages[2].imageLink});
		newData.secondaryImages.push({imageLink:keys.feedData[x].secondaryImages[3].imageLink});
		newData.save(function(err){
			if(err){
				console.log('Error saving'+err);
				//res.redirect('/');
			}else{
				console.log('Data feeded');
				//res.send('Data feeded');
			}
		})		
	}
	res.send("Initializing data, It will take couple of seconds. Please go to home page. ");
})

app.get('/test',function(req, res){
	dataModel.find({},function(err,resu){
		res.send(resu);
	})
})
module.exports = app;