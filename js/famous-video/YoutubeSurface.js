define(function(require, exports, module) {
    var FamousSurface = require('famous/Surface');

    /**
     * @class Youtube Surface 
     *
     * @description 
     *  A youtube surface that uses youtube's iFrame api. 
     *   
     * @name YoutubeSurface
     * @extends FamousSurface
     * @constructor
     * @example
     *      // adding to the render tree
     *      var mainNode = new RenderNode();
     *      var videoSurface = new YoutubeSurface({
     *          size: [640, 360],
     *          youtubeId: 'QH2-TGUlwu4' 
     *      });
     *      mainNode.link(videoSurface);
     * @example
     *      // get the instantiated youtube player object to use youtube's api.
     *      var videoSurface = new YoutubeSurface({
     *          size: [640, 360],
     *          youtubeId: 'QH2-TGUlwu4' 
     *      });
     *      var myYoutubePlayer;
     *      videoSurface.on('playerReady', function (e) {
     *          myYoutubePlayer = e.value; 
     *
     *      }
     *      
     *      
     */
    function YoutubeSurface(opts) {
        this.opts = {
            autoplay    : false,
            loop        : false,
            controls    : true,
            youtubeId   : '',
            useAPI      : true
        }
        this.setOpts(opts); 

        this.player = undefined;

        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
        window.onYouTubeIframeAPIReady = _youtubeLoaded.bind(this);

        FamousSurface.apply(this, arguments);
    };

    YoutubeSurface.prototype = Object.create(FamousSurface.prototype);
    YoutubeSurface.prototype.elementType = 'div';
    YoutubeSurface.prototype.elementClass = 'surface';
    YoutubeSurface.prototype.setOpts = function (opts) {
        for (var key in opts) {
            this.opts[key] = opts[key];
        }
    }
    YoutubeSurface.prototype.deploy = function(target) {
        target.classList.add('youtube-player');
        this._youtubeId = 'youtube-surface-' + this.id;
        target.innerHTML = '<div id="' + this._youtubeId + '"></div>';
        target.style.display = '';
    };

    YoutubeSurface.prototype.recall = function(target) {
        target.src = '';
        target.style.display = 'none';
    };
    YoutubeSurface.prototype.getPlayer = function () {
        return this.player; 
    }

    // Video API
    YoutubeSurface.prototype.play = function () {
        if(this.player) this.player.playVideo();
    }
    YoutubeSurface.prototype.pause = function () {
        if(this.player) this.player.pauseVideo();
    }
    YoutubeSurface.prototype.unload = function () {
        if(this.player) this.player.stopVideo();
    }
    /**
     *  Seek to a time in seconds. 
     * @name YoutubeSurface#seekTo
     * @param {int} time in seconds.
     * @param allowSeekAhead The allowSeekAhead parameter determines whether the player will make a new request to the server if the seconds parameter specifies a time outside of the currently buffered video data.
     */
    YoutubeSurface.prototype.seekTo = function (time, allowSeekAhead) {
        if(typeof allowSeekAhead == 'undefined') allowSeekAhead = false;
        if(this.player) this.player.seekTo(time, allowSeekAhead);
    }
    /**
     * Set the volume of the video.
     * @name YoutubeSurface#setVolume
     * @param {volume} volume : volume as a percentage between 0 and 1.
     * @param allowSeekAhead The allowSeekAhead parameter determines whether the player will make a new request to the server if the seconds parameter specifies a time outside of the currently buffered video data.
     */
    
    YoutubeSurface.prototype.setVolume = function (volume) {
        if(this.player) this.player.setVolume(volume);
    }
    /*
     *  @private
     */
    function _youtubeLoaded () {
        var params = {
            enablejsapi: 1,
            version: 2,
            iv_load_policy: 3,
            html5: 1,
            disablekb: 0,   
            wmode: 'transparent',
            controls: this.opts.controls ? 1 : 0,
            showinfo: 0,
            modestbranding: 1,
            rel: 0,
            autoplay: this.opts.autoplay ? 1 : 0,
            loop: this.opts.loop ? 1 : 0
        };
        this.player = new YT.Player(this._youtubeId, { 
            videoId: this.opts.youtubeId,
            width: this.size[0],
            height: this.size[1],
            events: {
                'onReady': this.emit.bind(this, 'onReady'),
                'onStateChange': this.emit.bind(this, 'onStateChange'),
                'onPlaybackQualityChange': this.emit.bind(this, 'onPlaybackQualityChange'),
                'onError': this.emit.bind(this, 'onError'),
            }
        });
        this.emit('playerReady', { value: this.player });

        this.contentDirty = true;
    }
    
    module.exports = YoutubeSurface;
});
