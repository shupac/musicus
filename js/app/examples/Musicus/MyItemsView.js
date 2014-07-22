define(function(require, exports, module) {
    // Import core Famous dependencies
    var View         = require('famous/View');
    var Surface      = require('famous/Surface');
    // var RenderNode   = require('famous/RenderNode');
    var Modifier     = require('famous/Modifier');
    var EventHandler = require('famous/EventHandler');

    // Import app specific dependencies
    var MyItemsSection = require('app/examples/Musicus/MyItemsSection');
    var Tweet        = require('app/examples/Musicus/Tweet');

    function MyItemsView(options) {
        View.call(this)

        this.model = options.model;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        // this.node = new RenderNode();

        this.modifier = new Modifier({
            origin: [0.5, 0]
        });

        this.itemSurface = new Surface({
            classes: ['surface','myitem'],
            size: [245, 245]
        });

        // Bind click event to load new tweet
        // this.itemSurface.on('click', function() {
        //     var myItemsSection = new MyItemsSection({model: new Tweet(this.model.attributes)});
        //     this.eventOutput.emit('loadTweets', myItemsSection);
        // }.bind(this));

        this.template();
        this.itemSurface.pipe(this.eventOutput);
        this._link(this.modifier);
        this._link(this.itemSurface);
    }
    MyItemsView.prototype = Object.create(View.prototype);
    MyItemsView.prototype.constructor = MyItemsView;

    MyItemsView.prototype.template = function() {

        var imageWidth = 112;
        var imageHeight = 112;
        var autoplay = "";

        var tweet = '<br>'
        tweet += '<img class="myitem-image" src="' + this.model.get('imageUrl') + '" width=' + imageWidth + ' height=' + imageHeight + ' onclick="aud_play_pause(' + this.model.get('id') + ')"/>';
        tweet += '<h2 class="myitem-title">' + this.model.get('artist') + '</h2>';
        tweet += '<h2 class="myitem-subtitle">' + this.model.get('title') + '</h2>';

        this.itemSurface.setContent(tweet);

        window.aud_play_pause = function(id) {
          var myAudio = document.getElementById(id);
          if (myAudio.paused) {
            myAudio.play();
          } else {
            myAudio.pause();
          }
        };
    }

    module.exports = MyItemsView;
});