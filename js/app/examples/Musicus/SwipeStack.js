define(function(require, exports, module) {
    // Import core Famous dependencies
    var View                = require('famous/View');
    var Util                = require('famous/Utility');
    var Surface             = require('famous/Surface');
    var LightBox            = require('famous-misc/LightBox');
    var EventHandler        = require('famous/EventHandler');
    var FM                  = require('famous/Matrix');
    var RenderNode          = require('famous/RenderNode');
    var Modifier            = require('famous/Modifier');
    var Timer               = require('famous-misc/Timer');

    // Famous physics
    var Tracker             = require('famous-physics/utils/PhysicsTracker');
    var RectangleParticle   = require('famous-physics/bodies/Rectangle');
    var Physics             = require('famous-physics/PhysicsEngine');
    var Spring              = require('famous-physics/forces/Spring');
    var TorqueSpring        = require('famous-physics/forces/TorqueSpring');
    var Drag                = require('famous-physics/forces/Drag');
    var RotDrag             = require('famous-physics/forces/rotationalDrag');
    var VectorField         = require('famous-physics/forces/VectorField');
    var Vector              = require('famous-physics/math/Vector');
    var FamousEngine        = require('famous/Engine');

    function SwipeStack(collection, Card, options) {
        View.call(this);
        if(!collection) {
            throw "swipe stack needs collection"
        }

        this.collection = collection;
        this.Card = Card;
        this.physics = new Physics();

        this.opts = {
            swipeTolerance: 100,
            numCardsInQueue: 3,             // number of cards prepared in advance
            cardOffsetZ: 400,              // z-offset of cards behind top card
            cardOffsetY: -15,               // y-offset of cards behind top card
            stackWindowOffset: 0,
            particleOrigin: [0, 150, 0],
            transDuration: 300
        };

        fbRef.child('settings').child('autoplay').on('value', function(val) {
            this.autoPlay = val.val();
        }.bind(this));

        if(options) this.setOpts(options);

        var drag = new Drag({strength : .008});
        var rotDrag = new RotDrag({strength : 1});

        fbRef.child('settings').child('rotDrag').on('value', function(val) {
            if(val.val()) {
                rotDrag.setOpts({strength: val.val()});
            }
        });

        this.physics.attach(drag);
        this.physics.attach(rotDrag);

        FamousEngine.on('prerender', function(){
            this.physics.step();
        }.bind(this));
    };

    SwipeStack.prototype = Object.create(View.prototype);
    SwipeStack.prototype.constructor = SwipeStack;

    SwipeStack.prototype.setOpts = function(options) {
        for(var key in options) {
            this.opts[key] = options[key];
        }
    };

    SwipeStack.prototype.getSwipedCard = function() {
        return this.swipedCard;
    };

    SwipeStack.prototype.getCurrentCard = function() {
        return this.currentCard;
    };

    SwipeStack.prototype.getCardsQueue = function() {
        return this.cardsQueue;
    };

    SwipeStack.prototype.initialize = function() {
        // this.buildCardsQueue(Math.floor(Math.random()*this.collection.models.length));
        this.buildCardsQueue();
        this.buildParticlesQueue();
        this.createTracker();
        this.trackCard(this.currentCard);
    };

    SwipeStack.prototype.buildCardsQueue = function(start) {
        this.cardsQueue = [];
        this.viewArray = [];

        //pos is used to determine the position, can't use start for non-0 start
        start = start || 0;
        this.currentItemIndex = start;
        if(start) {
            this.currentItemIndex = start;
        } else {
            this.currentItemIndex = 0;
            start = 0;
        }

        for(var i = 0; i < this.opts.numCardsInQueue; i++){
            this.pushCard(this.collection.models[start+i], i);
        }
        this.currentCard = this.cardsQueue[0];
    };

    SwipeStack.prototype.pushCard = function(model, offset) {
        if(!model) return; // TODO clean up logic to build cards
        var renderNode = new RenderNode();
        var modifier = new Modifier({
            transform: FM.translate(0, this.opts.cardOffsetY*offset, 
                this.opts.cardOffsetZ*(this.opts.numCardsInQueue-offset-1)+3)
        });
        var cardView = new this.Card({model: model});
        cardView.pipe(this.eventOutput);

        var card = {
            cardView: cardView,
            renderNode: renderNode,
            modifier: modifier
        };

        renderNode.link(modifier).link(cardView);
        this.cardsQueue.push(card);

        this.viewArray.push(cardView);
        return card;
    };

    SwipeStack.prototype.buildParticlesQueue = function() {
        this.particlesQueue = [];
        for(var i = 0; i < this.opts.numCardsInQueue; i++) {
            var node = new RenderNode();
            var modifier = new Modifier({
                // transform: FM.translate(0, this.opts.cardOffsetY*i, this.opts.cardOffsetZ*i),
                origin: [0.5, 0]
            });
            var particle = new RectangleParticle({
                size : [250, 250],
                p : this.opts.particleOrigin
            });
            this.physics.addBody(particle);
            node.link(modifier).link(particle);
            this._add(node);
            particle.link(this.cardsQueue[i].renderNode);
            this.particlesQueue.push(particle);
        }
        this.currentParticle = this.particlesQueue[0];
    };

    SwipeStack.prototype.createTracker = function() {
        this.tracker = new Tracker(this.currentParticle, {
            scale : 1,
            torque : {strength : .005}
        });

        var torqueID = undefined;
        var springID = undefined;
        var touchEnable;

        this.tracker.pipe(this.eventOutput);
        this.tracker.on('start', function(data){ // update called upon drag
            if (torqueID !== undefined) {
                this.physics.detach(torqueID);
                // console.log('torque detached')
                torqueID = undefined;
            }
            if (springID !== undefined) {
                this.physics.detach(springID);
                // console.log('center detached')
                springID = undefined;
            }
            this.flippable = true;
        }.bind(this));

        this.tracker.on('update', function(data) {
            var displacement = Math.sqrt(data.p[0] * data.p[0] + data.p[1] * data.p[1]);
            if(displacement > 2) {
                this.flippable = false;
            }
        }.bind(this));

        var torqueSpring = new TorqueSpring({
            anchor : [0,0,0],
            period : 1.5,
            dampingRatio : 30
        });

        var centerSpring = new Spring({
            anchor : this.opts.particleOrigin,
            period : 500,
            dampingRatio : 0.5
        });

        this.tracker.on('end', function(data){ // updated on end
            var v = this.currentParticle.getVel();
            if (data.p[0] >= this.opts.swipeTolerance) {
                // console.log('swipe right');
                this.currentParticle.setVel([2, v[1], 0]);
                this.advanceItem(true);
                this.eventOutput.emit('swipeRight');
            } else if(data.p[0] <= -this.opts.swipeTolerance) {
                // console.log('swipe left');
                this.currentParticle.setVel([-2, v[1], 0]);
                this.advanceItem(false);
                this.eventOutput.emit('swipeLeft');
            } else {
                torqueID = this.physics.attach(torqueSpring, this.currentParticle);
                springID = this.physics.attach(centerSpring, this.currentParticle);
                // console.log('springs attached');
                if(this.flippable) {
                    this.currentCard.cardView.flip();
                }
                return;
            }
        }.bind(this));


        // FOR TESTING
        this.swipeLeft = function() {
            var v = this.currentParticle.getVel();
            this.currentParticle.setVel([-3, v[1], 0]);
            this.advanceItem(false);
            this.eventOutput.emit('swipeLeft');
        }.bind(this);
    };

    SwipeStack.prototype.advanceItem = function(like) {
        this.lastParticle = this.particlesQueue.shift();
        this.currentParticle = this.particlesQueue[0];
        this.particlesQueue.push(this.lastParticle);

        this.swipedCard = this.cardsQueue.shift();
        this.currentCard = this.cardsQueue[0];
        this.swipedCard.liked = like;

        if(!this.cardsQueue.length) return;
        this.trackCard(this.currentCard);

        Timer.setTimeout(function() {
            this.swipedCard.modifier.setTransform(FM.translate(9999, 0, 0));
            this.lastParticle.replace(null);
            this.resetParticle(this.lastParticle);

        }.bind(this), 50);

        for(var i = 0; i < this.cardsQueue.length; i++) {
            this.cardsQueue[i].modifier
            .setTransform(FM.translate(0, i*this.opts.cardOffsetY, this.opts.cardOffsetZ*(this.opts.numCardsInQueue-i-1)+3), {
                duration: this.opts.transDuration,
                curve: 'easeOut'
            });
        }


        var addItemIndex = this.currentItemIndex + this.opts.numCardsInQueue;
        if(!this.collection.models[addItemIndex]) {
            this.lastCard = null;
            return;
        }
        this.lastCard = this.pushCard(this.collection.models[addItemIndex], this.opts.numCardsInQueue-1);
            this.currentItemIndex++;
        // // executed only where there are additional models in the collection
        Timer.setTimeout(function(){
            if(this.lastCard === null) return;
            this.lastParticle.replace(this.lastCard.renderNode);
        }.bind(this), this.opts.transDuration);
    };

    SwipeStack.prototype.trackCard = function(card) {
        this.tracker.particle = this.currentParticle;
        var topCardView = card.cardView;
        this.currentParticle.replace(card.renderNode);

        topCardView.pipe(this.tracker);
        topCardView.on('touchstart', function(e) {
            var center = [window.innerWidth/2, this.opts.stackWindowOffset + this.opts.particleOrigin[1], 0];
            var location = [e.pageX - center[0], center[1] - e.pageY, 0];

            this.tracker.setOpts({
                torque: {
                    anchor: location
                }
            });
        }.bind(this));
    };

    SwipeStack.prototype.resetParticle = function(particle) {
        particle.reset(this.opts.particleOrigin, [0, 0, 0]);
        // TODO: reset angular velocity and rotation
    };

    SwipeStack.prototype.unpipeCard = function() {
        // debugger
        // if(this.currentCard) 
            this.currentCard.cardView.unpipe(this.tracker);
    };

    SwipeStack.prototype.pipeCard = function() {
        // if(this.currentCard) 
        this.currentCard.cardView.pipe(this.tracker);
    };

    module.exports = SwipeStack;
});
