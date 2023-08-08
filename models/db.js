const mongoose = require('mongoose');

module.exports.init =async function(){
    await mongoose.connect("mongodb+srv://ashish34:wgP0eU5RrKrBsDkG@cluster0.ziqj2sp.mongodb.net/superCodersGlobal?retryWrites=true&w=majority");
}