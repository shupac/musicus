define(function(require, exports, module) {    
    var Surface = require('famous/Surface');

    function Label ( opts ) {
        this.options = { 
            size: undefined,  
            content: '',
            properties: { 
                'border-bottom': '1px solid white'
            }
        }
        this._dirty = true;

        for( var key in opts ) this.options[ key ] = opts[key];
        this.surface;
    }

    Label.prototype.init = function () {
        this.surface = new Surface({
            size: this.options.size,
            content: '<p >' + this.options.content + '</p>',
            classes: this.options.classes,
            properties: this.options.properties
        });
    }
    Label.prototype.setSize = function (size) {
        this.options.size = [size[0], 0];
    }
    Label.prototype.getSize = function () {
       return this.options.size ? this.options.size : undefined;
    }
    Label.prototype.pipe = function (target) {
       return this.surface.pipe( target );
    }
    Label.prototype.render = function () {
        if( this._dirty ) { 
            if( this.surface._currTarget ) {
                this.options.size = [
                    this.options.size[0],
                    this.surface._currTarget.firstChild.clientHeight
                ]
                this.surface.setSize( this.options.size );
                
                this._dirty = false;
            }
        }
        return this.surface.render();
    }

    module.exports = Label;
});
