var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var PrivateInfoModel = require('../models/PrivateInfoModel');
var Users = require('../models/UserModel');
var Msg = require('../models/MsgModel');
var sequelize =require('../models/ModelHeader')();

/* GET home page. */
router.get('/', function(req, res, next) {
  loginbean = req.session.loginbean;
  res.locals.loginbean = loginbean;
  if(loginbean.role>0){
    //----------查询消息列表-------------------
    //Msg.findAll({where:{toid:loginbean.id}}).then(function(rs){
    sql = 'select m.*,u.nicheng  from msgs m,users u where m.toid=? and m.sendid=u.id';
    sequelize.query(sql,{replacements: [loginbean.id],type: sequelize.QueryTypes.QUERY}).then(function(rs){
      res.render('home/home', {rs:rs[0]});
    });
  }else{
    res.send('<script>alert("你无权访问此页面");location.href="/";</script>');
  }
 
});

router.post('/privateAuth', function(req, res, next) {
	var form = new formidable.IncomingForm();   //创建上传表单 
    form.encoding = 'utf-8';        //设置编辑 
    form.uploadDir = './public/images/privateauth/';     //设置上传目录 文件会自动保存在这里 
    form.keepExtensions = true;     //保留后缀 
    form.maxFieldsSize = 5 * 1024 * 1024 ;   //文件大小5M 
    form.parse(req, function (err, fields, files) { 
        if(err){ 
            console.log(err); 
            return;
        } 
       //res.send('rname='+fields.realname);
       //-----------入库------------
       loginbean = req.session.loginbean;
       fields.id = loginbean.id;
       fields.idphoto=files.idphoto.path.replace('public','');
       fields.userphoto=files.userphoto.path.replace('public','');
       fields.updtime=new Date();
       //------------启动事物----------------------------------
       sequelize.transaction().then(function (t) {
           return PrivateInfoModel.create(fields).then(function(rs){
            //------修改User表中的role为2------
            return Users.update({role:2},{where:{'id':loginbean.id}}).then(function(rs){
              //console.log(rs);
              loginbean.role=2;
              req.session.loginbean=loginbean;
              res.send('身份认证已提交,请耐心等待审核');
            });
          }).then(t.commit.bind(t)).catch(function(err){
            t.rollback.bind(t);
            console.log(err);
            if(err.errors[0].path=='PRIMARY'){
              res.send('你已经申请过');
            }else if(err.errors[0].path=='idcodeuniq')
            {
              res.send('身份证号已用过');
            }else if(err.errors[0].path=='prphoneuniq'){
              res.send('电话号码已用过');
            }else if(err.errors[0].path=='premailuniq'){
              res.send('此email已用过');
            }else{
              res.send('数据库错误,稍后再试');
            }
          })
          
        });
      //-----------------结束事物---------------------------------------
    })
})


router.get('/pubShop', function(req, res, next) {
  res.render('home/pubShop', {});
})

module.exports = router;