var Sequelize = require('sequelize'); 
var sequelize = new Sequelize('huasheng', 'root', '1234', {
    host: '127.0.0.1',
    dialect: 'mysql'
});

var Users = sequelize.define('users', {
	id: {type:Sequelize.BIGINT,primaryKey: true},
    email: Sequelize.STRING,
    pwd: Sequelize.STRING,
    nicheng: Sequelize.STRING,
    createtime:Sequelize.DATE,
    updtime:Sequelize.DATE,
    role:Sequelize.INTEGER
},{
		timestamps: false,
		//paranoid: true  //获取不到id的返回值
	});

/*
var user = {
	email:'aa',
	pwd:'aa',
	nicheng:'aa',
	role:1
};
*/
var user = new Object();
user.email='bb';
user.pwd='bb';
user.nicheng='bb';
user.role=1;


Users.create(user).then(function(rs){
	console.log('插入成功');
	//console.log(rs);
	console.log(user.id);
	console.log(rs.id);
	console.log('---------------------------------------------------');
	console.log(rs);
	console.log('---------------------------------------------------');
}).catch(function(err){
	console.log('失败');
	console.log(err.errors[0].path);
})