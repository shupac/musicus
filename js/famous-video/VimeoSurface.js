define(function(require, exports, module) {
    var FamousSurface = require('famous/Surface');

    /**
     * @class An object designed to contain surfaces, and set properties
     *   to be applied to all of them at once.
     *
     * @description 
     *   
     * @name VimeoSurface
     * @extends FamousSurface
     * @constructor
     */
    function VimeoSurface(opts) {
        this.opts = {
            autoplay    : false,
            loop        : false,
            controls    : false,
            vimeoId     : '',
            useAPI      : true
        };

        this.setOpts(opts); 
        FamousSurface.apply(this, arguments);

        this._loaded = false;
        this._dirty = false;

        if(this.opts.useAPI) { 

            var tag = document.createElement('script');
            tag.src = 'http://a.vimeocdn.com/js/froogaloop2.min.js';
            document.body.appendChild(tag);

            tag.addEventListener('load', (function () {

                this._loaded = true; 
                initAPI.call(this);

            }).bind(this));
        }
    }

    VimeoSurface.prototype = Object.create(FamousSurface.prototype);
    VimeoSurface.counter = 0;
    VimeoSurface.prototype.elementType = 'iframe';
    VimeoSurface.prototype.elementClass = 'surface';

    VimeoSurface.prototype.setOpts = function (opts) {
        for (var key in opts) {
            this.opts[key] = opts[key];
        }
    };

    VimeoSurface.prototype.deploy = function(target) {
        target.classList.add('vimeo-player');
        var params = '?' + queryString({ 
            title: 1,
            byline: 1,
            api: 1,
            player_id: 'vimeo-' + this.opts.vimeoId,
            controls: this.opts.controls ? 1 : 0,
            autoplay: this.opts.autoplay ? 1 : 0
        });
        target.id = 'vimeo-' + this.opts.vimeoId;
        target.src = 'http://player.vimeo.com/video/' + this.opts.vimeoId + params;  
        target.width = this.size[0] + 'px';
        target.height = this.size[1] + 'px';

        target.style.display = '';
        target.style.border = 0;
    };

    VimeoSurface.prototype.recall = function(target) {
        target.src = '';
        target.style.display = 'none';
    };
    

    // Video API
    /**
     * Setup Modifiers
     */

    VimeoSurface.prototype.play = function () {     
        callAPI.call(this, 'play');
    };

    VimeoSurface.prototype.pause = function () {
        callAPI.call(this, 'pause');
    };

    VimeoSurface.prototype.unload = function () {
        callAPI.call(this, 'unload');
    };

    VimeoSurface.prototype.finish = function () {
        callAPI.call(this, 'finish');
    };

    /**
     *  Seek to a time in seconds. 
     * @name VimeoSurface#seekTo
     * @param {int} time :  in seconds.
     */
    VimeoSurface.prototype.seekTo = function (time) {
        callAPI.call(this, 'seekTo', time);
    };

    /**
     * Set the volume of the video.
     * @name VimeoSurface#setVolume
     * @param {volume} volume : volume as a percentage between 0 and 1.
     */
    VimeoSurface.prototype.setVolume = function (volume) {
        callAPI.call(this, 'setVolume', volume);
    };

    VimeoSurface.prototype.render = function() {
        if(this._dirty) {
            initAPI.call(this);
        }
        return this.id;
    };    

    /**
     * Setup Getters
     */
    VimeoSurface.prototype.getCurrentTime = function (callback) {
        callAPI.call(this, 'getCurrentTime', function(e) {        
            callback(e);
        });
    };    
    VimeoSurface.prototype.getDuration = function (callback) {
        callAPI.call(this, 'getDuration', function(e) {        
            callback(e);
        });
    };
    VimeoSurface.prototype.getVideoEmbedCode = function (callback) {
        callAPI.call(this, 'getVideoEmbedCode', function(e) {
            callback(e);
        });
    };
    VimeoSurface.prototype.getVideoHeight = function (callback) {
        callAPI.call(this, 'getVideoHeight', function(e) {
            callback(e);
        });
    };
    VimeoSurface.prototype.getVideoWidth = function (callback) {
        callAPI.call(this, 'getVideoWidth', function(e) {
            callback(e);
        });
    };
    VimeoSurface.prototype.getVideoUrl = function (callback) {
        callAPI.call(this, 'getVideoUrl', function(e) {
            callback(e);
        });
    };
    VimeoSurface.prototype.getColor = function (callback) {
        callAPI.call(this, 'getColor', function(e) {
            callback(e);
        });
    };
    VimeoSurface.prototype.paused = function (callback) {
        callAPI.call(this, 'paused', function(e) {
            callback(e);
        });
    };
    /**
     * Sets the hex color of the player. Accepts both short and long hex codes.
     * @name VimeoSurface#setColor
     * @param {string} color : hex code for color
     */
    VimeoSurface.prototype.setColor = function (color) {
        callAPI.call(this, 'setColor', color);
    };

    /**
     * Toggles loop on or off.
     * @name VimeoSurface#setLoop
     * @param {boolean} loop : loops the video if set to true
     */
    VimeoSurface.prototype.setLoop = function (loop) {
        callAPI.call(this, 'setLoop', loop);
    };    

    /**
     * Sets the volume of the player. Accepts a number between 0 and 1.
     */
    VimeoSurface.prototype.getVolume = function (callback) {
        callAPI.call(this, 'getVolume', function(e) {
            callback(e);
        });
    };
    /**
     * Sets the volume of the player.
     * @name VimeoSurface#setVolume
     * @param {number} volume : Accepts a number between 0 and 1.
     */
    VimeoSurface.prototype.setVolume = function (volume) {
        callAPI.call(this, 'setVolume', volume);
    };

    
        
    /*
     *  @private
     */
    function callAPI(evt, arg) {
        if(this.player) {
            this.player.api(evt, arg);
        }
    }
    /*
     *  @private
     */
    function queryString(params) {
        var array = [];
        for (var key in params) {
            if(params.hasOwnProperty(key)) { 
                array.push( encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
        }
        return array.join('&');
    }

    function initAPI() {
        if(this._currTarget) { 

            var currTarget = this._currTarget;
            this.player = window.$f( currTarget );

            this.player.addEvent('ready', (function () {

                this.emit('playerReady', {value: this.player}); 
                this.player.addEvent('play', this.emit.bind(this, 'play'));
                this.player.addEvent('playProgress', this.emit.bind(this, 'playProgress'));
                this.player.addEvent('finish', this.emit.bind(this, 'finish'));
                this.player.addEvent('pause', this.emit.bind(this, 'pause'));
                
            }).bind(this));

            this._dirty = false;

        } else { 

            this._dirty = true;
        }
    }

    
    module.exports = VimeoSurface;
});