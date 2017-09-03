
var sess;

app.get('/', function (req, res) {
	sess = req.session;
	if(sess.email) {
		console.log('Login: '+sess.email);
		res.redirect('/game');
	}
	else {
		res.render('login',{error:'none',registerError:'none'});
	}
})



app.get('/login',function(req, res){
	sess = req.session;
	if(sess.email) {
		console.log('Login: '+sess.email);
		res.redirect('/game');
	}else{
		res.render('login',{error:'none',registerError:'none'});	
	}
	
})

app.get('/logout',function(req, res){
	req.session.destroy(function(err) {
		if(err) {
			console.log("Logout error: "+err);
		} else {
			res.redirect('/');
		}
	})
})

app.get('/admin',function(req, res){
	res.render('admin');
})



module.exports = app;