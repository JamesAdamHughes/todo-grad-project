var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");

testing.describe("end to end", function() {
    var server;

    this.timeout(20000);

    testing.beforeEach(function() {
        server = helpers.setupServer();
    });
    testing.afterEach(function() {
        helpers.teardownServer(server);
    });
    testing.after(function() {
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite(server);
            helpers.getTitleText(server).then(function(text) {
                assert.equal(text, "James's TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute(server, "get", "/api/todo");
            helpers.navigateToSite(server);
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.getInputText(server).then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute(server, "post", "/api/todo");
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.addTodo(server, "Another new todo item");
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
    testing.describe("on delete todo item", function() {
        testing.it("removes the item from the list", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.removeTodo(server);
            helpers.getTodoList(server).then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the delete fails", function() {
            helpers.setupErrorRoute(server, "delete", "/api/todo/:id");
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.removeTodo(server);
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to delete item. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on update todo item", function() {
        testing.it("displays an error if there is no such item", function() {
            helpers.setupErrorRoute(server, "put", "/api/todo/:id");
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.updateTodoSend(server, "text2");
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to update item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("displays an input field when editing with old text present", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.updateTodoPress(server).then(function(text) {
                assert.equal(text, "New todo item");
            });
        });
        testing.it("todo updates with new text", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "text1");
            helpers.updateTodoSend(server, "text2").then(function(text) {
                assert.equal(text, "text1text2");
            });
        });
    });
    testing.describe("on mark todo complete", function() {
        testing.it("displays an error if there is no such item", function() {
            helpers.setupErrorRoute(server, "put", "/api/todo/:id");
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.markTodoComplete(server);
            helpers.getErrorText(server).then(function(text) {
                assert.equal(text, "Failed to complete item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("complete marks task as green", function() {
            helpers.navigateToSite(server);
            helpers.addTodo(server, "New todo item");
            helpers.markTodoComplete(server).then(function(color) {
                assert.equal(color, "rgba(0, 128, 0, 1)");
            });
        });
    });
});

