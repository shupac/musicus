define(function(require, exports, module) {
    var EventHandler = require('famous/EventHandler');
    var Surface = require('famous/Surface');
    var TimeAgo = require('famous-misc/TimeAgo');

    var users = {};

    function FeedItem(options) {
        this.options = Object.create(FeedItem.DEFAULT_OPTIONS);

        this.surface = new Surface({
            size: this.options.size,
            classes: this.options.classes
        });
        if(options) this.setOptions(options);

        this.eventInput = new EventHandler();
        this.eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        EventHandler.setOutputHandler(this, this.eventOutput);
        this.surface.pipe(this.eventInput);
    };

    FeedItem.DEFAULT_OPTIONS = {
        classes: ['feedItem'],
        size: [undefined, 80],
        content: {
            icon: undefined,
            source: undefined,
            time: undefined,
            text: ''
        }
    };

    FeedItem.prototype.setOptions = function(options) {
        if(options.classes) this.options.classes = options.classes;
        if(options.size) this.options.size = options.size;
        this.surface.setOptions({
            classes: this.options.classes,
            size: this.options.size
        });
        if(options.content) {
            this.setContent(options.content);
        };
    };

    FeedItem.prototype.setContent = function(content) {
        this.options.content = content;
        var iconEdgeSize = this.options.size[1] * 0.6;
        var iconPart = '<img src="' + content.icon + '" class="icon" width="' + iconEdgeSize + '" height="' + iconEdgeSize + '" />';
        var sourcePart = '<p class="source">' + content.source + '</p>';
        var timePart = '<p class="time">' + TimeAgo.parse(content.time) + '</p>';
        var textPart = '<p class="text">' + content.text + '</p>';
        this.surface.setContent(iconPart + timePart + sourcePart + textPart);
    };

    FeedItem.prototype.render = function() {
        return this.surface.render();
    };

    FeedItem.prototype.getSize = function() {
        return this.surface.getSize();
    };

    module.exports = FeedItem;
});
