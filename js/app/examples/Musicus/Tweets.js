define(function(require, exports, module) {
    // Import app specific dependencies
    var Tweet = require('app/examples/Musicus/Tweet');

    module.exports = Backbone.Collection.extend({
      model: Tweet,

      initialize: function(models, options) {
        this.dataSource = new Firebase(options.dataSource);
        this.fetch();
      },

      // Custom fetch for Firebase integration
      fetch: function() {
        var newModels;
        var self = this;
        this.dataSource.once('value', function(tweetsSnapShot) {
          self.reset(_.map(tweetsSnapShot.val(), function(tweet) {
            return new self.model(tweet);
          }));
        });
      }
    });
});