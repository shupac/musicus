define(function(require, exports, module) {
	var Color = require('./Color'); 

	function ColorPalette(colors)
	{
		this.colors = colors; 
	}	

	ColorPalette.prototype.getColor = function(index)
	{
		return this.colors[index%this.colors.length]; 
	};

	
	ColorPalette.prototype.getLighestColor = function()
	{		
		return ; 
	};

	ColorPalette.prototype.getDarkestColor = function()
	{
		return ; 
	};

	ColorPalette.prototype.getCount = function()
	{
		return this.colors.length; 
	};

	module.exports = ColorPalette;
});