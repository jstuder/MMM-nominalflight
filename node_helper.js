/* Magic Mirror
 * Module: MMM-nominalflight
 *
 * By Jonas Studer http://jonasstuder.com
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
  start: function () {
    console.log('MMM-nominalflight helper started ...');
  },
  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, url) {
    if (notification === 'LAUNCH_UPDATE') {
      var self = this;
      request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          self.sendSocketNotification('LAUNCH_DATA', JSON.parse(body));
        } else {
          console.error('Failure: ' + error);
        }
      });
    }
  }
});