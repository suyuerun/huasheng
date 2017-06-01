var express = require('express');
var router = express.Router();
var sequelize = require('../models/ModelHeader')();
//var sequelize = require('sequelize'); 
var PrivateInfoModel = require('../models/PrivateInfoModel');
var User = require('../models/UserModel');
var MsgModel = require('../models/MsgModel');
/* GET home page. */
router.get('/', function(req, res, next) {
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	if(loginbean.role == 0) {
		res.render('admin/adminHome', {});

	} else {
		res.send('<script>alert("你无权访问此页面");location.href="/"</script>');
	} //script 的跳转
});

router.get('/authList', function(req, res, next) {
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	if(loginbean.role == 0) {
		//-------------显示列表------------
		sql = 'select p.*from privateinfos p, users u where u.role = 2 and u.id = p.id ';
		sequelize.query(sql).then(function(rs) {

			//		res.send(rs[0]);	
			res.render('admin/authList', {
				rs: rs[0]
			});

			console.log(rs[0]);

		});

		//-------------渲染界面------------
	} else {
		res.send('<script>alert("你无权访问此页面");location.href="/"</script>');
	} //script 的跳转

})
router.get('/authInfo', function(req, res, next) {
	id = req.query.id;
	PrivateInfoModel.findOne({
		where: {
			id: id
		}
	}).then(function(rs) {
		console.log(rs.realname);
		if(rs != null) {
			res.render('admin/authData', {
				rs: rs
			}); //读文件，发送给客户端

		} else {
			res.send("查无此人");
		}
		//	 console.log(rs);
		//	 res.send(rs);
	});

})

router.get('/applyPass', function(req, res, next) {
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	if(loginbean.role == 0) {
		//-------------显示列表------------
		id = req.query.id;
		sql = 'update users set role = 3,msgnum = msgnum+1 where id = ?';
		sequelize.query(sql, {
			replacements: [parseInt(id)],
			type: sequelize.QueryTypes.UPDATE
		}).then(function(rs) {
			sqlmsg = 'insert into msgs set sendid =?,toid=?,message = "您的VIP审核已通过，请进入空间发布您的租赁信息"';
			sequelize.query(sqlmsg, {
				replacements: [loginbean.id, id]
			}).then(
				function(rs) {
					res.redirect('./authList');
				});
			res.redirect('./authList');
			//	console.log("id:"+id);
		})
		//-------------渲染界面------------
	} else {
		res.send('<script>alert("你无权访问此页面");location.href="/"</script>');
	} //script 的跳转

})

router.post('/applyRefuse', function(req, res, next) {
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	if(loginbean.role == 0) {
		//-------------显示列表------------
		id = req.body.id;
		message = req.body.message;
		// sequelize.transaction().then(function (t) {
		//         return User.update({role:1,msgnum:sequelize.literal('msgnum+1')},{where:{'id':id}},{transaction:t}).then(function(rs){
		//	           msg={};
		//	           msg.sendid=loginbean.id;
		//	           msg.toid=id;
		//	           msg.message=message;
		//          return MsgModel.create(msg).then(function(rs){
		//           
		//            res.redirect('./authList');
		//          });
		//        }).then(t.commit.bind(t)).catch(function(err){
		//          t.rollback.bind(t);
		//          console.log(err);
		//         
		//        })
		//        
		//      });
		sql = 'update users set role = 4,msgnum = msgnum+1 where id = ?';
		sequelize.query(sql, {
			replacements: [parseInt(id)],
			type: sequelize.QueryTypes.UPDATE
		}).then(function(rs) {
			sqlmsg = 'insert into msgs set sendid =?,toid=?,message = ?';
			sequelize.query(sqlmsg, {
				replacements: [loginbean.id, id, message]
			}).then(
				function(rs) {
					res.redirect('./authList');
				});
			res.redirect('./authList');
			//	console.log("id:"+id);
		})
		//1.修改users表中role=1，msgnum+1
		//2.msgs中插入，sendid=loginbean.id，toid = id,message=
	} else {
		res.send('<script>alert("你无权访问此页面");location.href="/"</script>');
	} //script 的跳转
})
module.exports = router;