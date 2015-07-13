
var app = angular.module("todoApp", []);

app.controller("todoController", ["$http", "$scope", function($http, $scope) {

    $scope.todos = [];
    $scope.fetched = false;
    $scope.newTodo = "";
    $scope.errorText = "";
    $scope.editingTodo = -1;
    $scope.completeItems = 0;

    $scope.createTodo = function() {
        $http.post("/api/todo", {title: $scope.newTodo}).
            success(function(response) {
                console.log(response);
                $scope.newTodo = "";
                reloadTodoList();
            }).
            error(function(data, status, headers, config) {
                errorHanding(data, status, "create item");
            });
    };

    $scope.deleteTodo = function(todo) {
        $http.delete("/api/todo/" + todo.id).
            success(function(response) {
                reloadTodoList();
            }).
            error(function(data, status, headers, config) {
                errorHanding(data, status, "delete item");
            });
    };

    $scope.completeTodo = function(todo) {
        $http.put("/api/todo/" + todo.id + "?isComplete=true").
            success(function(response) {
                reloadTodoList();
            }).
            error(function(data, status, headers, config) {
                errorHanding(data, status, "complete item");
            });

    };

    $scope.editTodo = function(todo) {
        $scope.editingTodo = todo.id;
    };

    $scope.updateTodo = function(todo) {
        $http.put("/api/todo/" + todo.id, {updatedText: todo.title}).
            success(function(response) {
                reloadTodoList();
            }).
            error(function(data, status, headers, config) {
                errorHanding(data, status, "complete item");
            });
        $scope.editingTodo = -1;
    };

    $scope.deleteAllComplete = function() {
        var toDelete = $scope.todos.filter(function(todo) {
            return todo.isComplete;
        });

        $http.put("/api/todo/batch?toDelete=true", {todos: toDelete}).
            success(function(response) {
                reloadTodoList();
            }).
            error(function(data, status, headers, config) {
                errorHanding(data, status, "delete items");
            });

    };

    $scope.isEditing = function(id) {
        return $scope.editingTodo === id;
    };

    function errorHanding(data, status, msg) {
        $scope.errorText = "Failed to " + msg + ". Server returned " +
            status + " - " + data ;
    }

    function reloadTodoList() {
        $http.get("/api/todo").
            success(function(data) {
                $scope.todos = data;
                $scope.dataFetched = true;
                $scope.errorText = "";
                $scope.completeItems = $scope.todos.filter(function(todo) {
                        return todo.isComplete;
                    }).length;

            }).
            error(function(data, status, headers, config) {
                errorHanding(data, status, "get list");
            });
    }

    reloadTodoList();

}]);

// var todoList = document.getElementById("todo-list");
// var todoListPlaceholder = document.getElementById("todo-list-placeholder");
// var form = document.getElementById("todo-form");
// var todoTitle = document.getElementById("new-todo");
// var error = document.getElementById("error");
// var countLabel = document.getElementById("count-label");
// var title = document.getElementById("page-title");

// form.onsubmit = function(event) {
//     var title = todoTitle.value;
//     createTodo(title, function() {
//         reloadTodoList();
//     });
//     todoTitle.value = "";
//     event.preventDefault();
// };

// function createTodo(title, callback) {
//     makeHttpRequest("POST", "/api/todo/", 201,
//         "create item", {title: title}, callback);
// }

// function getTodoList(callback) {
//     makeHttpRequest("GET", "/api/todo", 200,
//         "get list", {}, callback);
// }

// function reloadTodoList() {
//     while (todoList.firstChild) {
//         todoList.removeChild(todoList.firstChild);
//     }

//     var completeItems = 0;
//     var numItems = 0;

//     todoListPlaceholder.style.display = "block";
//     getTodoList(function(todos) {
//         todoListPlaceholder.style.display = "none";
//         todos.forEach(function(todo) {

//             var listItem = document.createElement("li");
//             var itemContent = document.createElement("div");
//             var itemText = document.createElement("p");
//             var delButton = createButton("delete-button", "Delete Todo");
//             var updateButton = createButton("update-button", "Edit Todo");
//             var completeButton =  createButton("complete-button", "Complete");

//             itemText.textContent = todo.title;
//             itemText.setAttribute("id", "todo-text");

//             //remove todo item on click
//             delButton.addEventListener("click", function() {
//                 makeHttpRequest("DELETE", "/api/todo/" + todo.id, 200,
//                         "delete item", {}, reloadTodoList);
//             });

//             //change todo text on click
//             updateButton.addEventListener("click", function() {

//                 //Create form to allow text to be changed
//                 var oldText = todo.title;
//                 var form = document.createElement("form");
//                 var input = document.createElement("input");
//                 var submit = document.createElement("input");

//                 input.setAttribute("id", "update-input");
//                 submit.setAttribute("id", "update-submit");

//                 input.value = todo.title;
//                 submit.type = "submit";

//                 //submit an updated todo
//                 submit.addEventListener("click", function() {
//                     var updatedText = input.value;

//                     makeHttpRequest("PUT", "/api/todo/" + todo.id, 200,
//                         "update item", {title: updatedText}, reloadTodoList);
//                 });

//                 //Add Form to DOM, remove exisiting components
//                 form.appendChild(input);
//                 form.appendChild(submit);

//                 listItem.removeChild(itemContent);
//                 listItem.appendChild(form);
//             });

//             //complete a todo
//             completeButton.addEventListener("click", function() {
//                 var url = "/api/todo/" + todo.id + "?isComplete=true";
//                 makeHttpRequest("PUT", url, 200, "complete item", {}, reloadTodoList);
//             });

//             //add csss class to show item complete
//             if (todo.isComplete) {
//                 itemText.className = "complete";
//                 completeItems++;
//             }
//             numItems++;

//             if (todo.toggle) {
//                 //add todo elements to the DOM
//                 itemContent.appendChild(itemText);
//                 itemContent.appendChild(delButton);
//                 itemContent.appendChild(updateButton);
//                 itemContent.appendChild(completeButton);
//                 listItem.appendChild(itemContent);
//                 todoList.appendChild(listItem);
//             }

//             countLabel.innerHTML = completeItems + "/" + numItems + " Todos Complete";
//         });
//     });
// }

// //delete all todo items that have been marked as complete
// function deleteAllComplete() {
//     var toDelete = [];

//     //get all complete items
//     getTodoList(function(todos) {
//         todos.forEach(function(todo) {
//             if (todo.isComplete === true) {
//                 toDelete.push(todo.id);
//             }
//         });

//         makeHttpRequest("DELETE", "/api/todo/batch", 200,
//             "delete item", {ids : toDelete}, reloadTodoList);
//     });
// }

// function toggleAllOn() {
//     toggleVisable(function(todo, toShow) {
//         todo.toggle = true;
//         toShow.push(todo.id);
//     });
// }

// function toggleActiveOn() {
//     toggleVisable(function(todo, toShow) {
//         if (todo.isComplete !== true) {
//             todo.toggle = true;
//             toShow.push(todo.id);
//         }
//     });
// }

// function toggleCompleteOn() {
//     toggleVisable(function(todo, toShow) {
//         if (todo.isComplete === true) {
//             todo.toggle = true;
//             toShow.push(todo.id);
//         }
//     });
// }

// function toggleVisable(condition) {
//     var toShow = [];

//     //get all items
//     getTodoList(function(todos) {
//         todos.forEach(function(todo) {
//             condition(todo, toShow);
//         });

//         makeHttpRequest("PUT", "/api/todo/batch?toggle=true", 200,
//                 "toggle item", {todos: toShow}, reloadTodoList);
//     });
// }

// //Makes an http request to the server
// function makeHttpRequest(type, url, statusCode, errorMsg, body, callback) {

//     if (type === "GET") {
//         fetch(url, {
//                 method: type,
//                 headers: {
//                     "Accept": "application/json",
//                     "Content-Type": "application/json"
//                 }
//             }).then(function(response) {
//                 checkStatus(response);
//                 return response.json();
//             }).then(function(json) {
//                 callback(json);
//             }).catch(function(err) {
//                 console.log(err.response.statusText);
//                 error.textContent = "Failed to " + errorMsg + ". Server returned " +
//                         err.response.status + " - " + err.response.statusText;
//             });
//     }
//     else {
//         fetch(url, {
//                 method: type,
//                 headers: {
//                     "Accept": "application/json",
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify(body)
//             }).then(function(response) {
//                 checkStatus(response);
//             }).then(function() {
//                 callback();
//             }).catch(function(err) {
//                 console.log(err.response.statusText);
//                 error.textContent = "Failed to " + errorMsg + ". Server returned " +
//                         err.response.status + " - " + err.response.statusText;
//             });
//     }
// }

// function checkStatus(response) {
//     if (response.status >= 200 && response.status < 300) {
//         return response;
//     }
//     else {
//         var error = new Error(response.statusText);
//         error.response = response;
//         throw error;
//     }
// }

// function createButton(id, text) {
//     var button = document.createElement("button");
//     button.textContent = text;
//     button.className = "button";
//     button.setAttribute("id", id);
//     return button;
// }

// function poll() {
//     setTimeout(function() {
//         console.log("timeout fired");
//         reloadTodoList();
//         poll();
//     }, 5000);
// }

// reloadTodoList();
// poll();
