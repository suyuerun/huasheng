var Sequelize = require('sequelize');
var sequelize = require('./ModelHeader')();
var MarksModel = sequelize.define('marks', {
	id: {
		type: Sequelize.BIGINT,
		primaryKey: true
	},
		title: Sequelize.STRING,
		content: Sequelize.STRING,
		position: Sequelize.STRING,
		createtime: Sequelize.DATE,

}, {
	timestamps: false,
	//paranoid: true  //获取不到id的返回值
});

module.exports = MarksModel;