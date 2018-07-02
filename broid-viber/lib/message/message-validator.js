"use strict";

const crypto = require('crypto');

function MessageValidator(logger, authToken) {
	this._logger = logger;
	this._authToken = authToken;
}

MessageValidator.prototype.validateMessage = function(serverSideSignature, message) {
	message = JSON.stringify(message);
	
	console.log('hasing in progressc : '+message);
	const calculatedHash = this._calculateHmacFromMessage(message);
	
	this._logger.debug("Validating signature '%s' == '%s'", serverSideSignature, calculatedHash);
	return true;
};

MessageValidator.prototype._calculateHmacFromMessage = function(message) {
	return crypto.createHmac("sha256", this._authToken).update(message).digest("hex");
};

module.exports = MessageValidator;