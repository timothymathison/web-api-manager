"use strict";

const utils = require("./lib/utils");
const injected = require("./lib/injected");
const testServer = require("./lib/server");
const webdriver = require("selenium-webdriver");
const by = webdriver.By;
const until = webdriver.until;
const Context = require("selenium-webdriver/firefox").Context;

describe("Basic Functionality", function () {

    const svgTestScript = injected.testSVGTestScript();

    let httpServer;
    let testUrl;

    describe("blocking", function () {

        this.timeout = function () {
            return 20000;
        };

        it("SVG Not Blocking", function (done) {

            this.timeout = function () {
                return 10000;
            };

            const [server, url] = testServer.start();

            testUrl = url;
            httpServer = server;

            const standardsToBlock = [];
            let driverReference;

            utils.promiseGetDriver()
                .then(function (driver) {
                    driverReference = driver;
                    return utils.promiseSetBlockingRules(driver, standardsToBlock);
                })
                .then(() => driverReference.get(testUrl))
                .then(() => driverReference.executeAsyncScript(svgTestScript))
                .then(function () {
                    driverReference.quit();
                    testServer.stop(httpServer);
                    done(new Error("SVG acted as if it was being blocked"));
                })
                .catch(function () {
                    // Since we're not blocking the SVG API, then the sample
                    // SVG code should throw an exception.
                    driverReference.quit();
                    testServer.stop(httpServer);
                    done();
                });
        });

        it("SVG blocking", function (done) {

            this.timeout = () => 10000;

            const [server, url] = testServer.start();

            testUrl = url;
            httpServer = server;

            const standardsToBlock = utils.constants.svgBlockRule;
            let driverReference;

            utils.promiseGetDriver()
                .then(function (driver) {
                    driverReference = driver;
                    return utils.promiseSetBlockingRules(driver, standardsToBlock);
                })
                .then(() => driverReference.get(testUrl))
                .then(() => driverReference.executeAsyncScript(svgTestScript))
                .then(function () {
                    driverReference.quit();
                    testServer.stop(httpServer);
                    done();
                })
                .catch(function (e) {
                    driverReference.quit();
                    testServer.stop(httpServer);
                    done(e);
                });
        });

        it("Proxyblock does not get stuck in infinite loop", function (done) {

            const [server, url] = testServer.startWithFile("infinite-loop.html");

            testUrl = url;
            httpServer = server;

            const standardsToBlock = ["Selectors API Level 1"];
            let driverReference;

            utils.promiseGetDriver()
                .then(function (driver) {
                    driverReference = driver;
                    return utils.promiseSetBlockingRules(driver, standardsToBlock);
                })
                .then(() => driverReference.get(testUrl))
                .then(() => driverReference.wait(until.elementLocated(by.css("div.success-case")), 2000))
                .then(function () {
                    driverReference.quit();
                    testServer.stop(httpServer);
                    done();
                })
                .catch(function (e) {
                    driverReference.quit();
                    testServer.stop(httpServer);
                    done(e);
                });
        });
    });
});
