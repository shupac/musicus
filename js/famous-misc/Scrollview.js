define(function(require, exports, module) {
    var Utility = require('famous/Utility');
    var EnergyHelper = require('./EnergyHelper');
    var Matrix = require('famous/Matrix');
    var EventHandler = require('famous/EventHandler');
    var GenericSync = require('famous-sync/GenericSync');
    var SequenceView = require('./SequenceView');
    var Group = require('famous/Group');
    var Entity = require('famous/Entity');

    /**
     * @constructor
     */
    function Scrollview(options) {
        this.options = {
            direction: Utility.Direction.Y,
            rails: true,
            defaultItemSize: [100, 100],
            itemSpacing: 0,
            clipSize: undefined,
            margin: undefined,
            drag: 0.001,
            friction: 0.00005,
            edgeGrip: 0.5,
            edgeFirmness: 0.0001,
            edgeDamp: 1,
            paginated: false,
            pageFirmness: 0.0002,
            pageDamp: 0.8,
            pageStopSpeed: Infinity,
            pageSwitchSpeed: 1,
            speedLimit: 10
        };

        this.energyHelper = new EnergyHelper(0);
        this.sync = new GenericSync((function() {
            return -this.getPos();
        }).bind(this), {direction: (this.options.direction == Utility.Direction.X) ? GenericSync.DIRECTION_X : GenericSync.DIRECTION_Y});
        
        this.eventInput = new EventHandler();
        this.eventOutput = new EventHandler();
        this.sync.pipe(this.eventInput);
        this.sync.pipe(this.eventOutput);

        EventHandler.setOutputHandler(this, this.eventOutput);

        this._outputFunction = undefined;
        this._masterOutputFunction = undefined;
        this.setOutputFunction(); // use default

        this.touchCount = 0;
        this.springAttached = false;
        this.currSpring = undefined;
        this._onEdge = 0; // -1 for top, 1 for bottom
        this.edgeSpringPos = undefined;
        this._touchVel = undefined;
        this._earlyEnd = false;

        // will be defined in setOptions
        this.drag = undefined;
        this.friction = undefined;
        this.edgeSpring = undefined;
        this.endSpring = undefined;

        this._masterOffset = 0; // minimize writes
        this._lastFrameNode = undefined;
        
        if(options) this.setOptions(options);
        else this.setOptions({});

        _bindEvents.call(this);

        this.group = new Group();
        this.group.link({render: _innerRender.bind(this)});

        this._entityId = Entity.register(this);
        this._contextSize = [window.innerWidth, window.innerHeight];
    }

    function _handleStart(event) {
        this.touchCount = event.count;
        if(event.count === undefined) this.touchCount = 1;
        
        _detachAgents.call(this);
        this.setVel(0);
        this._touchVel = 0;
        this._earlyEnd = false;
    }

    function _handleMove(event) {
        var pos = -event.p;
        var vel = -event.v;
        if(this._onEdge && event.slip) {
            if((vel < 0 && this._onEdge < 0) || (vel > 0 && this._onEdge > 0)) {
                if(!this._earlyEnd) {
                    _handleEnd.call(this, event);
                    this._earlyEnd = true;
                }
            }
            else if(this._earlyEnd && (Math.abs(vel) > Math.abs(this.energyHelper.getVelo()))) {
                _handleStart.call(this, event);
            }
        }
        if(this._earlyEnd) return;
        this._touchVel = vel;
        this.setPos(pos);
    }

    function _handleEnd(event) {
        this.touchCount = event.count || 0;
        if(!this.touchCount) {
            this.detachSpring(); // spring will reattach if appropriate
            _attachAgents.call(this);
            var vel = -event.v;
            var speedLimit = this.options.speedLimit;
            if(event.slip) speedLimit *= this.options.edgeGrip;
            if(vel < -speedLimit) vel = -speedLimit;
            else if(vel > speedLimit) vel = speedLimit;
            this.setVel(vel);
            this._touchVel = undefined;
        }
    }

    function _bindEvents() {
        this.eventInput.on('start', _handleStart.bind(this));
        this.eventInput.on('update', _handleMove.bind(this));
        this.eventInput.on('end', _handleEnd.bind(this));
    }

    function _attachAgents() {
        if(this.springAttached) this.attachSpring(this.currSpring);
        else this.energyHelper.setAgents([this.drag, this.friction]);
    }

    function _detachAgents() {
        this.energyHelper.setAgents([]);
    }

    function _sizeForDir(size) {
        if(!size) size = this.options.defaultItemSize;
        return size[(this.options.direction == Utility.Direction.X) ? 0 : 1];
    }

    function _normalizeState() {
        var atEdge = false;
        while(!atEdge && this.getPos() < 0) {
            var prevNode = this.node.prev ? this.node.prev() : undefined;
            if(prevNode) {
                var prevSize = prevNode.getSize ? prevNode.getSize() : this.options.defaultItemSize;
                var dimSize = _sizeForDir.call(this, prevSize) + this.options.itemSpacing;
                this.setPos(this.getPos() + dimSize);
                this._masterOffset -= dimSize;
                this.node = prevNode;
            }
            else atEdge = true;
        }
        var size = this.node.getSize ? this.node.getSize() : this.options.defaultItemSize;
        while(!atEdge && this.getPos() >= _sizeForDir.call(this, size) + this.options.itemSpacing) {
            var nextNode = this.node.next ? this.node.next() : undefined;
            if(nextNode) {
                var dimSize = _sizeForDir.call(this, size) + this.options.itemSpacing;
                this.setPos(this.getPos() - dimSize);
                this._masterOffset += dimSize;
                this.node = nextNode;
                size = this.node.getSize ? this.node.getSize() : this.options.defaultItemSize;
            }
            else atEdge = true;
        }
        if(Math.abs(this._masterOffset) > (_getClipSize.call(this) + this.options.margin)) this._masterOffset = 0;
    }

    function _handleEdge(edgeDetected) {
        if(!this._onEdge && edgeDetected) {
            this.sync.setOptions({scale: this.options.edgeGrip});
        }
        else if(this._onEdge && !edgeDetected) {
            this.sync.setOptions({scale: 1});
        }
        this._onEdge = edgeDetected;
        if(this.touchCount === 0 && this._onEdge) this.attachSpring();
    }

    function _handlePagination() {
        if(this.touchCount == 0 && !this.springAttached && !this._onEdge) {
            if(this.options.paginated && Math.abs(this.getVel()) < this.options.pageStopSpeed) {
                var nodeSize = this.node.getSize ? this.node.getSize() : this.options.defaultItemSize;

                // parameters to determine when to switch
                var velSwitch = Math.abs(this.getVel()) > this.options.pageSwitchSpeed;
                var velNext = this.getVel() > 0;
                var posNext = this.getPos() > 0.5*_sizeForDir.call(this, nodeSize);

                if((velSwitch && velNext)|| (!velSwitch && posNext)) this.nextPage();
                // no need to handle prev case since the origin is already the 'previous' page

                this.attachSpring(this.pageSpring);
            }
        }
    }

    function _setEdgeSpring(pos) {
        if(this.edgeSpringPos != pos) {
            this.edgeSpring = EnergyHelper.spring(pos, this.options.edgeFirmness, this.options.edgeDamp);
            this.edgeSpringPos = pos;
        }
    }

    function _output(node, offset, target) {
        var size = node.getSize ? node.getSize() : this.options.defaultItemSize;
        if(!size) size = this.options.defaultItemSize;
        var transform = this._outputFunction(offset);
        target.push({transform: transform, target: node.render()});
        return size[(this.options.direction == Utility.Direction.X) ? 0 : 1];
    }

    function _getClipSize() {
        if(this.options.clipSize) return this.options.clipSize;
        else return _sizeForDir.call(this, this._contextSize);
    }

    Scrollview.prototype.attachSpring = function(spring) {
        if(!spring) spring = this.edgeSpring;
        if(this.springAttached) this.detachSpring();
        _detachAgents.call(this);
        this.springAttached = true;
        this.currSpring = spring;
        this.energyHelper.addAgent(this.currSpring);
    }

    Scrollview.prototype.detachSpring = function() {
        if(!this.springAttached) return;
        this.energyHelper.removeAgent(this.currSpring);
        this.currSpring = undefined;
        this.springAttached = false;
    }

    Scrollview.prototype.emit = function(type, data) {
        if(type == 'update' || type == 'start' || type == 'end') this.eventInput.emit(type, data);
        else this.sync.emit(type, data);
    }

    Scrollview.prototype.getPos = function(node) {
        var pos = this.energyHelper.getPos();
        if(!node) return pos;
        else {
            var offset = this.offsets[node];
            if(offset !== undefined) return pos - offset;
            else return undefined;
        }
    }

    Scrollview.prototype.setPos = function(pos) {
        this.energyHelper.setPos(pos);
    }

    Scrollview.prototype.getVel = function() {
        return this.touchCount ? this._touchVel : this.energyHelper.getVelo();
    }

    Scrollview.prototype.setVel = function(vel) {
        this.energyHelper.setVelo(vel);
    }

    Scrollview.prototype.getOptions = function() {
        return this.options;
    }

    Scrollview.prototype.setOptions = function(options) {
        if(options.direction !== undefined) {
            this.options.direction = options.direction;
            if(this.options.direction === 'x') this.options.direction = Utility.Direction.X;
            else if(this.options.direction === 'y') this.options.direction = Utility.Direction.Y;
        }
        if(options.rails !== undefined) this.options.rails = options.rails;
        if(options.defaultItemSize !== undefined) this.options.defaultItemSize = options.defaultItemSize;
        if(options.itemSpacing !== undefined) this.options.itemSpacing = options.itemSpacing;
        if(options.clipSize !== undefined) this.options.clipSize = options.clipSize;
        if(options.margin !== undefined) this.options.margin = options.margin;

        if(options.drag !== undefined) this.options.drag = options.drag;
        if(options.friction !== undefined) this.options.friction = options.friction;

        if(options.edgeGrip !== undefined) this.options.edgeGrip = options.edgeGrip;
        if(options.edgeFirmness !== undefined) this.options.edgeFirmness = options.edgeFirmness;
        if(options.edgeDamp !== undefined) this.options.edgeDamp = options.edgeDamp;

        if(options.paginated !== undefined) this.options.paginated = options.paginated;
        if(options.pageStopSpeed !== undefined) this.options.pageStopSpeed = options.pageStopSpeed;
        if(options.pageSwitchSpeed !== undefined) this.options.pageSwitchSpeed = options.pageSwitchSpeed;
        if(options.pageFirmness !== undefined) this.options.pageFirmness = options.pageFirmness;
        if(options.pageDamp !== undefined) this.options.pageDamp = options.pageDamp;

        if(options.speedLimit !== undefined) this.options.speedLimit = options.speedLimit;

        if(this.options.margin === undefined) this.options.margin = 0.5*Math.max(window.innerWidth, window.innerHeight);

        this.drag = EnergyHelper.drag(this.options.drag);
        this.friction = EnergyHelper.friction(this.options.friction);
        this.edgeSpring = EnergyHelper.spring(0, this.options.edgeFirmness, this.options.edgeDamp);
        this.pageSpring = EnergyHelper.spring(0, this.options.pageFirmness, this.options.pageDamp);

        this.sync.setOptions({
            rails: this.options.rails, 
            direction: (this.options.direction == Utility.Direction.X) ? GenericSync.DIRECTION_X : GenericSync.DIRECTION_Y
        });
    }

    Scrollview.prototype.setOutputFunction = function(fn, masterFn) {
        if(!fn) {
            fn = (function(offset) {
                return (this.options.direction == Utility.Direction.X) ? Matrix.translate(offset, 0) : Matrix.translate(0, offset);
            }).bind(this);
            masterFn = fn;
        }
        this._outputFunction = fn;
        this._masterOutputFunction = masterFn ? masterFn : function(offset) {
            return Matrix.inverse(fn(-offset));
        };
    }

    Scrollview.prototype.prevPage = function() {
        var prevNode = this.node.prev ? this.node.prev() : undefined;
        if(prevNode) {
            var posMod = _sizeForDir.call(this, this.node.getSize()) + this.options.itemSpacing;
            this.setPos(this.getPos() + posMod);
            this.node = prevNode;
            for(var i in this.offsets) this.offsets[i] += posMod;
        }
        return prevNode;
    }

    Scrollview.prototype.nextPage = function() {
        var nextNode = this.node.next ? this.node.next() : undefined;
        if(nextNode) {
            var posMod = _sizeForDir.call(this, this.node.getSize()) + this.options.itemSpacing;
            this.setPos(this.getPos() - posMod);
            this.node = nextNode;
            for(var i in this.offsets) this.offsets[i] -= posMod;
        }
        return nextNode;
    }

    Scrollview.prototype.getCurrNode = function() {
        return this.node;
    }

    Scrollview.prototype.sequenceFrom = function(node) {
        if(node instanceof Array) node = new SequenceView(node);
        this.node = node;
        this._lastFrameNode = node;
    }

    Scrollview.prototype.getSize = function() {
        if(this.options.direction == Utility.Direction.X) return [_getClipSize.call(this), undefined];
        else return [undefined, _getClipSize.call(this)];
    }

    Scrollview.prototype.render = function() {
        return this._entityId;
    }

    Scrollview.prototype.commit = function(context, transform, opacity, origin, size) {
        this._contextSize = size;
        if(!this._onEdge && ((this.touchCount == 0 && !this.springAttached) || (this.touchCount > 0))) _normalizeState.call(this);
        var pos = this.getPos();
        var scrollTransform = this._masterOutputFunction(-(pos + this._masterOffset));
        return {
            transform: Matrix.moveThen([-origin[0]*size[0], -origin[1]*size[1], 0], transform),
            opacity: opacity,
            origin: origin,
            size: size,
            target: {
                transform: scrollTransform,
                origin: origin,
                target: this.group.render()
            }
        };
    }

    function _innerRender() {
        var offsets = {};
        if(this.node) {
            var pos = this.getPos();
            var result = [];

            var edgeDetected = 0; // -1 for top, 1 for bottom

            // forwards
            var offset = 0;
            var currNode = this.node;
            offsets[currNode] = 0;
            while(currNode && offset - pos < _getClipSize.call(this) + this.options.margin) {
                offset += _output.call(this, currNode, offset + this._masterOffset, result) + this.options.itemSpacing;
                currNode = currNode.next ? currNode.next() : undefined;
                offsets[currNode] = offset;
                if(!currNode && offset - pos - this.options.itemSpacing <= _getClipSize.call(this)) {
                    if(!this._onEdge) _setEdgeSpring.call(this, offset - _getClipSize.call(this) - this.options.itemSpacing);
                    edgeDetected = 1;
                }
            }

            // backwards
            currNode = (this.node && this.node.prev) ? this.node.prev() : undefined;
            offset = 0;
            if(currNode) {
                var size = currNode.getSize ? currNode.getSize() : this.options.defaultItemSize;
                offset -= _sizeForDir.call(this, size) + this.options.itemSpacing;
            }
            else {
                if(pos <= 0) {
                    if(!this._onEdge) _setEdgeSpring.call(this, 0);
                    edgeDetected = -1;
                }
            }
            while(currNode && ((offset - pos) > -(_getClipSize.call(this) + this.options.margin))) {
                offsets[currNode] = offset;
                _output.call(this, currNode, offset + this._masterOffset, result);
                currNode = currNode.prev ? currNode.prev() : undefined;
                if(currNode) {
                    var size = currNode.getSize ? currNode.getSize() : this.options.defaultItemSize;
                    offset -= _sizeForDir.call(this, size) + this.options.itemSpacing;
                }
            }

            this.offsets = offsets;

            _handleEdge.call(this, edgeDetected);
            _handlePagination.call(this);

            if(this.options.paginated && (this._lastFrameNode !== this.node)) {
                this.eventOutput.emit('pageChange');
                this._lastFrameNode = this.node;
            }

            return result;
        }
        else return;
    }

    module.exports = Scrollview;

});
