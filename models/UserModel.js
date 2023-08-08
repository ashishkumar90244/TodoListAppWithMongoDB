const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    userName:String,
    password:String,
    email:String,
    profilePic:String,
    todoContent:Array
});

const User = mongoose.model('User',userSchema);

module.exports = User;