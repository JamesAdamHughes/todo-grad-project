var express = require("express");
var server = require("../server/server");
var webdriver = require("selenium-webdriver");
var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

module.exports.setupServer = function() {
    var router = express.Router();
    if (gatheringCoverage) {
        router.get("/main.js", function(req, res) {
            var absPath = path.join(__dirname, "..", "public", "main.js");
            res.send(instrumenter.instrumentSync(fs.readFileSync("public/main.js", "utf8"), absPath));
        });
    }
    var serverInstance = server(testPort, router);
    var driver = new webdriver.Builder().forBrowser("chrome").build();
    return {router: router, server: serverInstance, driver: driver};
};

module.exports.teardownServer = function(server) {
    if (gatheringCoverage) {
        server.driver.executeScript("return __coverage__;").then(function (coverage) {
            collector.add(coverage);
        });
    }
    server.server.close();
    server.driver.quit();
};

module.exports.reportCoverage = function() {
    if (gatheringCoverage) {
        fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
    }
};

module.exports.navigateToSite = function(server) {
    server.driver.get(baseUrl);
};

module.exports.getTitleText = function(server) {
    return server.driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getInputText = function(server) {
    return server.driver.findElement(webdriver.By.id("new-todo")).getAttribute("value");
};

module.exports.getErrorText = function(server) {
    var errorElement = server.driver.findElement(webdriver.By.id("error"));
    server.driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"), 5000);
    return errorElement.getText();
};

module.exports.getTodoList = function(server) {
    wait(server);
    return server.driver.findElements(webdriver.By.css("#todo-list li"));
};

module.exports.addTodo = function(server, text) {
    server.driver.findElement(webdriver.By.id("new-todo")).sendKeys(text);
    server.driver.findElement(webdriver.By.id("submit-todo")).click();
    wait(server);
};

module.exports.removeTodo = function(server) {
    server.driver.findElement(webdriver.By.id("delete-button")).click();
    wait(server);
};

module.exports.updateTodoPress = function(server) {
    server.driver.findElement(webdriver.By.id("update-button")).click();
    wait(server);
    return server.driver.findElement(webdriver.By.id("update-input")).getAttribute("value");
};

module.exports.updateTodoSend = function(server, text) {
    server.driver.findElement(webdriver.By.id("update-button")).click();
    wait(server);
    server.driver.findElement(webdriver.By.id("update-input")).sendKeys(text);
    server.driver.findElement(webdriver.By.id("update-submit")).click();
    wait(server);
    return server.driver.findElement(webdriver.By.id("todo-text")).getText();
};

module.exports.markTodoComplete = function(server) {
    server.driver.findElement(webdriver.By.id("complete-button")).click();
    wait(server);
    return server.driver.findElement(webdriver.By.id("todo-text")).getCssValue("color");
};

module.exports.deleteAllComplete = function(server) {
    server.driver.findElement(webdriver.By.id("delete-all-button")).click();
    wait(server);
};

module.exports.toggleShowAll = function(server) {
    server.driver.findElement(webdriver.By.id("toggle-all-button")).click();
    wait(server);
};

module.exports.toggleShowActive = function(server) {
    server.driver.findElement(webdriver.By.id("toggle-active-button")).click();
    wait(server);
};

module.exports.toggleShowComplete = function(server) {
    server.driver.findElement(webdriver.By.id("toggle-complete-button")).click();
    wait(server);
};

module.exports.setupErrorRoute = function(server, action, route) {
    if (action === "get") {
        server.router.get(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "post") {
        server.router.post(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "delete") {
        server.router.delete(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "put") {
        server.router.put(route, function(req, res) {
            res.sendStatus(500);
        });
    }

};

function wait(server) {
    var todoListPlaceholder = server.driver.findElement(webdriver.By.id("todo-list-placeholder"));
    server.driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
}
