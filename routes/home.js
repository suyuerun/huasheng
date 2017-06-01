var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var PrivateInfoModel = require('../models/PrivateInfoModel');
var Users = require('../models/UserModel');
var sequelize = require('../models/ModelHeader')();
var MsgModel = require('../models/MsgModel');
var GoodsModel = require('../models/GoodsModel');
var ShopModel = require('../models/ShopModel');
var MarksModel = require('../models/MarksModel');
/* GET home page. */
router.get('/', function(req, res, next) {
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	if(loginbean.role > 0) {
		cpage = 1;
		if(req.query.cpage) {
			cpage = req.query.cpage;
		}
		pageItem = 3; //每页显示条目数
		startPoint = (cpage - 1) * pageItem; //查询的起点位置
		rowCount = 0;
		sumPage = 0;

		//--------查询消息列表----------
		//MsgModel.findAll({where:{toid:loginbean.id}}).then(function(rs){
		sqlCount = 'select count(*) as count from msgs where toid =?';
		sequelize.query(sqlCount, {
			replacements: [loginbean.id],
			type: sequelize.QueryTypes.QUERY
		}).then(function(rs) {
			rsjson = JSON.parse(JSON.stringify(rs[0]));
			rowCount = rsjson[0].count;
			sumPage = Math.ceil(rowCount / pageItem); //Math.floor,Math.round,Math.ceil
			sql = 'select m.*,u.nicheng from msgs m, users u where m.toid =? and m.sendid=u.id limit ?,?';
			sequelize.query(sql, {
				replacements: [loginbean.id, startPoint, pageItem],
				type: sequelize.QueryTypes.QUERY
			}).then(function(rs) {
				res.render('home/home', {
					rs: rs[0],
					cpage: cpage,
					rowCount: rowCount,
					sumPage: sumPage
				});
			});
		})

	} else {
		res.send('<script>alert("你无权访问此页面");location.href="/";</script>');
	}

});

router.post('/pass', function(req, res, next) {

	Users.update({
		role: 3
	}, {
		where: {
			'id': loginbean.id
		}
	}).then(function(rs) {
		//console.log(rs);
		loginbean.role = 2;
		req.session.loginbean = loginbean;
		//     res.send('身份认证已提交,请耐心等待审核');
		res.redirect('/');
	});
});
router.post('/privateAuth', function(req, res, next) {
	var form = new formidable.IncomingForm(); //创建上传表单 
	form.encoding = 'utf-8'; //设置编辑 
	form.uploadDir = './public/images/privateauth/'; //设置上传目录 文件会自动保存在这里 
	form.keepExtensions = true; //保留后缀 
	form.maxFieldsSize = 5 * 1024 * 1024; //文件大小5M 
	form.parse(req, function(err, fields, files) {
		if(err) {
			console.log(err);
			return;
		}
		//res.send('rname='+fields.realname);
		//-----------入库------------
		loginbean = req.session.loginbean;
		fields.id = loginbean.id;
		fields.idphoto = files.idphoto.path.replace('public', '');
		fields.userphoto = files.userphoto.path.replace('public', '');
		fields.updtime = new Date();
		//------------启动事物----------------------------------
		sequelize.transaction().then(function(t) {
			return PrivateInfoModel.create(fields).then(function(rs) {
				//------修改User表中的role为2------
				return Users.update({
					role: 2
				}, {
					where: {
						'id': loginbean.id
					}
				}).then(function(rs) {
					//console.log(rs);
					loginbean.role = 2;
					req.session.loginbean = loginbean;
					res.send('身份认证已提交,请耐心等待审核');
					res.redirect('/');
				});
			}).then(t.commit.bind(t)).catch(function(err) {
				t.rollback.bind(t);
				console.log(err);
				if(err.errors[0].path == 'PRIMARY') {
					res.send('你已经申请过');
				} else if(err.errors[0].path == 'idcodeuniq') {
					res.send('身份证号已用过');
				} else if(err.errors[0].path == 'prphoneuniq') {
					res.send('电话号码已用过');
				} else if(err.errors[0].path == 'premailuniq') {
					res.send('此email已用过');
				} else {
					res.send('数据库错误,稍后再试');
				}
			})

		});
		//-----------------结束事物---------------------------------------
	})
})

/*
 	消息查看操作(查询msgnum并显示在右侧)
 	1.点击消息，召唤右侧网页，读取每条msgs里的属于自己id的消息，
 	2.点击未读，未读变成已读，在msgs表里面通过id来删除每条msg
 	3.
 * */

router.get('/test', function(req, res, next) {
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	//	接参，
	test = req.query.aurl;
	//	用昵称寻找对应Uid,
	sql = 'select * from users where ? ';
	sequelize.query(sql, {
		replacements: [test]
	}).then(function(rs) {
		console.log(rs);
		res.send('1');

	});

});
router.get('/pubShop', function(req, res, next) {
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	//	接参，
	shopname = req.body.shopName;
	info = req.body.info;
	//	用昵称寻找对应Uid,

	sqltype = 'select * from shoptypes';

	sequelize.query(sqltype, {

	}).then(function(rss) {
		console.log(rss);
		res.render('home/pubShop', {
			rss: rss[0],
		});
	})

})
router.post('/pubShop', function(req, res, next) {
	var form = new formidable.IncomingForm(); //创建上传表单 
	form.encoding = 'utf-8'; //设置编辑 
	form.uploadDir = './public/images/shop/'; //设置上传目录 文件会自动保存在这里 
	form.keepExtensions = true; //保留后缀 
	form.maxFieldsSize = 5 * 1024 * 1024; //文件大小5M 
	form.parse(req, function(err, fields, files) {
		if(err) {
			console.log(err);
			return;
		}
		//res.send('rname='+fields.realname);
		//-----------入库------------
		loginbean = req.session.loginbean;
		fields.closereason = req.body.closereason;
		console.log("---------------------");
		console.log(fields.closereason);
		console.log("---------------------");
		fields.uid = loginbean.id;
		fields.photourl = files.photourl.path.replace('public', '');
		fields.updtime = new Date();
		//------------启动事物----------------------------------
		console.log('1');
		sequelize.transaction().then(function(t) {
			return ShopModel.create(fields).then(function(rs) {
				console.log(rs);
				//------修改User表中的role为2------
				return Users.update({
					role: 4
				}, {
					where: {
						'id': loginbean.id
					}
				}).then(function(rs) {
					//console.log(rs);
					loginbean.role = 4;
					req.session.loginbean = loginbean;
					console.log(rs);
					res.redirect('./pubShop');

				});
			}).then(t.commit.bind(t)).catch(function(err) {
				t.rollback.bind(t);
				console.log(err);
				res.send('店铺发布失败，请重新发布');
			})

		});
		//-----------------结束事物---------------------------------------
	})
})
router.get('/shopmanage', function(req, res, next) {
	//判定权限
	//查询出店铺位置信息
	//用店铺信息渲染地图界面
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	shopid = req.body.shopid;
	cpage = 1;
	if(req.query.cpage) {
		cpage = req.query.cpage;
	}
	pageItem = 3; //每页显示条目数
	startPoint = (cpage - 1) * pageItem; //查询的起点位置
	rowCount = 0;
	sumPage = 0;

	//	接参，
	if(loginbean.role == 4) {

		sql = 'select id,shopname,shopintr,lng,lat ,liveflag from shops where uid = ?';
		sequelize.query(sql, {
			replacements: [loginbean.id]
		}).then(function(rs) {
			sqltype = 'select * from shoptypes';

			sequelize.query(sqltype, {

			}).then(function(rss) {
				if(rs == null) {
					res.send('0');
					console.log('1');

				}

				//--------查询消息列表----------
				//MsgModel.findAll({where:{toid:loginbean.id}}).then(function(rs){
				sqlCount = 'select count(*) as count from goods where uid =?';
				sequelize.query(sqlCount, {
					replacements: [loginbean.id],
					type: sequelize.QueryTypes.QUERY
				}).then(function(prs) {
					rsjson = JSON.parse(JSON.stringify(prs[0]));
					rowCount = rsjson[0].count;
					sumPage = Math.ceil(rowCount / pageItem); //Math.floor,Math.round,Math.ceil
					sql = 'select *from goods where uid =?  limit ?,?';
					sequelize.query(sql, {
						replacements: [loginbean.id, startPoint, pageItem],
						type: sequelize.QueryTypes.QUERY
					}).then(function(grs) {
						res.render('home/shopmanage', {
							grs: grs[0],
							cpage: cpage,
							rowCount: rowCount,
							sumPage: sumPage,
							rss: rss[0],
							rs: rs[0]

						});
					});
				})

			});

		})

	} else {
		res.redirect('/');
	}
})
//店铺插库
router.post('/stopshop', function(req, res, next) {
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	//	接参，

	closeReason = req.body.closeReason;
	liveflag = req.body.choose;
	console.log(liveflag);
	//	用昵称寻找对应Uid,
	sql = 'update shops set closereason =?,liveflag = ? where uid= ?';
	sequelize.query(sql, {
		replacements: [closeReason, liveflag, loginbean.id]
	}).then(function(rs) {
		res.redirect('./');
	});

});
router.post('/pubgoods', function(req, res, next) {
	var form = new formidable.IncomingForm(); //创建上传表单 
	form.encoding = 'utf-8'; //设置编辑 
	form.uploadDir = './public/images/goods/'; //设置上传目录 文件会自动保存在这里 
	form.keepExtensions = true; //保留后缀 
	form.maxFieldsSize = 5 * 1024 * 1024; //文件大小5M 
	form.parse(req, function(err, fields, files) {
		if(err) {
			console.log(err);
			return;
		}
		//-----------入库------------
		loginbean = req.session.loginbean;
		fields.uid = loginbean.id;
		fields.goodsimg = files.goodsimg.path.replace('public', '');
		fields.goodsintro = fields.editorValue;
		fields.keywords = fields.keywords;
		console.log('----------------------');
		console.log(fields.editorValue);
		console.log('----------------------');
		fields.createtime = new Date();
		fields.updtime = new Date();

		//------------启动事物----------------------------------
		GoodsModel.create(fields).then(function(rs) {
			res.redirect('./');
		}).catch(function(err) {
			console.log(err);
			console.log('创建失败');
		})

		//-----------------结束事物---------------------------------------
	})
})

router.post('/revise', function(req, res, next) {
	var form = new formidable.IncomingForm(); //创建上传表单 
	// form.encoding = 'utf-8';        //设置编辑 
	form.uploadDir = './public/images/shop/'; //设置上传目录 文件会自动保存在这里 
	form.keepExtensions = true; //保留后缀 
	form.maxFieldsSize = 5 * 1024 * 1024; //文件大小5M 
	form.parse(req, function(err, fields, files) {
		if(err) {
			console.log(err);
			console.log('1');
			return;
		}
		//res.send('rname='+fields.realname);
		//-----------入库------------
		loginbean = req.session.loginbean;
		fields.uid = loginbean.id;

		fields.photourl = files.photourl.path.replace('public', '');
		console.log('-----------------------' + fields.photourl);
		//------------启动事物----------------------------------
		GoodsModel.update(fields, {
			where: {
				'uid': loginbean.id
			}
		}).then(function(rs) {

			//------修改User表中的role为4------

			res.redirect('./shopmanage');

			console.log(err);
		})
		//-----------------结束事物------------------------
	});
});
router.get('/sercid', function(req, res, next) {
	goodsid = req.query.id;
	GoodsModel.findOne({
		where: {
			id: goodsid
		}
	}).then(function(goodsInfo) {
		res.send(goodsInfo);
	});

})

router.post('/updgoods', function(req, res, next) {
	var form = new formidable.IncomingForm(); //创建上传表单 
	form.encoding = 'utf-8'; //设置编辑 
	form.uploadDir = './public/images/goods/'; //设置上传目录 文件会自动保存在这里 
	form.keepExtensions = true; //保留后缀 
	form.maxFieldsSize = 5 * 1024 * 1024; //文件大小5M 
	form.parse(req, function(err, fields, files) {
		if(err) {
			console.log(err);
			return;
		}
		//-----------入库------------
		loginbean = req.session.loginbean;
		fields.uid = loginbean.id;
		if(files.goodsimg.name) {
			fields.goodsimg = files.goodsimg.path.replace('public', '');
		} else {
			fields.goodsimg = fields.oldGoodsImg;
			console.log(fields.goodsimg);
		}
		fields.goodsintro = fields.editorValue;
		fields.keywords = fields.keywords;
		console.log('----------------------');
		console.log(fields.editorValue);
		console.log('----------------------');
		fields.createtime = new Date();
		fields.updtime = new Date();

		//------------启动事物----------------------------------
		GoodsModel.update(fields, {
			where: {
				id: goodsid
			}
		}).then(function(rs) {
			res.redirect('./');
		}).catch(function(err) {
			console.log(err);
			console.log('修改失败');
		})

		//-----------------结束事物---------------------------------------
	})
})

//-----------------------------删除商品信息----------------------------------------
router.get('/deleteGoods', function(req, res, next) {
	loginbean = req.session.loginbean;
	res.locals.loginbean = loginbean;
	id = req.query.id;
	//---------------------sequelize写法 ---------------------------
	GoodsModel.destroy({
		'where': {
			'id': id
		}
	}).then(function(rs) {
		//将表内对应id的记录删除  
		console.log('删除成功');

		if(loginbean.role > 0) { //判断登录的角色，跳转到相应的页面
			res.redirect('/home/shopmanage');
		} else {
			res.redirect('/admin');
		}
	})

})
module.exports = router;