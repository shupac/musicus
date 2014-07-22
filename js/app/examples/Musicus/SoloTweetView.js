define(function(require, exports, module) {
    // Import core Famous dependencies
    var View         = require('famous/View');
    var Surface      = require('famous/Surface');

    function SoloTweetView(options) {
        View.call(this)

        this.model = options.model;

        this.surface = new Surface({
            classes: ['surface', 'tweet'],
            size: [undefined, 80]
        });

        this.template();

        this._link(this.surface);
    }

    SoloTweetView.prototype = Object.create(View.prototype);
    SoloTweetView.prototype.constructor = SoloTweetView;

    // Tweet template
    SoloTweetView.prototype.template = function() {
        var tweet = '<img src="' + this.model.get('imageUrl') + '" class="icon" width="200" height="200">';
        tweet += '<p>24h</p>';
        tweet += '<p class="source">' + this.model.get('artist') + '</p>';
        tweet += '<p class="text">' + this.model.get('title') + '</p>';
        this.surface.setContent(tweet);
    }

    module.exports = SoloTweetView;
});