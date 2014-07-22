define(function(require, exports, module) {
	var Utils = require('famous-utils/Utils');

	function Color(r, g, b, a)
	{				
		if(r instanceof Color)
		{
			this.r = r.r; 
			this.g = r.g; 
			this.b = r.b; 
			this.a = r.a; 
			this.hex = r.getHex();
		}
		else
		{
			this.r = (typeof r === 'undefined') ? 255 : r; 
			this.g = (typeof g === 'undefined') ? 255 : g; 
			this.b = (typeof b === 'undefined') ? 255 : b; 
			this.a = (typeof a === 'undefined') ? 1.0 : a; 
			this.hex = this.getHex();
		}		
	}	

	Color.prototype.getHue = function()
	{
		var r = this.r/255.0;
		var g = this.g/255.0;
		var b = this.b/255.0;

		var max = Math.max(r, g, b); 
		var min = Math.min(r, g, b); 
		
		var h = 0.0; 

		var d = max - min;

        switch(max)
        {
            case r: 
            {
				h = (g - b) / d + (g < b ? 6 : 0); 
            }
            break;

            case g: 
            {
				h = (b - r) / d + 2; 
            }
            break;
            
            case b: 
            {
				h = (r - g) / d + 4; 
            }
            break;
        }
        h *= 60; 

        if(isNaN(h)) { 
            h = 0; 
        }
		return h; 
	};

	Color.prototype.getSaturation = function()
	{
		var r = this.r/255.0;
		var g = this.g/255.0;
		var b = this.b/255.0;

		var max = Math.max(r, g, b); 
		var min = Math.min(r, g, b); 
		
		var s, l = (max + min) / 2;

		if(max == min)
		{
			h = s = 0;
		}
		else
		{
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h *= 60; 
		}
		return s*100; 
	};
	
    Color.prototype.getBrightness = function() 
    {
		var r = this.r/255.0;
		var g = this.g/255.0;
		var b = this.b/255.0;

        return Math.max(r, g, b) * 100.0;
    };

    Color.prototype.getLightness = function()
	{			
		var r = this.r/255.0;
		var g = this.g/255.0;
		var b = this.b/255.0;
		return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2.0)*100.0; 
	};

	Color.prototype.getHex = function() 
    {
        function toHex(num) { 
            var hex = num.toString(16); 
            return hex.length === 1 ? '0' + hex : hex;
        }

        return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b);
    }; 

    Color.prototype.getHSL = function()
	{
		var r = this.r/255.0;
		var g = this.g/255.0;
		var b = this.b/255.0;

		var max = Math.max(r, g, b); 
		var min = Math.min(r, g, b); 
		
		var h, s, l = (max + min) / 2;

		if(max == min)
		{
			h = s = 0;
		}
		else
		{
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h *= 60; 
		}
		return [h, s*100, l*100];
	};

	function hue2rgb(p, q, t)
	{
		if(t < 0) t += 1;
		if(t > 1) t -= 1;
		if(t < 1/6) return p + (q - p) * 6 * t;
		if(t < 1/2) return q;
		if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		return p;
	}

	Color.prototype.setFromHSL = function hslToRgb(h, s, l)
	{
		h /=360.0; 
		s /=100.0; 
		l /=100.0; 
		
		var r, g, b;

		if(s === 0)
		{
			r = g = b = l; // achromatic
		}
		else
		{		
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

        this.r = Math.round(r * 255);
        this.g = Math.round(g * 255);
        this.b = Math.round(b * 255);
        this.hex = this.getHex();
        return this;
	};

	Color.prototype.setFromHex = function(hex)
    {
        hex = (hex.charAt(0) === '#') ? hex.substring(1, hex.length) : hex; 

        if(hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        this.hex = '#' + hex;
        this.r = parseInt(hex.substring(0, 2), 16);
        this.g = parseInt(hex.substring(2, 4), 16);
        this.b = parseInt(hex.substring(4, 6), 16);

        return this;
    };
    
    Color.prototype.setFromRGBA = function(r, g, b, a) 
    {
        this.r = r;
        this.g = g;
        this.b = b;
        if(a) this.a = a;
        this.hex = this.getHex();
        return this;
    };
	
	Color.prototype.setHue = function(h)
	{
		var hsl = this.getHSL(); 
		return this.setFromHSL(h, hsl[1], hsl[2]);
	};

	Color.prototype.setSaturation = function(s)
	{
		var hsl = this.getHSL(); 
		return this.setFromHSL(hsl[0], s, hsl[2]);
	};

	Color.prototype.setLightness = function(l)
	{
		var hsl = this.getHSL(); 
		return this.setFromHSL(hsl[0], hsl[1], l);
	};

	Color.prototype.getCSSBackgroundColor = function()
	{
		return Utils.backgroundColor(this.r, this.b, this.g, this.a); 
	};

	Color.prototype.getCSSColor = function()
	{
		return Utils.color(this.r, this.g, this.b, this.a); 
	};

	Color.prototype.clone = function()
	{
		return new Color(this.r, this.g, this.b, this.a); 
	};

	Color.prototype.toNormalizeColorArray = function()
	{
		return [this.r/255.0, this.g/255.0, this.b/255.0, this.a]; 
	};

	module.exports = Color;
});
