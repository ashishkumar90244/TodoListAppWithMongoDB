const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');

const uuid = require('uuid');

const db = require('./models/db');

const User = require('./models/UserModel');

const multer = require('multer');
const upload = multer({dest:'upload/'});
const app = express();

app.use(express.static('upload'));

app.use(upload.single('taskImage'));


const session = require('express-session');
//const { request } = require('http');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/todoViews');
app.use(session({
    secret:'eowaitb',
    resave:false,
    saveUninitialized: false

}));


db.init()
.then(function(){
    console.log("db connected");

})
.catch(function(err){
    console.log("err");
})

app.get('/logout', function(req, res){
    req.session.destroy(function(err, session){
        if(err) res.send(err);
        else{
            console.log('session is destroying');
            res.redirect('/login');
        }
    })
})

app.get('/',function(req,res){
    if(!req.session.username){
        res.redirect('/login');
        return;
    }
    //console.log(req.session.profilePic);
    res.render('index',{username:req.session.username,profilePic:req.session.profilePic});
});

//app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.post('/todo',async function(req,res){
    console.log("welcome");
    if(!req.session.username){
        res.status(401).send('login required');
        return;
    }

    const todoContent = {
        todoContent:req.body.taskName,
        priority:req.body.priority,
        status:'pending',
        taskImage:req.file.filename
    };
    // res.json({filename:taskImage});
    // return
    
       const update = { $push: { todoContent: todoContent} };
    try{
        await User.updateOne({userName:req.session.username},update)
        
        res.status(200).json({filename:req.file.filename});
       
    }
        catch(err){
            
            res.status(500).json({message:"Internal Server Error1"})
        }
  // readALLTodos(todoContent,writeTodo,req,res);
    
//     fs.readFile('./treasure.txt',"utf-8",(err,data)=>{
//         if(err){
//             console.log(err);
//             return ;
//         }
//         if(data.length==0){
//             data = "[]";
//         }
//         try{
//             data = JSON.parse(data);
//             data.push(req.body);

//             fs.writeFile("./treasure.txt",JSON.stringify(data),(err)=>{
//                 if(err){
//                     console.log(err);
//                     return;
//                 }
//                 else{
//                     res.status(200).json("todo saved successfully");
//                 }
//             })
//         }
//         catch{
//             res.status(500).json({message:'Internal sever erro'});
//             return;
//         }
        
        
//     })
})

app.get('/about',function(req,res){
    if(!req.session.username){
        res.redirect('/login');
        return;
    }
    res.render('about',{username:req.session.username,profilePic:req.session.profilePic});
})

app.get('/contact',function(req,res){
    if(!req.session.username){
        res.redirect('/login');
        return;
    }
    res.render('contact',{username:req.session.username,profilePic:req.session.profilePic});
})
app.get('/todo-data',function(req,res){
    if(!req.session.username){
        res.status(401).send("login is required");
        return;
    }

    User.findOne({userName:req.session.username})
    .then(function(user){
        res.status(200).json(user.todoContent);
    })
    .catch(function(err){
        res.status(500).json(err);
    })
    //res.sendFile(__dirname+"/todoViews/todo.html");
    // fs.readFile('./treasure.txt',"utf-8",(err,data)=>{
    //     if(err){
    //         res.status(500).json(err);
    //         return;
    //     }
    //     if(!data)
    //       data="{}";
    //     data = JSON.parse(data);
    //     if(!(req.session.username in data))
    //         res.status(200).json("[]");
    //     else 
    //         res.status(200).json(JSON.stringify(data[req.session.username]));

    // })
})


app.get('/todo',function(req,res){
    if(!req.session.username){
        res.redirect('/login');
        return;
    }
    res.render('todo',{username:req.session.username,profilePic:req.session.profilePic});
})
app.get('/public/script.js',function(req,res){
   //res.writeHead({'content-Type': 'application/javascript'})
   res.sendFile(__dirname+'/public/script.js')
    
}) 

app.post('/remove-data',function(req,res){
    if(!req.session.username){
        res.status(401).send("login required");
        return;
    }
    const update = {$pull:{ todoContent:req.body}};
    User.updateOne({userName:req.session.username},update)
    .then(function(response){
        res.status(200).json(JSON.stringify("removed"));
        fs.unlink(__dirname+`/upload/${req.body.taskImage}`,(error)=>{
            if(error){
                res.status(500).send("internal sever error")
                return ;
            }
        })
    })
    .catch(function(err){
        res.status(500).send(err);
    })
    // fs.readFile('./treasure.txt',"utf-8",function(err,data){
    //     if(err){
    //         res.status(500).json("internal error");
    //         return;
    //     }
    //     if(data.length===0)
    //     {
    //         res.status(500).json("the file is empty");
    //         return;
    //     }
    //     const todo = req.body;
    //     //console.log(todo)
    //     data = JSON.parse(data);
    //     let todoArray = data[req.session.username];
    //     let updated_data = [];
    //     //let removedTodo ;
    //     for(let i =0;i<todoArray.length;i++){
    //         if(todoArray[i].todoContent!=todo.todoContent)
    //             updated_data.push(todoArray[i]);
            
    //     }
    //     data[req.session.username] = updated_data;
    //     //console.log(todo.a)
        
    //     fs.writeFile("./treasure.txt",JSON.stringify(data),(err)=>{
    //         if(err){
    //             res.status(500).json("Internal error");
    //             return;
    //         }
            
    //         fs.unlink(`./upload/${todo.taskImage}`,(err)=>{
    //             if(err)
    //               res.status(500).send(err);
    //             else
    //              res.status(200).json(JSON.stringify("removed"));
    //         });
            
    //     })
    // })
})
app.post('/update-status',function(req,res){
    let status;
    if(req.body.status === "pending")
       status = "accepted";
    else
        status = "pending";

    User.updateOne({userName:req.session.username,'todoContent.todoContent':req.body.todoContent},{$set:{'todoContent.$.status':status}})
    .then(function(result){
        res.status(200).json(req.body);
    })
    .catch(function(err){
        res.status(500).json({error:"internal errror"})
    })
    // fs.readFile('./treasure.txt','utf-8',(err,data)=>{
    //     if(err){
    //         res.status(500).json("Internal server error");
    //         return ;
    //     }
    //     const todo = req.body;
    //     //console.log(todo);
    //     data = JSON.parse(data);
    //     let todoArray = data[req.session.username];
    //     let status;
    //     if(todo.status === "pending")
    //         status = "accepted";
    //     else
    //        status = "pending";

    //     let updated_data=[];
    //     for(let i=0;i<todoArray.length;i++){
    //         if(todoArray[i].todoContent===todo.todoContent){
    //             updated_data.push({
    //                 todoContent:todoArray[i].todoContent,
    //                 priority:todoArray[i].priority,
    //                 status:status,
    //                 taskImage:todoArray[i].taskImage
    //             })
    //         }
    //         else{
    //             updated_data.push(todoArray[i]);
    //         }
    //     }
    //     console.log(updated_data,"updated");
    //     data[req.session.username] = updated_data;
    //     fs.writeFile('./treasure.txt',JSON.stringify(data),(err)=>{
    //         if(err){
    //             res.status(500).json("Internal server error");
    //             return ;
    //         }
    //         res.status(200).send(JSON.stringify(updated_data));
    //     })

    // })

})
app.get('/login', function(req, res){
    res.sendFile(__dirname+'/public/login.html');
});

app.post('/submit', function(req, res){
    const username = req.body.user;
    const password = req.body.password;
    //console.log(user);
    User.findOne({userName:username, password:password})
    .then(function(user){
        if(user){
            req.session.username=username;
            req.session.profilePic=user.profilePic;
            res.status(200).send("success");
            return ;
        }
        res.status(401).send("invalid password or username");return;
    })
    // fs.readFile('./userBase/users.js', 'utf-8', function(err,data) {
    //     if(err) return res.status(500).send(err);
    //     if(!data)  {res.status(401).send("invalid password or username");return;}
    //     data = JSON.parse(data);
    //     console.log(user);
    //     if(!(user in data) || data[user].password!==password){
    //         res.status(401).send("invalid password or username");
    //         return;
    //     }
    //     req.session.username=user;
    //     req.session.password=password;
    //     req.session.profilePic=data[user].profilePic;
    //     res.status(200).send("success");

    // })


})
app.get('/signup', function(req, res){
    res.render('signup',{error:null});
});

app.post('/register',async function(req, res){
    //console.log(req.file);
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    try{
        const existingUser = await User.findOne({userName: username})
        //console.log(existingUser.userName);
        if(existingUser){
            res.render('signup',{error:"choose another username"});
            return;
        }
        const existingEmail = await User.findOne({email:email});
        //console.log(existingEmail.email);
        if(existingEmail){
            res.render('signup',{error:"choose another email"});
            return;
        }
        await User.create({
            userName:req.body.username,
            password:req.body.password,
            email:req.body.email,
            profilePic:req.file.filename,
            todoContent:[]
        })
        res.redirect('/login');
    }
    catch(err){
        res.status(500).send(err);
    }
    
//     fs.readFile('./userBase/users.js',"utf-8",function(err,data){
//         if(err) res.status(500).send(err);
//         if(!data)
//           data = "{}";
//           data = JSON.parse(data);
//         if(username  in data){
//             res.render('signup',{error:"choose another username"});
//             return;
//         }
//         for(let user in data){
//            // console.log();
//             if(data[user].email===email){
//                 res.render('signup',{error:"choose another email"});
//                 return;
//             }
//         }
        
        

        

//         fs.writeFile('./userBase/users.js',JSON.stringify(data),function(err){
//             if(err)
//             res.status(500).send("internal error");
//             else
//               res.redirect('/login');
//         })
//     });
    
});

app.listen(3000,()=>{
    console.log('listening at the port 3000');
})

function readALLTodos (todo,callback,req,res) {

    fs.readFile("./treasure.txt", "utf-8", function (err, data) {
    
    
    if (err) {
    
    callback(err,data,res);
    
    return;
    
    }
    if(!todo){
        res.status(200).json(JSON.stringify(data));
        return ;
    }

    
    if (data.length==0) {data = "{}"; 
    
    }
    
    try {
    
    data = JSON.parse(data); 
    if(!(req.session.username in data))
        data[req.session.username]  = [];
    data[req.session.username].push(todo);
    //console.log('res ',res);
    callback(null, data,res,todo.taskImage) } catch (err) { callback(err,data,res);
    }
    })
}

function writeTodo(err,data,res,taskImage){
    if(err){
        res.status(500).json({message:"Internal server error"});
        return ;
    }
    fs.writeFile('./treasure.txt',JSON.stringify(data),(err)=>{
        if(err){
            res.status(500).json({message:"Internal server error"});
            return;
        }
        res.status(200).json({filename:taskImage});
    })

}



