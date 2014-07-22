define(function(require, exports, module) {
    var Entity = require('famous/Entity');
    var RenderNode = require('famous/RenderNode');
    var Matrix = require('famous/Matrix');

    /** @constructor */
    function HeaderFooterLayout(options) {
        this.options = Object.create(HeaderFooterLayout.DEFAULT_OPTIONS);
        if(options) this.setOptions(options);

        this._entityId = Entity.register(this);

        this._header = new RenderNode();
        this._footer = new RenderNode();
        this._content = new RenderNode();

        this.id = {
            'header': this._header,
            'footer': this._footer,
            'content': this._content
        };
    }

    /** @const */ HeaderFooterLayout.DIRECTION_X = 0;
    /** @const */ HeaderFooterLayout.DIRECTION_Y = 1;

    HeaderFooterLayout.DEFAULT_OPTIONS = {
        direction: HeaderFooterLayout.DIRECTION_Y,
        footerSize: 0,
        headerSize: 0
    };

    HeaderFooterLayout.prototype.render = function() {
        return this._entityId;
    };

    HeaderFooterLayout.prototype.setOptions = function(options) {
        for (var key in HeaderFooterLayout.DEFAULT_OPTIONS) {
            if(options[key] !== undefined) this.options[key] = options[key];
        }
    };

    HeaderFooterLayout.prototype.commit = function(context, transform, opacity, origin, size) {
        function _resolveNodeSize(node, defaultSize) {
            var obj = node.get();
            if(!obj || !obj.getSize) return defaultSize;
            var size = obj.getSize();
            return size[this.options.direction] || defaultSize;
        }

        function _outputTransform(offset) {
            if(this.options.direction == HeaderFooterLayout.DIRECTION_X) return Matrix.translate(offset, 0, 0);
            else return Matrix.translate(0, offset, 0);
        }

        function _finalSize(directionSize) {
            if(this.options.direction == HeaderFooterLayout.DIRECTION_X) return [directionSize, size[1]];
            else return [size[0], directionSize];
        }

        var headerSize = _resolveNodeSize.call(this, this._header, this.options.headerSize);
        var footerSize = _resolveNodeSize.call(this, this._footer, this.options.footerSize);
        var contentSize = size[this.options.direction] - headerSize - footerSize;

        var topOrigin = [0.5, 0.5];
        var bottomOrigin = [0.5, 0.5];
        topOrigin[this.options.direction] = 0;
        bottomOrigin[this.options.direction] = 1;

        var result = [
            {
                origin: topOrigin,
                size: _finalSize.call(this, headerSize),
                target: this._header.render()
            },
            {
                transform: _outputTransform.call(this, headerSize),
                origin: topOrigin,
                size: _finalSize.call(this, contentSize),
                target: this._content.render()
            },
            {
                origin: bottomOrigin,
                size: _finalSize.call(this, footerSize),
                target: this._footer.render()
            }
        ];

        transform = Matrix.move(transform, [-size[0]*origin[0], -size[1]*origin[1], 0]);

        var nextSpec = {
            transform: transform,
            opacity: opacity,
            origin: origin,
            size: size,
            target: result
        };

        return nextSpec;
    };

    module.exports = HeaderFooterLayout;
});
