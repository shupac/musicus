define(function(require, exports, module) {
    var VimeoSurface = require('./VimeoSurface');

    // Frame Counter    
    var vimeoCurrentFrm = 0;
    var vimeoPreviousFrm = vimeoCurrentFrm;    
    var fCurrentTime = 0;
    var fPrevTime = 0;
    var famousCurrentFrm = 0;
    var avgFrmDiff = 0;
    var fAvgTimeDiff = 0;         

    /**
     * @class An object designed to contain surfaces, and set properties
     *   to be applied to all of them at once.
     *
     * @description 
     *   
     * @name VimeoSurfacePlus
     * @extends VimeoSurface
     * @constructor
     */
    function VimeoSurfacePlus(fps) {
        VimeoSurface.apply(this, arguments);
        this.fps = fps;
    }

    VimeoSurfacePlus.prototype = Object.create(VimeoSurface.prototype);
    VimeoSurfacePlus.prototype.constructor = VimeoSurfacePlus;


    /**
     * playerProgress plays off of Vimeo's playProgress method which is called every ~250 milliseconds
     * @name VimeoSurfacePlus#playerProgress
     * @param {object} obj : Contains duration, origin (FamousSurface), percent and seconds
     */
    VimeoSurfacePlus.prototype.playerProgress = function( obj )
    {
        // obj parameters: duration, percent, seconds
        // NOTE: obj.seconds includes a decimal point from .00 - .99. Multiple the fps by this # 
        // and Math.floor it to get the current frame number
        var secs = Math.floor(obj.seconds);
        var frms = Math.floor((obj.seconds%1) * this.fps);
        vimeoCurrentFrm = ((secs*this.fps)+frms);
    };

    /**
     *  Jump to a specific second.
     * @name VimeoSurfacePlus#jumpToSecond
     * @param {second} second : second is a float where the decimal is between .0 - .9
     */
    VimeoSurfacePlus.prototype.jumpToSecond = function (second) {
        this.seekTo(second);
    };

    /**
     *  Jump to a specific a specic frame.
     * @name VimeoSurfacePlus#jumpToFrame
     * @param {fps} fps : fps is a float and is used to convert frames to seconds
     * @param {frame} frame : frame is an integer starting at 0.
     */
    VimeoSurfacePlus.prototype.jumpToFrame = function (fps, frame) {
        var seconds = frame / fps;
        this.seekTo(seconds);
    };

    /**
     * getCurrentFrame resolves the fact that Vimeo's playProgress only fires ~4x / seconds
     * but to have smooth animations between FamousSurface and the Vimeo video that are frame accurate, 
     * the 2 timelines (Vimeo + Famous) need to be tracked and synchronized.
     * @name VimeoSurfacePlus#getCurrentFrame
     */     
    // VimeoSurfacePlus.prototype.getCurrentFrame = function(vimeoCurrentFrm, vimeoPreviousFrm) {
    VimeoSurfacePlus.prototype.getCurrentFrame = function() {
        if (vimeoCurrentFrm != vimeoPreviousFrm)
        {
            //Frames between both timers will be the same
            //Calculate the average Vimeo Frame Differences
            avgFrmDiff = vimeoCurrentFrm-vimeoPreviousFrm;
            vimeoPreviousFrm = vimeoCurrentFrm;

            //Calculate the average times Famous fires
            fAvgTimeDiff = fCurrentTime-fPrevTime;
            fPrevTime = fCurrentTime;
            
            famousCurrentFrm = vimeoCurrentFrm;
            return [Math.floor(famousCurrentFrm), true, vimeoCurrentFrm];
        } else {
            //Famous will fill in the gaps in frames caused by the delay in Vimeo's playProgress
            fCurrentTime++;
            var fcf = famousCurrentFrm+(avgFrmDiff/fAvgTimeDiff);
            if (fcf > 0) { 
                famousCurrentFrm = fcf;
                return [Math.floor(famousCurrentFrm), true, vimeoCurrentFrm];
            }   
        }
    };        
    
    module.exports = VimeoSurfacePlus;
});