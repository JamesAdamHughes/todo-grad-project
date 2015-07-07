var express = require("express");
var bodyParser = require("body-parser");
var underscore = require("underscore");

module.exports = function(port, middleware) {
    var app = express();

    if (middleware) {
        app.use(middleware);
    }
    app.use(express.static("public"));
    app.use(bodyParser.json());

    var latestId = 0;
    var todos = [];

    // Create
    app.post("/api/todo", function(req, res) {
        var todo = req.body;

        todo.id = latestId.toString();
        todo.isComplete = false;

        latestId++;
        todos.push(todo);
        res.set("Location", "/api/todo/" + todo.id);
        res.sendStatus(201);
    });

    // Read
    app.get("/api/todo", function(req, res) {
        res.json(todos);
    });

    // Update
    app.put("/api/todo/:id", function(req, res) {

        var id = req.params.id;
        var todo = getTodo(id);

        if(todo !== undefined){  
            console.log(req.query);          
            //check if marking complete or changing the text
            if(Object.keys(req.query).length !== 0){
                //marking complete
                console.log("marking complete");
                todo.isComplete = true;
            }
            else{
                //changing text
                console.log("updating todo");
                var updatedText = req.body;
                todo["title"] = updatedText.title;
            }
            res.sendStatus(200);
            console.log(todo);
        }
        else{
            console.log("NO TODO FOUND");
            res.sendStatus(404);
        }

        
        
    });

    // Delete
    app.delete("/api/todo/:id", function(req, res) {

        var id = req.params.id;
        var todo = getTodo(id);

        console.log("Deleting item" + id);

        if (todo) {

            //keep only todos not deleted            
            todos = underscore.filter(todos, function(otherTodo){
                return otherTodo !== todo;
            });

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    function getTodo(id) {
        return todos.filter(function(todo) {
            return todo.id === id;
        })[0];
    }

    return app.listen(port);
};
