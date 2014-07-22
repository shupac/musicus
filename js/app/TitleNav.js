define(function(require, exports, module) {
    var Matrix = require('famous/Matrix');
    var Surface = require('famous/Surface');
    var LightBox = require('famous-misc/LightBox');
    var EventHandler = require('famous/EventHandler');
    var RenderNode = require('famous/RenderNode');
    var Modifier = require('famous/Modifier');

    function TitleNav(options) {
        this.options = Object.create(TitleNav.DEFAULT_OPTIONS);
        this.lightbox = new LightBox();
        this._surfaces = {};
        if(options) this.setOptions(options);

        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);
    };

    TitleNav.DEFAULT_OPTIONS = {
        widget: Surface,
        inOrigin: [0.5, 0],
        outOrigin: [0.5, 0],
        showOrigin: [0.5, 0],
        inTransition: true,
        outTransition: true,
        size: [undefined, 50],
        look: undefined
    };

    TitleNav.prototype.show = function(title) {
        var widget = this.options.widget;
        if(!(title in this._surfaces)) {
            var surface = new widget({
                size: this.options.size
            });

            var node = new RenderNode();
            var mod = new Modifier({
                opacity: 1
            });

            node.link(mod).link(surface);

            surface.pipe(this.eventInput);

            surface.setOptions(this.options.look);

            var bar = document.createDocumentFragment();

            var titleName = document.createElement('div');
            titleName.classList.add('header-title');
            titleName.innerHTML = title;
            bar.appendChild(titleName);

            var leftMenu = document.createElement('div');
            leftMenu.className = 'menu-cover';
            bar.appendChild(leftMenu);

            // var rightMenu = document.createElement('div');
            // rightMenu.className = 'gear-menu';
            // bar.appendChild(rightMenu);



            // leftMenu.addEventListener('click', function() {
            //     this.eventOutput.emit('leftMenu')
            // }.bind(this));

            // rightMenu.addEventListener('click', function() {
            //     this.eventOutput.emit('rightMenu')
            // }.bind(this));

            surface.setContent(bar);
            this._surfaces[title] = node;


            leftMenu.addEventListener('touchstart', function() {
                this.eventOutput.emit('leftMenu')
            }.bind(this));

            // rightMenu.addEventListener('touchstart', function() {
            //     this.eventOutput.emit('rightMenu')
            // }.bind(this));
        }

        this.lightbox.show(this._surfaces[title]);
    };

    TitleNav.prototype.getSize = function() {
        return this.options.size;
    };

    TitleNav.prototype.setOptions = function(options) {
        this.lightbox.setOptions(options);
        if(options.widget) {
            this.options.widget = options.widget;
            this._surfaces = {};
        }
        if(options.look) {
            this.options.look = options.look;
        }
        if(options.size) {
            this.options.size = options.size;
            var sourceTransform = Matrix.translate(0, -this.options.size[1]);
            this.lightbox.setOptions({
                inTransform: sourceTransform,
                outTransform: sourceTransform
            });
        }
    };

    TitleNav.prototype.render = function() {
        return this.lightbox.render();
    };

    module.exports = TitleNav;
});
