define(function(require, exports, module) {
    var Utility = require('famous/Utility');
    var EventHandler = require('famous/EventHandler');
    var GridLayout = require('famous-misc/GridLayout');
    var ToggleButton = require('./ToggleButton');

    function NavBar(options) {
        this.options = Object.create(NavBar.DEFAULT_OPTIONS);

        this.layout = new GridLayout();
        this.buttons = [];
        this._buttonIds = {};

        if(options) this.setOptions(options);

        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.layout.sequenceFrom(this.buttons);
    };

    NavBar.DEFAULT_OPTIONS = {
        sections: [],
        widget: ToggleButton,
        size: [undefined, 50],
        look: {
            direction: Utility.Direction.X
        },
        feel: undefined
    };

    function _resolveGridDimensions(count, direction) {
        if(direction === Utility.Direction.X) return [count, 1];
        else return [1, count];
    };

    function _prepareButton(id) {
        var i = this.buttons.length;
        this._buttonIds[id] = i;
        var def = this.options.sections[id];
        var widget = this.options.widget;
        var button = new widget();
        if(this.options.feel) button.setOptions(this.options.feel);
        if(this.options.look) button.setOptions(this.options.look); 
        button.setOptions(def);
        button.setOptions({toggleMode: ToggleButton.ON});
        button.on('select', this.select.bind(this, id));
        this.buttons[i] = button;
    };

    NavBar.prototype.select = function(id) {
        var btn = this._buttonIds[id];
        // this prevents event loop
        if(this.buttons[btn] && this.buttons[btn].isSelected()) {
            this.eventOutput.emit('select', {id: id});
        }
        else {
            this.buttons[btn] && this.buttons[btn].select();
        }

        for(var i = 0; i < this.buttons.length; i++) {
            if(i != btn) this.buttons[i].deselect();
        }
    };

    NavBar.prototype.setOptions = function(options) {
        if(options.widget !== undefined) {
            this.options.widget = options.widget;
        }
        if(options.look !== undefined) {
            this.options.look = options.look;
            this.layout.setOptions({size: _resolveGridDimensions.call(Object.keys(this.options.sections).length, this.options.look.direction)});
        }
        if(options.feel !== undefined) {
            this.options.feel = options.feel;
            for(var i in this.buttons) {
                this.buttons[i].setOptions(this.options.feel);
            }
        }
        if(options.sections !== undefined) {
            this.options.sections = options.sections;
            this.layout.setOptions({size: _resolveGridDimensions(Object.keys(this.options.sections).length, this.options.look.direction)});
            for(var id in this.options.sections) {
                if(!(id in this._buttonIds)) _prepareButton.call(this, id);
            }
        }
    };

    NavBar.prototype.getSize = function() {
        return this.options.size;
    };

    NavBar.prototype.render = function() {
        return this.layout.render()
    };

    module.exports = NavBar;

});
