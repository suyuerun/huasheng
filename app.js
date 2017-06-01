var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var port=process.env.PORT ||3000;
var index = require('./routes/index');
var users = require('./routes/users');
var home = require('./routes/home');
var admin = require('./routes/admin');
var msg = require('./routes/msg');
var search = require('./routes/search');
var app = express();
var fs=require('fs');

//静态资源服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

//配置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views','./views/index0');
//配置解析普通表单post请求体
app.use(bodyParser.urlencoded({extended:false}));

//加载路由系统

app.listen(3000, '127.0.0.1', () => {
    console.log('server is running at port 3000.');
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串    
cookie: { maxAge: 20 * 60 * 1000 }, //cookie生存周期20*60秒    
resave: true,  //cookie之间的请求规则,假设每次登陆，就算会话存在也重新保存一次    
saveUninitialized: true //强制保存未初始化的会话到存储器    
}));  //这些是写在app.js里面的 
app.use(express.static(path.join(__dirname, 'public')));

//------------拦截器------------
var openPage =['/','/aa','/users/zhuce','/users/login','/users/logout','/search/goods','/search/shop'];
app.use(function(req,res,next){
	var url = req.originalUrl;
	url = (url.split('?'))[0];
	if(openPage.indexOf(url)>-1){
		next();
	}else{
		if(req.session.loginbean){
			next();
		}else{
			res.redirect('/');
		}
	}
	
});
app.use('/', index);
app.use('/users', users);

app.use('/home', home);
app.use('/admin', admin);
app.use('/msg', msg);
app.use('/search', search);
app.use(function(req,res,next){
	var url = req.originalUrl;
	console.log('你访问的是：'+url);
	next();
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
