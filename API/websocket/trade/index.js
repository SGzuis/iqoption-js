const Trade = require("./trade")

module.exports = function(options) {
	return new Trade(this, options)
}