var express = require('express');
var router = express.Router();
//var Sequelize =require('sequelize');
var Users = require('../models/UserModel');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');

});
router.get('/logout', function(req, res, next) {
	delete req.session.loginbean;
	res.redirect('/');
});
router.post('/login', function(req, res, next) {
	 Users.findOne({where:{email:req.body.email,pwd:req.body.pwd}}).then(function(rs){
	 if(rs!=null){
	 	var loginbean={};
	 	loginbean.id = rs.id;
	 	loginbean.nicheng = rs.nicheng;
	 	loginbean.role= rs.role;
	 	loginbean.msgnum = rs.msgnum;
	 	req.session.loginbean=loginbean;
	 	
	 	res.redirect(req.body.url);
	 }else{
	 	res.send("<script>alert('email/密码错误');location.href='/';</script>");
	 	
	 }
//	 console.log(rs);
//	 res.send(rs);
	 });
	
});
router.post('/zhuce', function(req, res, next) {
	Users.create(req.body).then(function(rs) {
	res.redirect(307,'./login');

	
		res.send('插入成功');
	}).catch(function(err) {
	//	console.log('失败');
	//	console.log(err);
		if(err.errors[0].path=='nichenguniq'||err.errors[0].path=='emailuniq'){
			res.send('email重复，昵称重复');
		}else if(err.errors[0].path=='nichenguniq'){
			res.send('昵称重复');
		}else if(err.errors[0].path=='emailuniq'){
			res.send('邮箱重复');
		
		}else{
			res.send('数据库错误，稍后再试');
		}
	//	res.send(err);
	//});

	// res.send('注册');
	
	//MYSQL
});
});



module.exports = router;