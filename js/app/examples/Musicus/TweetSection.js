define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var SequentialLayout = require('famous-misc/SequentialLayout');

    // Import app specific dependencies
    var SoloTweetView   = require('app/examples/Musicus/SoloTweetView');

    function Tweet(options) {
        View.call(this);

        // Create the sequence container
        this.sequenceview = new SequentialLayout({
            direction: Util.Direction.Y,
            margin: 10000
        });

        // Attach the single tweet to the sequence view
        this.sequenceview.sequenceFrom([new SoloTweetView(options)]);
        this._link(this.sequenceview)
    }

    Tweet.prototype = Object.create(View.prototype);
    Tweet.prototype.constructor = Tweet;

    module.exports = Tweet;
});
