var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");
var title = document.getElementById("page-title");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    makeHttpRequest("POST", "/api/todo/", 201,
        "create item", {title: title}, callback);
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

    var completeItems = 0;
    var numItems = 0;

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
            itemText.setAttribute("id", "todo-text");
            delButton.textContent = "Delete Todo";
            // delButton.className = "delete-button";
            delButton.setAttribute("id", "delete-button");
            updateButton.textContent = "Edit Todo";
            updateButton.setAttribute("id", "update-button");
            completeButton.textContent = "Complete";
            completeButton.setAttribute("id", "complete-button");

            //remove todo item on click
            delButton.addEventListener("click", function() {
                makeHttpRequest("DELETE", "/api/todo/" + todo.id, 200,
                        "delete item", {}, reloadTodoList);
            });

            //change todo text on click
            updateButton.addEventListener("click", function() {

                //Create form to allow text to be changed
                var oldText = todo.title;
                var form = document.createElement("form");
                var input = document.createElement("input");
                var submit = document.createElement("input");

                input.setAttribute("id", "update-input");
                submit.setAttribute("id", "update-submit");

                input.value = todo.title;
                submit.type = "submit";

                //submit an updated todo
                submit.addEventListener("click", function() {
                    var updatedText = input.value;

                    makeHttpRequest("PUT", "/api/todo/" + todo.id, 200,
                        "update item", {title: updatedText}, reloadTodoList);
                });

                //Add Form to DOM, remove exisiting components
                form.appendChild(input);
                form.appendChild(submit);

                listItem.removeChild(itemContent);
                listItem.appendChild(form);
            });

            //complete a todo
            completeButton.addEventListener("click", function() {
                var url = "/api/todo/" + todo.id + "?isComplete=true";
                makeHttpRequest("PUT", url, 200, "complete item", {}, reloadTodoList);
            });

            //add csss class to show item complete
            if (todo.isComplete) {
                itemText.className = "complete";
                completeItems++;
            }
            numItems++;

            //add todo elements to the DOM
            itemContent.appendChild(itemText);
            itemContent.appendChild(delButton);
            itemContent.appendChild(updateButton);
            itemContent.appendChild(completeButton);
            listItem.appendChild(itemContent);
            todoList.appendChild(listItem);

            countLabel.innerHTML = completeItems + "/" + numItems + " Todos Complete";
        });
    });
}

//delete all todo items that have been marked as complete
function deleteAllComplete() {
    var toDelete = [];

    //get all complete items
    getTodoList(function(todos) {
        todos.forEach(function(todo) {
            if (todo.isComplete === true) {
                toDelete.push(todo.id);
            }
        });

        makeHttpRequest("POST", "/api/todo/batch", 200,
        "delete item", {ids : toDelete}, reloadTodoList);
    });
}

//Makes an http request to the server
function makeHttpRequest(type, url, statusCode, errorMsg, json, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open(type, url);
    createRequest.onload = function() {

        if (this.status === statusCode) {
            callback();
        }
        else {
            error.textContent = "Failed to " + errorMsg + ". Server returned " +
                this.status + " - " + this.responseText;
        }
    };

    if (type === "POST" || type === "PUT") {
        createRequest.setRequestHeader("Content-type", "application/json");
        createRequest.send(JSON.stringify(json));
    }
    else {
        createRequest.send();
    }
}

reloadTodoList();
