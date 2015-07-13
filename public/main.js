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

    $scope.getTodosDisplay = function() {
        return $scope.todos.filter(function(todo) {
            return todo.toggle;
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

    $scope.toggleAllOn = function() {
        $scope.todos.map(function(todo) {
            todo.toggle = true;
        });
    };

    $scope.toggleActiveOn = function() {
        $scope.todos.map(function(todo) {
            if (!todo.isComplete) {
                todo.toggle = true;
            }
            else {
                todo.toggle = false;
            }
        });
    };

    $scope.toggleCompleteOn = function() {
        $scope.todos.map(function(todo) {
            if (todo.isComplete) {
                todo.toggle = true;
            }
            else {
                todo.toggle = false;
            }
        });
    };

    $scope.poll = function() {
        setTimeout(function() {
            console.log("timeout fired");
            reloadTodoList();
            $scope.poll();
        }, 5000);
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
    $scope.poll();

}]);
