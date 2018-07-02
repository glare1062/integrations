"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const stream = require('stream');

function Middleware(logger, messageValidatorService) {
	this._logger = logger;
	this._stream = this._createStream();
	this._buffer = null;

	this._app = express();
	this._app.use(bodyParser.text({ type: "*/*" }));
	console.log('calling hash method before in middleware');

	this._validateMessageSignature(messageValidatorService);
	this._configureEndpoints();
}

Middleware.prototype.getIncoming = function() {
	return this._app;
};

Middleware.prototype.getStream = function() {
	return this._stream;
};
console.log('before config points funcrion in mid')
Middleware.prototype._configureEndpoints = function() {
	console.log('config end points methodf');

	const self = this;
	this._app.get("/ping", (request, response) => {
		response.send("pong");
		response.end();
	});

	console.log('point before posting stuff in middle ware after config points');

	this._app.post("/", (request, response) => {
		console.log('point where requestbody whihc i suspec tis the callback url :'+ JSON.stringify(request.body));
		self._logger.debug("Request data:", request.body);
		self._stream.push(JSON.stringify(request.body));
		console.log('middleware post req and ser :'+ request +" "+response)

		if (self._buffer) {
			response.send(self._buffer);
		}
		response.end();
	});
};

console.log('before creating stream');
Middleware.prototype._createStream = function() {
	const self = this;
	const duplexStream = new stream.Duplex();

	duplexStream._read = function noop() {};
	duplexStream._write = (chunk, encoding, done) => {
		self._buffer = chunk.toString();
		done();
	};
	return duplexStream;
};

Middleware.prototype._validateMessageSignature = function(messageValidatorService) {
	const self = this;
	this._app.use((request, response, next) => {
		console.log('req and res in validate :'+request +" "+response);
		const serverSideSignature = request.headers.X_Viber_Content_Signature || request.query.sig;
		if (!messageValidatorService.validateMessage(serverSideSignature, request.body)) {
			console.log('point where sending to hash');
			self._logger.warn("Could not validate message signature", serverSideSignature);
			return;
		}
		next();
	});
};

module.exports = Middleware;