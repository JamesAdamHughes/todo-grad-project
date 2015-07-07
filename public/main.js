var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {

            var listItem = document.createElement("li");
            var itemContent = document.createElement("div");
            var itemText = document.createElement("p");
            var delButton = document.createElement("button");
            var updateButton = document.createElement("button");
            var completeButton = document.createElement("button");

            itemText.textContent = todo.title;
            delButton.textContent = "Delete Todo";
            delButton.className = "delete-button";
            updateButton.textContent = "Edit Todo";
            completeButton.textContent = "Complete"

            //remove todo item on click
            delButton.addEventListener("click", function(){
                var createRequest = new XMLHttpRequest();

                //send API request 
                createRequest.open("DELETE", "/api/todo/" + todo.id);
                createRequest.onload = function() {
                    if(this.status === 200){
                        console.log("DELETED SUCCESSFULLY");
                        reloadTodoList();
                    }
                    else{
                        error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
                    }
                };
                createRequest.send();
            }); 

            //change todo text on click
            updateButton.addEventListener("click", function(){

                //Create form to allow text to be changed
                var oldText = todo.title;
                var form = document.createElement("form");
                var input = document.createElement("input");
                var submit = document.createElement("input"); 

                input.value = todo.title;
                submit.type = "submit";

                submit.onclick = function(){
                    var createRequest = new XMLHttpRequest();
                    var updatedText = input.value;

                    //send API request 
                    createRequest.open("PUT", "/api/todo/" + todo.id);
                    createRequest.setRequestHeader("Content-type", "application/json");
                    createRequest.send(JSON.stringify({
                        title: updatedText
                    }));
                    createRequest.onload = function() {
                        if(this.status === 200){
                            console.log("UPDATED SUCCESSFULLY");
                            reloadTodoList();
                        }
                        else{
                            error.textContent = "Failed to update item. Server returned " + this.status + " - " + this.responseText;
                        }
                    };
                }

                //Add Form to DOM, remove exisiting components
                form.appendChild(input);
                form.appendChild(submit);

                listItem.removeChild(itemContent);
                listItem.appendChild(form);
            });    

            completeButton.addEventListener("click", function(){
                var createRequest = new XMLHttpRequest();
                createRequest.open("PUT", "/api/todo/" + todo.id + "?isComplete=true");
                createRequest.onload = function(){
                    if(this.status === 200){
                        console.log("MARKED COMPLETE");
                        reloadTodoList();
                    }
                    else{
                        console.log("UNSUCCESSFUL");
                    }
                }
                createRequest.send();
            });  

            if(todo.isComplete){
                itemText.className = "complete";
            }

            itemContent.appendChild(itemText);
            itemContent.appendChild(delButton);
            itemContent.appendChild(updateButton);
            itemContent.appendChild(completeButton);
            listItem.appendChild(itemContent);
            todoList.appendChild(listItem);
        });
    });
}



reloadTodoList();
