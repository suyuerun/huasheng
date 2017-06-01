var express = require('express');
var router = express.Router();

var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '1234',
	port: '3306',
	database: 'huasheng',
});

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');

});
router.post('/zhuce', function(req, res, next) {
	// res.send('注册');
	email = req.body.email,
		pwd = req.body.pwd,
		nicheng = req.body.nicheng,
		
		res.send('email:' + email + '<br/>' + '密码:' + pwd + '<br/>' + '昵称:' + nicheng + '<br/>');

	//MYSQL

	connection.connect();

	var addSql = 'INSERT INTO users (email,pwd,nicheng) VALUE(?,?,?)';
	var addSqlParams = [email, pwd, nicheng];
	//增
	connection.query(addSql, addSqlParams, function(err, result) {
		if(err) {
			console.log('[INSERT ERROR] - ', err.message);
			return;
		}

		console.log('--------------------------INSERT----------------------------');
		//console.log('INSERT ID:',result.insertId);        
		console.log('INSERT ID:', result);
		console.log('-----------------------------------------------------------------\n\n');
	});

	connection.end();

});

router.post('/login', function(req, res, next) {
	// res.send('注册');
	email = req.body.email,
		pwd = req.body.pwd,
		//res.send('email:'+email+'<br/>'+'密码:'+pwd+'<br/>');

		connection.connect();

	var sql = 'SELECT pwd FROM users where email = ?';
	var queryParams = [email];
	//查
	connection.query(sql, queryParams, function(err, result) {
		if(err) {
			console.log('[SELECT ERROR] - ', err.message);
			return;
		}
		if(result.pwd != pwd) {
			res.render('../views/UI/logined', { title: 'Express' });
			
		}else{
			res.send('登录失败');
		}
		console.log('--------------------------SELECT----------------------------');
		console.log(result);
		console.log('------------------------------------------------------------\n\n');

	});
	connection.end();
});

module.exports = router;