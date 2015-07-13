var server = require("../server/server");
var request = require("request");
var assert = require("chai").assert;

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var todoListUrl = baseUrl + "/api/todo";

var testTodo = {
        title: "This is a TODO item",
        done: false,
        isComplete: false,
        toggle: true
    };

describe("server", function() {
    var serverInstance;
    beforeEach(function() {
        serverInstance = server(testPort);
    });
    afterEach(function() {
        serverInstance.close();
    });
    describe("get list of todos", function() {
        it("responds with status code 200", function(done) {
            request(todoListUrl, function(error, response) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
        it("responds with a body encoded as JSON in UTF-8", function(done) {
            request(todoListUrl, function(error, response) {
                assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
                done();
            });
        });
        it("responds with a body that is a JSON empty array", function(done) {
            request(todoListUrl, function(error, response, body) {
                assert.equal(body, "[]");
                done();
            });
        });
    });
    describe("create a new todo", function() {
        it("responds with status code 201", function(done) {
            request.post({
                url: todoListUrl,
                json: testTodo
            }, function(error, response) {
                assert.equal(response.statusCode, 201);
                done();
            });
        });
        it("responds with the location of the newly added resource", function(done) {
            request.post({
                url: todoListUrl,
                json: testTodo
            }, function(error, response) {
                assert.equal(response.headers.location, "/api/todo/0");
                done();
            });
        });
        it("inserts the todo at the end of the list of todos", function(done) {
            request.post({
                url: todoListUrl,
                json: testTodo
            }, function() {
                request.get(todoListUrl, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body), [{
                        title: "This is a TODO item",
                        done: false,
                        id: "0",
                        isComplete: false,
                        toggle: true
                    }]);
                    done();
                });
            });
        });
    });
    describe("delete a todo", function() {
        it("responds with status code 404 if there is no such item", function(done) {
            request.del(todoListUrl + "/0", function(error, response) {
                assert.equal(response.statusCode, 404);
                done();
            });
        });
        it("responds with status code 200", function(done) {
            request.post({
                url: todoListUrl,
                json: testTodo
            }, function() {
                request.del(todoListUrl + "/0", function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("removes the item from the list of todos", function(done) {
            request.put({
                url: todoListUrl,
                json: testTodo
            }, function() {
                request.del(todoListUrl + "/0", function() {
                    request.get(todoListUrl, function(error, response, body) {
                        assert.deepEqual(JSON.parse(body), []);
                        done();
                    });
                });
            });
        });
    });
    describe("update a todo", function() {
        it("responds with a 404 if there is no such item", function(done) {
            request.put(todoListUrl + "/0", function(error, response) {
                assert.equal(response.statusCode, 404);
                done();
            });
        });
        it("changes todo text", function(done) {
            var newTodo = {
                updatedText: "changed",
                done: false,
                isComplete: false
            };
            request.post({
                url: todoListUrl,
                json: testTodo
            }, function() {
                request.put({
                    url: todoListUrl + "/0",
                    json: newTodo
                }, function() {
                    request.get(todoListUrl, function(error, response, body) {
                        assert.deepEqual(JSON.parse(body), [{
                            title: "changed",
                            done: false,
                            id: "0",
                            isComplete: false,
                            toggle: true
                        }]);
                        done();
                    });
                });
            });
        });
        it("marks a todo as complete", function(done) {
            request.post({
                url: todoListUrl,
                json: testTodo
            }, function() {
                request.put({
                    url: todoListUrl + "/0?isComplete=true",
                }, function() {
                    request.get(todoListUrl, function(error, response, body) {
                        assert.deepEqual(JSON.parse(body), [{
                            title: "This is a TODO item",
                            done: false,
                            id: "0",
                            isComplete: true,
                            toggle: true
                        }]);
                        done();
                    });
                });
            });
        });
        it("responds witha 400 if the query string is incorrect", function(done) {
            request.post({
                url: todoListUrl,
                json: testTodo
            }, function() {
                request.put({
                    url: todoListUrl + "/0?wrong=true",
                }, function(error, response) {
                    assert.equal(response.statusCode, 400);
                    done();
                });
            });
        });
    });
    describe("batch change todos" , function() {
        it("put responds with a 400 if there is no query", function(done) {
            request.put(todoListUrl + "/batch", function(error, response) {
                assert.equal(response.statusCode, 400);
                done();
            });
        });
        it("put responds with a 400 if the query is malformed", function(done) {
            request.put(todoListUrl + "/batch?wrong=true", function(error, response) {
                assert.equal(response.statusCode, 400);
                done();
            });
        });
        it("put toggles todos correctly", function(done) {
            request.post({
                url: todoListUrl,
                json: testTodo
            }, function() {
                request.post({
                    url: todoListUrl,
                    json: testTodo
                }, function() {
                    request.put({
                        url: todoListUrl + "/batch?toggle=true",
                        json: {todos: ["0"]}
                    }, function() {
                        request.get(todoListUrl, function(error, response, body) {
                            assert.deepEqual(JSON.parse(body), [{
                                title: "This is a TODO item",
                                done: false,
                                id: "0",
                                isComplete: false,
                                toggle: true
                            },
                            {
                                title: "This is a TODO item",
                                done: false,
                                id: "1",
                                isComplete: false,
                                toggle: false
                            }]);
                            done();
                        });
                    });
                });
            });
        });
        it("put toggles todos correctly and back again", function(done) {
            request.post({
                url: todoListUrl,
                json: testTodo
            }, function() {
                request.post({
                    url: todoListUrl,
                    json: testTodo
                }, function() {
                    request.put({
                        url: todoListUrl + "/batch?toggle=true",
                        json: {todos: ["0"]}
                    }, function() {
                        request.put({
                            url: todoListUrl + "/batch?toggle=true",
                            json: {todos: []}
                        }, function() {
                            request.get(todoListUrl, function(error, response, body) {
                                assert.deepEqual(JSON.parse(body), [{
                                    title: "This is a TODO item",
                                    done: false,
                                    id: "0",
                                    isComplete: false,
                                    toggle: false
                                },
                                {
                                    title: "This is a TODO item",
                                    done: false,
                                    id: "1",
                                    isComplete: false,
                                    toggle: false
                                }]);
                                done();
                            });
                        });
                    });
                });
            });
        });
        it("delete responds with a 400 if no ids are sent", function(done) {
            request.put({
                url: todoListUrl + "/batch",
                json: {}
            }, function(error, response) {
                assert.equal(response.statusCode, 400);
                done();
            });
        });
        it("delete removes several todos at once", function(done) {
            request.post({
                url: todoListUrl,
                json: testTodo
            }, function() {
                request.post({
                    url: todoListUrl,
                    json: testTodo
                }, function() {
                    request.put({
                        url: todoListUrl + "/batch?toDelete=true",
                        json: {todos: [{
                            id: "0",
                            title: "This is a TODO item",
                            done: false,
                            isComplete: false,
                            toggle: true
                        },
                        {
                            id: "1",
                            title: "This is a TODO item",
                            done: false,
                            isComplete: false,
                            toggle: true
                        }]}
                    }, function() {
                        request.get(todoListUrl, function(error, response, body) {
                            assert.deepEqual(JSON.parse(body), []);
                            done();
                        });
                    });
                });
            });
        });
    });
});
