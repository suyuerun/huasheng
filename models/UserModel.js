var Sequelize = require('sequelize'); 
var sequelize =require('./ModelHeader')();
var Users = sequelize.define('users', {
	id: {
		type: Sequelize.BIGINT,
		primaryKey: true
	},
	email: Sequelize.STRING,
	pwd: Sequelize.STRING,
	nicheng: Sequelize.STRING,
	createtime: Sequelize.DATE,
	updtime: Sequelize.DATE,
	role: Sequelize.INTEGER,
	msgnum:Sequelize.INTEGER
}, {
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


//Users.create(user).then(function(rs) {
//	console.log('插入成功');
//	//console.log(rs);
//	console.log(user.id);
//	console.log(rs.id);
//	console.log('---------------------------------------------------');
//	console.log(rs);
//	console.log('---------------------------------------------------');
//}).catch(function(err) {
//	console.log('失败');
//	console.log(err.errors[0].path);
//});
module.exports = Users;