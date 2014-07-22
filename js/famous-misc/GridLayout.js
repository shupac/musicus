define(function(require, exports, module) {
    var Entity = require('famous/Entity');
    var RenderNode = require('famous/RenderNode');
    var Matrix = require('famous/Matrix');
    var SequenceView = require('famous-misc/SequenceView');

    /** @constructor */
    function GridLayout(options) {
        this.options = {
            size: [1, 1]
        };
        if(options) this.setOptions(options);

        this.id = Entity.register(this);
    }

    GridLayout.prototype.render = function() {
        return this.id;
    };

    GridLayout.prototype.setOptions = function(options) {
        if(options.size !== undefined) this.options.size = options.size;
    };

    GridLayout.prototype.sequenceFrom = function(sequence) {
        if(sequence instanceof Array) sequence = new SequenceView(sequence);
        this.sequence = sequence;
    };

    GridLayout.prototype.commit = function(context, transform, opacity, origin, size) {
        var rows = this.options.size[1];
        var cols = this.options.size[0];

        var rowSize = Math.round(size[1] / rows);
        var colSize = Math.round(size[0] / cols);

        var sequence = this.sequence;
        var result = [];
        for(var i = 0; i < rows; i++) {
            for(var j = 0; j < cols; j++) {
                if(sequence) {
                    var item = sequence.get();
                    if(item) {
                        result.push({
                            transform: Matrix.translate(colSize * j, rowSize * i),
                            size: [colSize, rowSize],
                            target: item.render()
                        });
                    }
                    sequence = sequence.next();
                }
            }
        }

        if(size) transform = Matrix.move(transform, [-size[0]*origin[0], -size[1]*origin[1], 0]);
        var nextSpec = {
            transform: transform,
            opacity: opacity,
            origin: origin,
            size: size,
            target: result
        };
        return nextSpec;
    };

    module.exports = GridLayout;
});
