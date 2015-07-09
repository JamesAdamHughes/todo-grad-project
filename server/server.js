var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");

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
        todo.toggle = true;

        latestId++;
        todos.push(todo);
        res.set("Location", "/api/todo/" + todo.id);
        res.sendStatus(201);
    });

    // Read
    app.get("/api/todo", function(req, res) {
        res.json(todos);
    });

    //make a change to several
    app.put("/api/todo/batch", function(req, res) {
        console.log(req.body);
        console.log(req.query);

        if (Object.keys(req.query).length !== 0) {
            if (req.query.toggle !== undefined) {
                _.each(todos, function(todo) {
                    if (req.body.todos.indexOf(todo.id) > -1) {
                        todo.toggle = true;
                    }
                    else {
                        todo.toggle = false;
                    }
                });
            }
        }
        else {

        }

        console.log(todos);

        res.sendStatus(200);

    });

    // Update
    app.put("/api/todo/:id", function(req, res) {

        var id = req.params.id;
        var todo = getTodo(id);

        // res.sendStatus(500);

        if (todo !== undefined) {
            //check if marking complete or changing the text
            if (Object.keys(req.query).length !== 0) {

                if (req.query.isComplete !== undefined) {
                    console.log("complete");
                    //marking complete
                    todo.isComplete = true;
                }
                else {
                    console.log("toggle");

                    //toggle visable or not visable
                    todo.toggle = req.query.toggle;
                }
            }
            else {
                var updatedText = req.body;
                todo.title = updatedText.title;
            }
            res.sendStatus(200);
        }
        else {
            res.sendStatus(404);
        }
    });

    app.delete("/api/todo/batch", function(req, res) {
        var ids = req.body.ids;

        if (ids === undefined) {
            console.log("Ids undefined");
            res.sendStatus(404);
        }
        else {

            //remove any todos that are marked complete
            todos = _.filter(todos, function(otherTodo) {
                return (ids.indexOf(otherTodo.id) <= -1);
            });

            res.sendStatus(200);
        }
    });

    // Delete
    app.delete("/api/todo/:id", function(req, res) {

        var id = req.params.id;
        var todo = getTodo(id);

        // res.sendStatus(500);

        if (todo) {
            //keep only todos not deleted
            todos = _.filter(todos, function(otherTodo) {
                return otherTodo !== todo;
            });

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    app.post("/api/message/:message", function(req, res) {
        console.log(req.params.message);
    });

    function getTodo(id) {
        return _.find(todos, function(todo) {
            return todo.id === id;
        });
    }

    return app.listen(port);
};
