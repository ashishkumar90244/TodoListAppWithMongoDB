//const { response } = require("express");

const btn = document.getElementById('submitTodo');
const userInputNode = document.getElementById('userInput');
const prioritySelctorNode = document.getElementById('prioritySelector');
const todoItemNode = document.getElementById('todo-item');
const form = document.getElementById('form');
let count = 0;

btn.addEventListener("click" ,function(event){
    event.preventDefault();
    const todoContent = userInputNode.value;
    const priority = prioritySelctorNode.value;
   // console.log(todoContent);


    if(!todoContent || !priority){
        alert('Enter the content ');
        return;
    }

    

    // const data = {
    //     todoContent:todoContent,
    //     priority:priority,
    //     status:'pending'

    // }

    //const formElement = event.target;
    const formData = new FormData(form);

    // JSON data to be sent along with the image
    

    // Convert the JSON data to a Blob and append it to the FormData
    // const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    // formData.append('data', jsonBlob, 'data.json');

    fetch("/todo",{method:"POST",
        
        body:formData
    })
    .then(function(res){
        if(res.status===401){
          window.location.href='/login'
          return;
        }
        if(res.status===500)
          console.log("error");
        userInputNode.value='';
        return res.json();
    })
    .then(function(data){
        console.log(data);
        showTodoInUI({
            todoContent:todoContent,
            priority:priority,
            status:"pending",
            taskImage:data.filename
        })
    })
    
    .catch(function(err){
        console.log(err);
    })
})

function showTodoInUI(todo){
    
    const rowNode = document.createElement('tr');
    const todotextNode1 = document.createElement('td');
    todotextNode1.id="col";
    const todotextNode3 = document.createElement('td');
    const img=document.createElement('img');
    img.src=todo.taskImage;
    img.height='30';
    img.width='30';
    todotextNode3.appendChild(img);
    const todotextNode2 = document.createElement('td');
    const anchor = document.createElement('button');
    //anchor.innerText = "x";
    //anchor.style.color = "black";
    const del = document.createElement('img');
    del.src='del.png';
    del.height='20';
    del.width='20';
    anchor.appendChild(del);
    anchor.style.marginLeft = "30px"
  // anchor.type = "checkbox";
    todotextNode1.innerText = todo.todoContent;
    
    //console.log(todotextNode1)
    todotextNode1.style.textAlign = "center";
    

    
    
    anchor.addEventListener('click',function(){
        fetch("/remove-data",{method:"POST",
        headers:{"content-Type":"application/json"},
        body:JSON.stringify(todo),
        
    })
    .then(function(res){
        if(res.statusCode === 401)
        {
            window.location.href="/login"
            return;
        }
        res.json().then(function(todos){

            //  anchor.disabled = true;
            //  todotextNode1.style.textDecoration = "line-through";
            rowNode.remove();
                
            }).catch(function(err){
                console.log(err);
            })
        });
    })
    todotextNode2.style.textAlign = "center";
    if(count%2==0){
        rowNode.style.backgroundColor='rgb(100,100,100)'
        
    }
    else{
        rowNode.style.backgroundColor='rgb(160,160,160)'
    }
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.width='18px';
    checkbox.style.height='18px';
    if(todo.status === "accepted"){
        
        checkbox.checked = true;
            todotextNode1.style.textDecoration = "line-through";
    }
    checkbox.addEventListener('change',function(){
        let checked;
        if(checkbox.checked)
           checked="pending";
        else
           checked = "acceptd";
        fetch("/update-status",{method:"POST",
        
        headers:{"content-Type":"application/json"},
        body:JSON.stringify({
            todoContent:todo.todoContent,
            priority:todo.priority,
            status:checked
        })
        
    })
    .then(function(res){
        res.json().then(function(todos){

            if(todotextNode1.style.textDecoration === "line-through")
                todotextNode1.style.textDecoration = "none";
            else
                todotextNode1.style.textDecoration = "line-through";
            //todoTextNode.remove();
                
            }).catch(function(err){
                console.log(err);
            })
        });
    })

    count++;
    todotextNode2.appendChild(checkbox)
    todotextNode2.appendChild(anchor);
    rowNode.appendChild(todotextNode1);
    rowNode.appendChild(todotextNode3);
    rowNode.appendChild(todotextNode2);
    todoItemNode.appendChild(rowNode);

}

fetch('/todo-data').then(function(res){
    if(res.status === 401){
        window.location.href = '/login';
        return ;
    }
    res.json().then(function(todos){
        //todos=JSON.parse(todos);
        //console.log(Array.isArray(todos))
        todos.forEach((todo) => {
            showTodoInUI(todo);
            
        });
    });
});