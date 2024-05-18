const axios = require('axios')

module.exports = function(host, endpoint, method, body, headers) {
	return new Promise(function(resolve, reject) {
		axios({
			url: `https://${host}/${endpoint}`,
			method,
			data: body,
			headers
		})
			.then(response => {
				resolve(response.data);
			})
			.catch(error => {
				reject(error);
			});
	});
}
