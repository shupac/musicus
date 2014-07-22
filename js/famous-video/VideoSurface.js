define(function(require, exports, module) {
    var FamousSurface = require('./Surface');

    /**
     * @class An object designed to contain surfaces, and set properties
     *   to be applied to all of them at once.
     *
     * @description 
     *  * A container surface will enforce these properties on the 
     *   surfaces it contains:
     *     * size (clips contained surfaces to its own width and height)
     *     * origin
     *     * its own opacity and transform, which will be automatically 
     *       applied to  all Surfaces contained directly and indirectly.
     *   These properties are maintained through a {@link 
     *   FamousSurfaceManager} unique to this Video Surface.
     *   Implementation note: in the DOM case, this will generate a div with 
     *   the style 'containerSurface' applied.
     *   
     * @name FamousVideoSurface
     * @extends FamousSurface
     * @constructor
     */
    function FamousVideoSurface(opts) {
        if(!opts) opts = {};

        this.autoplay   = opts.autoplay || false;
        this.videoUrl   = undefined;
        this.loop       = opts.loop || false;
        this.muted      = opts.muted || false;
        this.poster     = opts.poster || '';
        this.preload    = opts.preload || 'auto';
        this.controls   = opts.controls || true;

        FamousSurface.apply(this, arguments);
    };

    FamousVideoSurface.surfaceEvents = ['play', 'pause', 'abort', 'canplay', 'canplaythrough', 'durationchange', 'ended', 'error', 'loadeddata', 'loadedmetadata', 'loadstart', 'playing', 'progress', 'ratechange', 'seeked', 'seeking', 'timeupdate', 'volumechange', 'waiting'];
    FamousVideoSurface.prototype = Object.create(FamousSurface.prototype);
    FamousVideoSurface.prototype.elementType = 'video';
    FamousVideoSurface.prototype.elementClass = 'surface';

    FamousVideoSurface.prototype.setContent = function(videoUrl) {
        this.videoUrl = videoUrl;
        this.contentDirty = true;
    };
    // Still missing: captions / text
    FamousVideoSurface.prototype.deploy = function(target) {
        target.src = this.videoUrl;
        target.style.display = '';
        target.autoplay = this.autoplay;
        target.poster = this.poster;
        target.loop = this.loop;
        target.muted = this.muted;
        target.preload = this.preload;
        target.controls = this.controls;

        _bindEvents.call(this, target);
    };

    FamousVideoSurface.prototype.recall = function(target) {
        target.src = '';
        target.style.display = 'none';
    };
    
    FamousVideoSurface.prototype.play = function() {
        if(this._currTarget) 
            this._currTarget.play();
    };
    FamousVideoSurface.prototype.pause = function() {
        if(this._currTarget) 
            this._currTarget.pause();
    };
    FamousVideoSurface.prototype.getVolume = function() {
        if(this._currTarget) 
            return this._currTarget.volume;
    };
    FamousVideoSurface.prototype.setVolume = function(val) {
        if(this._currTarget) 
            this._currTarget.volume = Math.min( Math.max(0, val), 1);
    }; 
    FamousVideoSurface.prototype.seekTo = function(time) {
        if(this._currTarget) { 
            if(!time < 0 || !time > this._currTarget.duration) 
                this._currTarget.currentTime = time; 
        }
    };    

    function _bindEvents(target) {
        var eventTypes = FamousVideoSurface.surfaceEvents;
        for(var i = 0; i < eventTypes.length; i++) {
            target.addEventListener(eventTypes[i], this.eventForwarder);
        }
    };
    
    module.exports = FamousVideoSurface;
});
