var express = require('express');
var router = express.Router();
var sequelize = require('../models/ModelHeader')();
/* GET home page. */

router.post('/sendNew', function(req, res, next) {
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	//	接参，
	nicheng = req.body.nicheng;
	arr = nicheng.split(';');
	len = arr.length;

	sql = 'select id from users where nicheng = ?';
	sqlmsg = 'insert into msgs set sendid =?,toid=?,message = ?';
	sqlupd = 'update users set msgnum = msgnum+1 where id = ?';

	flag = 0;
	for(i = 0; i < len; i++) {
		sequelize.query(sql, {
			replacements: [arr[i]]
		}).then(function(rs) {
			rsjson = JSON.parse(JSON.stringify(rs[0]));
			if(rsjson.length == 0) {
				flag++;
				return;
			} //rowdatapacke转json
			//			toid = rsjson[0].id;
			console.log(toid);
			//	然后插入消息表

			//		res.send('1');
			sequelize.query(sqlmsg, {
				replacements: [loginbean.id, rsjson[0].id, req.body.message]
			}).then(
				function(rs) {

					sequelize.query(sqlupd, {
						replacements: [toid]
					}).then(
						function(rs) {
							flag++;
							if(flag == len) {
								res.send('1');
							}

						})
				});

		});
	}

	//	更新user表msgnum + 1
	//	返回客户端， 客户端收到后弹成功， 关闭模态框

});

router.post('/sendRep', function(req, res, next) {
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	//	接参，
	nicheng = req.body.nicheng1;
	console.log(nicheng);
	//	用昵称寻找对应Uid,
	arr = nicheng.split(';');
	len = arr.length;
	console.log(arr.toString());
	sql = 'select id from users where nicheng = ?';
	sqlmsg = 'insert into msgs set sendid =?,toid=?,message = ?';
	sqlupd = 'update users set msgnum = msgnum+1 where id = ?';

	flag = 0;
	var exec = function(i) {
		toids = {}
		return function() {
			console.log(arr[i]);
			sequelize.query(sql, {
				replacements: [arr[i]]
			}).then(function(rs) {
				rsjson = JSON.parse(JSON.stringify(rs[0]));
				if(rsjson.length == 0) {
					flag++;
					return;
				} //rowdatapacke转json
				toids[i] = rsjson[0].id;
				//			console.log(toid);
				//	然后插入消息表

				//		res.send('1');
				sequelize.query(sqlmsg, {
					replacements: [loginbean.id, toids[i], req.body.message1]
				}).then(
					function(rs) {

						sequelize.query(sqlupd, {
							replacements: [toids[i]]
						}).then(
							function(rs) {
								flag++;
								if(flag == len) {
									res.send('1');
								}

							})
					});

			})
		}
	}

	for(i = 0; i < len; i++) {
		fun = exec(i);
		fun();
	}

	//	更新user表msgnum + 1
	//	返回客户端， 客户端收到后弹成功， 关闭模态框

});

module.exports = router;