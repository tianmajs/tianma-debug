'use strict';

var http = require('http');
var debug = require('..');
var request = require('supertest');
var tianma = require('tianma');

function createApp() {
    var app = tianma();
    var server = http.createServer(app.run);
        
    app.server = server;
    
    return app;
}

describe('single line code', function () {
    function createServer(pathname) {
        var app = createApp();
        
        app.use(debug(pathname)).then
            .use(function *(next) {
                switch (this.request.pathname) {
                case '/foo.js':
                    this.response
                        .type('js')
                        .data('/*@debug var foo; */');
                break;
                case '/foo.css':
                    this.response
                        .type('css')
                        .data('/*@debug .foo {} */');
                break;
                }
            });
            
        return app.server;
    }
    
    it('should expose single line debug code in JS', function (done) {
        request(createServer('/'))
            .get('/foo.js')
            .expect(' var foo; ')
            .end(done);
    });
    
    it('should expose single line debug code in CSS', function (done) {
        request(createServer('/'))
            .get('/foo.css')
            .expect(' .foo {} ')
            .end(done);
    });
});

describe('multiple line code', function () {
    function createServer(pathname) {
        var app = createApp();
        
        app.use(debug(pathname)).then
            .use(function *(next) {
                switch (this.request.pathname) {
                case '/foo.js':
                    this.response
                        .type('js')
                        .data('/*@debug\nvar foo;\nvar bar;\n*/');
                break;
                case '/foo.css':
                    this.response
                        .type('css')
                        .data('/*@debug\n.foo {}\n.bar {}\n*/');
                break;
                }
            });
            
        return app.server;
    }
    
    it('should expose multiple line debug code in JS', function (done) {
        request(createServer('/'))
            .get('/foo.js')
            .expect('\nvar foo;\nvar bar;\n')
            .end(done);
    });
    
    it('should expose multiple line debug code in CSS', function (done) {
        request(createServer('/'))
            .get('/foo.css')
            .expect('\n.foo {}\n.bar {}\n')
            .end(done);
    });
});