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
                res.sendStatus(200);
            }
            else if (req.query.toDelete !== undefined) {
                var ids = [];

                req.body.todos.map(function(todo) {
                    ids.push(todo.id);
                });

                if (ids === undefined || ids.length === 0) {
                    res.sendStatus(400);
                }
                else {
                    //TODO refactor delete out
                    //remove any todos that are marked complete
                    todos = _.filter(todos, function(otherTodo) {
                        return (ids.indexOf(otherTodo.id) <= -1);
                    });

                    res.sendStatus(200);
                }
            }
            else {
                res.sendStatus(400);
            }
        }
        else {
            res.sendStatus(400);
        }
    });

    // Update
    app.put("/api/todo/:id", function(req, res) {

        var status;
        var success = false;
        var id = req.params.id;
        var todo = getTodo(id);

        if (todo !== undefined) {
            //check if marking complete or changing the text
            if (Object.keys(req.query).length !== 0) {

                if (req.query.isComplete !== undefined) {
                    //marking complete
                    todo.isComplete = true;
                    success = true;
                }
                else {
                    status = 400;
                }
            }
            else {
                //changing text
                todo.title = req.body.updatedText;
                success = true;
            }
        }
        else {
            status = 404;
        }

        if (success) { res.sendStatus(200); }
        else { res.sendStatus(status); }
    });

    // Delete
    app.delete("/api/todo/:id", function(req, res) {

        var id = req.params.id;
        var todo = getTodo(id);

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
        res.sendStatus(200);
    });

    function getTodo(id) {
        return _.find(todos, function(todo) {
            return todo.id === id;
        });
    }

    return app.listen(port);
};
