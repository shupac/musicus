define(function(require, exports, module) {  	
    var Engine = require('famous/Engine');
    var View = require('famous/View');
 	var Surface = require('famous/Surface'); 
    var Modifier = require('famous/Modifier');
    var Easing = require('famous-animation/Easing');
 	var FM = require('famous/Matrix');  	

    /*
     *  Assumes [0,0] origin!
     *  Widget to give some visual feedback on clicks.
     */
    function FeedbackBase () {
        View.apply(this, arguments);
        this.eventInput.pipe( this.eventOutput );

        this._inTransition = [];
        this.content = [];

        this.on('mousedown', this._feedback.bind(this));
        this.on('touchstart', this._feedback.bind(this));
    }

    FeedbackBase.prototype = Object.create(View.prototype);
	FeedbackBase.prototype.constructor = FeedbackBase;

    // overwritten by children 
    FeedbackBase.DEFAULT_OPTIONS = { }


    // to be overwritten by children
    FeedbackBase.prototype.create = function  () { }

    FeedbackBase.prototype.setContentRef = function ( reference ) {
        this._contentRef = reference; 
    }

    FeedbackBase.prototype._feedback = function ( e ) {

        var index = this.getAvailable();
        var pos = [e.pageX, e.pageY];
        
        if( !this.content[index] ) {
            this._inTransition.push( false );
            this.create();
        }

        this._triggerAnimation( pos, index );
    }

    FeedbackBase.prototype._triggerAnimation = function  ( pos, index ) {

        this._inTransition[index] = true;

        this._callback =  (function  () {

            this._inTransition[index] = false;

        }).bind( this, index );

        this.animate( pos, index, this._callback );
    }

    /*
     * get first not currently animating
     */
    FeedbackBase.prototype.getAvailable = function () {
        for (var i = 0; i < this._inTransition.length; i++) {
            if( !this._inTransition[i] ) {
                return i;
            }
        };
        return this._inTransition.length;
    }


    module.exports = FeedbackBase;
});
