define(function(require, exports, module) { 
    var RenderNode = require('./RenderNode');
    var EventHandler = require('./EventHandler');

    function View( transformOpts ) {
        this.node = new RenderNode();

        this.eventInput = new EventHandler();
        this.eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        EventHandler.setOutputHandler(this, this.eventOutput);
    }

    View.prototype.setOptions = function(options, targetOptions) {
        if(!targetOptions) targetOptions = this.options;

        for (var key in options) {
            if (targetOptions.hasOwnProperty(key)) {
                targetOptions[key] = options[key];    
            }
        }
    }

    View.prototype._add = function() { return this.node.add.apply(this.node, arguments); }
    View.prototype._link = function() { return this.node.link.apply(this.node, arguments); }

    View.prototype.render =  function() {
        return this.node.render.apply(this.node, arguments);
    }

    View.prototype.getSize = function() {
        var target = this.node.get();
        if(target.getSize) return target.getSize.apply(target, arguments);
        else return undefined;
    }

    module.exports = View;
});
