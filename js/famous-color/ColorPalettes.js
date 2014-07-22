define(function(require, exports, module) {
	var Color = require('./Color'); 
	var ColorPalette = require('./ColorPalette'); 

	var rawPalettes = [
		[[53,92,125,1], [108,91,123,1], [192,108,132,1], [246,114,128,1], [248,177,149,1]],
		[[27,21,33,1], [181,172,1,1], [212,30,69,1], [232,110,28,1], [236,186,9,1]],
		[[63,54,42,1], [231,69,13,1], [250,157,4,1], [251,222,3,1], [254,245,150,1]],
		[[10,103,137,1], [10,153,111,1], [207,6,56,1], [250,102,50,1], [254,205,35,1]],
		[[157,85,105,1], [192,227,217,1], [202,55,99,1], [227,237,195,1], [235,113,84,1]],
		[[110,110,110,1], [145,217,255,1], [237,255,135,1], [255,133,167,1], [255,255,255,1]],
		[[0,0,0,1], [25,26,36,1], [51,44,44,1], [250,101,87,1], [255,255,255,1]],
		[[27,103,107,1], [81,149,72,1], [136,196,37,1], [190,242,2,1], [234,253,230,1]],
		[[31,11,12,1], [48,5,17,1], [179,84,79,1], [214,195,150,1], [231,252,207,1]],
		[[172,248,248,1], [223,235,24,1], [230,95,95,1], [235,54,24,1], [235,207,24,1]],
		[[196,182,109,1], [213,39,5,1], [240,211,119,1], [243,232,228,1], [247,109,60,1]],
		[[11,72,107,1], [59,134,134,1], [121,189,154,1], [168,219,168,1], [207,240,158,1]],
		[[0,188,209,1], [118,211,222,1], [174,232,251,1], [176,248,255,1], [254,249,240,1]],
		[[85,73,57,1], [112,108,77,1], [241,230,143,1], [255,100,100,1], [255,151,111,1]],
		[[36,244,161,1], [178,42,58,1], [199,244,36,1], [244,36,182,1], [249,246,49,1]],
		[[108,144,134,1], [169,204,24,1], [207,73,108,1], [235,234,188,1], [252,84,99,1]],
		[[78,79,75,1], [130,35,57,1], [247,62,62,1], [255,119,61,1], [255,213,115,1]],
		[[121,28,49,1], [145,213,152,1], [191,178,64,1], [202,51,68,1], [237,126,80,1]],
		[[104,73,83,1], [127,191,151,1], [182,219,145,1], [250,107,41,1], [253,158,41,1]],
		[[0,203,231,1], [0,218,60,1], [223,21,26,1], [244,243,40,1], [253,134,3,1]],
		[[56,222,231,1], [232,255,0,1], [254,62,71,1], [255,130,0,1]],
		[[27,32,38,1], [75,89,107,1], [153,228,255,1], [247,79,79,1], [255,59,59,1]],
		[[0,0,0,1], [0,173,239,1], [236,0,140,1], [255,242,0,1]],
		[[47,43,173,1], [173,43,173,1], [228,38,146,1], [247,21,104,1], [247,219,21,1]],
		[[101,150,158,1], [171,20,44,1], [189,219,222,1], [205,212,108,1], [219,217,210,1]],
		[[97,24,36,1], [193,47,42,1], [247,255,238,1], [254,222,123,1], [255,101,64,1]],
		[[118,85,66,1], [124,231,163,1], [220,93,110,1], [255,174,60,1], [255,229,156,1]],
		[[63,184,175,1], [127,199,175,1], [218,216,167,1], [255,61,127,1], [255,158,157,1]],
		[[217,251,223,1], [219,255,210,1], [231,254,235,1], [234,255,210,1], [243,255,210,1]],
		[[0,23,42,1], [27,139,163,1], [94,202,214,1], [178,222,249,1], [206,254,255,1]],
		[[225,245,196,1], [237,229,116,1], [249,212,35,1], [252,145,58,1], [255,78,80,1]],
		[[7,9,61,1], [11,16,140,1], [12,15,102,1], [14,78,173,1], [16,127,201,1]],
		[[5,177,240,1], [5,232,240,1], [94,87,230,1], [230,87,149,1], [255,5,113,1]],
		[[48,0,24,1], [90,61,49,1], [131,123,71,1], [173,184,95,1], [229,237,184,1]],
		[[111,191,162,1], [191,184,174,1], [242,199,119,1], [242,230,194,1], [255,255,255,1]],
		[[22,147,165,1], [69,181,196,1], [126,206,202,1], [160,222,214,1], [199,237,232,1]],
		[[8,26,48,1], [50,64,90,1], [59,100,128,1], [155,153,130,1], [255,134,17,1]],
		[[74,186,176,1], [152,33,0,1], [255,211,0,1], [255,245,158,1]],
		[[42,135,50,1], [49,48,66,1], [107,85,48,1], [255,109,36,1], [255,235,107,1]],
		[[0,0,0,1], [25,134,219,1], [105,172,224,1], [149,199,24,1], [184,212,40,1]],
		[[64,0,20,1], [127,0,40,1], [191,0,59,1], [229,0,71,1], [255,0,79,1]],
		[[56,69,59,1], [78,133,136,1], [255,70,84,1], [255,213,106,1], [255,254,211,1]],
		[[29,44,143,1], [57,179,162,1], [209,146,191,1], [222,75,107,1], [252,180,121,1]],
		[[14,36,48,1], [232,213,183,1], [232,213,185,1], [245,179,73,1], [252,58,81,1]],
		[[0,210,255,1], [222,255,0,1], [255,0,168,1], [255,66,0,1]],
		[[21,99,105,1], [51,53,84,1], [169,186,181,1], [216,69,148,1], [236,196,89,1]],
		[[105,210,231,1], [167,219,216,1], [224,228,204,1], [243,134,48,1], [250,105,0,1]],
		[[122,106,83,1], [148,140,117,1], [153,178,183,1], [213,222,217,1], [217,206,178,1]],
		[[34,104,136,1], [57,142,182,1], [255,162,0,1], [255,214,0,1], [255,245,0,1]],
		[[2,100,117,1], [194,163,79,1], [251,184,41,1], [254,251,175,1], [255,229,69,1]],
		[[214,37,77,1], [246,215,107,1], [253,235,169,1], [255,84,117,1], [255,144,54,1]],
		[[0,0,0,1], [124,180,144,1], [211,25,0,1], [255,102,0,1], [255,242,175,1]],
		[[35,116,222,1], [38,38,38,1], [87,54,255,1], [231,255,54,1], [255,54,111,1]],
		[[64,18,44,1], [89,186,169,1], [101,98,115,1], [216,241,113,1], [252,255,217,1]],
		[[126,148,158,1], [174,194,171,1], [235,206,160,1], [252,119,101,1], [255,51,95,1]],
		[[75,73,11,1], [117,116,73,1], [226,223,154,1], [235,229,77,1], [255,0,81,1]],
		[[159,112,69,1], [183,98,5,1], [208,167,124,1], [253,169,43,1], [254,238,171,1]],
		[[38,37,28,1], [160,232,183,1], [235,10,68,1], [242,100,61,1], [242,167,61,1]],
		[[0,0,0,1], [67,110,217,1], [120,0,0,1], [216,216,216,1], [240,24,0,1]],
		[[51,51,51,1], [131,163,0,1], [158,12,57,1], [226,27,90,1], [251,255,227,1]],
		[[79,156,52,1], [108,186,85,1], [125,210,89,1], [158,228,70,1], [187,255,133,1]],
		[[0,44,43,1], [7,100,97,1], [10,131,127,1], [255,61,0,1], [255,188,17,1]],
		[[149,207,183,1], [240,65,85,1], [242,242,111,1], [255,130,58,1], [255,247,189,1]],
		[[89,168,15,1], [158,213,76,1], [196,237,104,1], [226,255,158,1], [240,242,221,1]],
		[[54,42,44,1], [189,223,38,1], [237,38,105,1], [238,189,97,1], [252,84,99,1]],
		[[11,246,147,1], [38,137,233,1], [233,26,157,1], [246,182,11,1], [246,242,11,1]],
		[[8,0,9,1], [65,242,221,1], [207,242,65,1], [249,44,130,1], [252,241,30,1]],
		[[198,164,154,1], [198,229,217,1], [214,129,137,1], [233,78,119,1], [244,234,213,1]],
		[[6,71,128,1], [8,84,199,1], [160,194,222,1], [205,239,255,1], [237,237,244,1]],
		[[93,66,63,1], [124,87,83,1], [238,128,117,1], [255,177,169,1], [255,233,231,1]],
		[[59,129,131,1], [237,48,60,1], [245,99,74,1], [250,208,137,1], [255,156,91,1]],
		[[56,166,155,1], [104,191,101,1], [204,217,106,1], [242,88,53,1], [242,218,94,1]],
		[[60,197,234,1], [70,70,70,1], [233,234,60,1], [246,246,246,1]],
		[[97,99,130,1], [102,36,91,1], [105,165,164,1], [168,196,162,1], [229,234,164,1]],
		[[10,191,188,1], [19,116,125,1], [41,34,31,1], [252,53,76,1], [252,247,197,1]],
		[[7,0,4,1], [236,67,8,1], [252,129,10,1], [255,172,35,1], [255,251,214,1]],
		[[0,5,1,1], [8,138,19,1], [237,20,9,1], [240,249,241,1], [247,249,21,1]],
		[[64,197,132,1], [131,218,232,1], [170,46,154,1], [251,35,137,1], [251,132,137,1]],
		[[64,47,58,1], [217,119,119,1], [255,198,158,1], [255,219,196,1]],
		[[243,96,49,1], [249,236,95,1], [255,102,0,1], [255,153,0,1], [255,204,0,1]],
		[[33,90,109,1], [45,45,41,1], [60,162,162,1], [146,199,163,1], [223,236,230,1]],
		[[10,42,63,1], [101,147,160,1], [185,204,184,1], [219,21,34,1], [255,239,167,1]],
		[[0,160,176,1], [106,74,60,1], [204,51,63,1], [235,104,65,1], [237,201,81,1]],
		[[14,141,148,1], [67,77,83,1], [114,173,117,1], [233,213,88,1], [255,171,7,1]],
		[[94,159,163,1], [176,85,116,1], [220,209,180,1], [248,126,123,1], [250,184,127,1]],
		[[31,31,31,1], [122,91,62,1], [205,189,174,1], [250,75,0,1], [250,250,250,1]],
		[[176,230,41,1], [180,35,16,1], [247,207,10,1], [250,124,7,1], [252,231,13,1]],
		[[94,65,47,1], [120,192,168,1], [240,120,24,1], [240,168,48,1], [252,235,182,1]],
		[[31,26,28,1], [98,128,125,1], [134,158,138,1], [201,107,30,1], [209,205,178,1]],
		[[40,60,0,1], [100,153,125,1], [237,143,69,1], [241,169,48,1], [254,204,109,1]],
		[[37,2,15,1], [143,143,143,1], [158,30,76,1], [236,236,236,1], [255,17,104,1]],
		[[207,108,116,1], [244,93,120,1], [255,112,136,1], [255,130,153,1], [255,187,193,1]],
		[[0,0,0,1], [12,13,5,1], [168,171,132,1], [198,201,157,1], [231,235,176,1]],
		[[0,170,255,1], [170,0,255,1], [170,255,0,1], [255,0,170,1], [255,170,0,1]],
		[[78,150,137,1], [126,208,214,1], [135,214,155,1], [195,255,104,1], [244,252,232,1]],
		[[10,10,10,1], [227,246,255,1], [255,20,87,1], [255,216,125,1]],
		[[51,51,153,1], [102,153,204,1], [153,204,255,1], [255,0,51,1], [255,204,0,1]],
		[[23,22,92,1], [190,191,158,1], [216,210,153,1], [229,228,218,1], [245,224,56,1]],
		[[49,99,64,1], [96,158,77,1], [159,252,88,1], [195,252,88,1], [242,252,88,1]],
		[[92,88,99,1], [168,81,99,1], [180,222,193,1], [207,255,221,1], [255,31,76,1]],
		[[61,67,7,1], [161,253,17,1], [225,244,56,1], [244,251,196,1], [255,208,79,1]],
		[[0,205,172,1], [2,170,176,1], [22,147,165,1], [127,255,36,1], [195,255,104,1]],
		[[0,203,231,1], [0,218,60,1], [223,21,26,1], [244,243,40,1], [253,134,3,1]],
		[[34,104,136,1], [57,142,182,1], [255,162,0,1], [255,214,0,1], [255,245,0,1]],
		[[3,13,79,1], [206,236,239,1], [231,237,234,1], [251,12,6,1], [255,197,44,1]],
		[[253,255,0,1], [255,0,0,1], [255,90,0,1], [255,114,0,1], [255,167,0,1]],
		[[108,66,18,1], [179,0,176,1], [183,255,55,1], [255,124,69,1], [255,234,155,1]],
		[[0,4,49,1], [59,69,58,1], [90,224,151,1], [204,46,9,1], [255,253,202,1]],
		[[59,45,56,1], [188,189,172,1], [207,190,39,1], [240,36,117,1], [242,116,53,1]],
		[[101,145,155,1], [120,185,168,1], [168,212,148,1], [242,177,73,1], [244,229,97,1]],
		[[0,193,118,1], [136,193,0,1], [250,190,40,1], [255,0,60,1], [255,138,0,1]],
		[[110,37,63,1], [165,199,185,1], [199,94,106,1], [241,245,244,1], [251,236,236,1]],
		[[39,112,140,1], [111,191,162,1], [190,191,149,1], [227,208,116,1], [255,180,115,1]],
		[[62,72,76,1], [82,91,96,1], [105,158,81,1], [131,178,107,1], [242,232,97,1]],
		[[248,135,46,1], [252,88,12,1], [252,107,10,1], [253,202,73,1], [255,169,39,1]],
		[[83,119,122,1], [84,36,55,1], [192,41,66,1], [217,91,67,1], [236,208,120,1]],
		[[41,136,140,1], [54,19,0,1], [162,121,15,1], [188,53,33,1], [255,208,130,1]],
		[[10,186,181,1], [58,203,199,1], [106,219,216,1], [153,236,234,1], [201,252,251,1]],
		[[8,158,42,1], [9,42,100,1], [90,204,191,1], [229,4,4,1], [251,235,175,1]],
		[[187,187,136,1], [204,198,141,1], [238,170,136,1], [238,194,144,1], [238,221,153,1]],
		[[121,219,204,1], [134,78,65,1], [234,169,167,1], [242,199,196,1], [248,245,226,1]],
		[[96,136,213,1], [114,170,222,1], [157,200,233,1], [192,222,245,1], [217,239,244,1]],
		[[30,30,30,1], [177,255,0,1], [209,210,212,1], [242,240,240,1]],
		[[255,102,0,1], [255,153,0,1], [255,204,0,1], [255,255,204,1], [255,255,255,1]],
		[[35,15,43,1], [130,179,174,1], [188,227,197,1], [235,235,188,1], [242,29,65,1]],
		[[212,238,94,1], [225,237,185,1], [240,242,235,1], [244,250,210,1], [255,66,66,1]],
		[[20,32,71,1], [168,95,59,1], [247,92,92,1], [255,255,255,1]],
		[[63,184,240,1], [80,208,240,1], [196,251,93,1], [224,240,240,1], [236,255,224,1]],
		[[185,222,81,1], [209,227,137,1], [224,72,145,1], [225,183,237,1], [245,225,226,1]],
		[[185,222,81,1], [209,227,137,1], [224,72,145,1], [225,183,237,1], [245,225,226,1]],
		[[17,68,34,1], [51,170,170,1], [51,221,51,1], [221,238,68,1], [221,238,187,1]],
		[[46,13,35,1], [245,72,40,1], [247,128,60,1], [248,228,193,1], [255,237,191,1]],
		[[204,243,144,1], [224,224,90,1], [247,196,31,1], [252,147,10,1], [255,0,61,1]],
		[[18,18,18,1], [255,89,56,1], [255,255,255,1]],
		[[53,38,48,1], [85,72,101,1], [205,91,81,1], [233,223,204,1], [243,163,107,1]],
		[[236,250,1,1], [236,250,2,1], [247,220,2,1], [248,227,113,1], [250,173,9,1]],
		[[77,129,121,1], [161,129,121,1], [236,85,101,1], [249,220,159,1], [254,157,93,1]],
		[[4,0,4,1], [65,61,61,1], [75,0,15,1], [200,255,0,1], [250,2,60,1]],
		[[66,50,56,1], [179,112,45,1], [200,209,151,1], [235,33,56,1], [245,222,140,1]],
		[[143,153,36,1], [172,201,95,1], [241,57,109,1], [243,255,235,1], [253,96,129,1]],
		[[18,18,18,1], [23,122,135,1], [250,245,240,1], [255,180,143,1]],
		[[67,197,210,1], [182,108,97,1], [241,155,140,1], [254,247,237,1], [255,234,215,1]],
		[[78,205,196,1], [85,98,112,1], [196,77,88,1], [199,244,100,1], [255,107,107,1]],
		[[0,0,0,1], [137,161,160,1], [154,227,226,1], [255,71,103,1], [255,118,5,1]],
		[[248,200,221,1], [253,231,120,1], [255,61,61,1], [255,92,143,1], [255,103,65,1]],
		[[23,138,132,1], [145,145,145,1], [229,255,125,1], [235,143,172,1], [255,255,255,1]],
		[[73,112,138,1], [136,171,194,1], [202,255,66,1], [208,224,235,1], [235,247,248,1]],
		[[51,222,245,1], [122,245,51,1], [245,51,145,1], [245,161,52,1], [248,248,101,1]],
		[[57,13,45,1], [172,222,178,1], [225,234,181,1], [237,173,158,1], [254,75,116,1]],
		[[192,107,129,1], [233,22,67,1], [245,175,145,1], [247,201,182,1], [249,210,182,1]],
		[[131,196,192,1], [156,100,53,1], [190,215,62,1], [237,66,98,1], [240,233,226,1]],
		[[136,145,136,1], [191,218,223,1], [207,246,247,1], [233,26,82,1], [237,242,210,1]],
		[[64,44,56,1], [209,212,169,1], [227,164,129,1], [245,215,165,1], [255,111,121,1]],
		[[93,65,87,1], [131,134,137,1], [168,202,186,1], [202,215,178,1], [235,227,170,1]],
		[[0,168,198,1], [64,192,203,1], [143,190,0,1], [174,226,57,1], [249,242,231,1]],
		[[0,204,190,1], [9,166,163,1], [157,191,175,1], [237,235,201,1], [252,249,216,1]],
		[[0,205,172,1], [2,170,176,1], [22,147,165,1], [127,255,36,1], [195,255,104,1]],
		[[51,39,23,1], [107,172,191,1], [157,188,188,1], [240,240,175,1], [255,55,15,1]],
		[[51,51,53,1], [101,99,106,1], [139,135,149,1], [193,190,200,1], [233,232,238,1]],
		[[17,118,109,1], [65,9,54,1], [164,11,84,1], [228,111,10,1], [240,179,0,1]],
		[[73,10,61,1], [138,155,15,1], [189,21,80,1], [233,127,2,1], [248,202,0,1]],
		[[71,162,145,1], [144,79,135,1], [213,28,122,1], [219,213,139,1], [244,127,143,1]],
		[[55,191,230,1], [169,232,250,1], [186,255,21,1], [211,255,106,1], [247,239,236,1]],
		[[69,173,168,1], [84,121,128,1], [89,79,79,1], [157,224,173,1], [229,252,194,1]],
		[[248,241,224,1], [249,246,241,1], [250,244,227,1], [251,106,79,1], [255,193,150,1]],
		[[0,98,125,1], [1,64,87,1], [51,50,49,1], [66,153,15,1], [255,255,255,1]],
		[[52,17,57,1], [53,150,104,1], [60,50,81,1], [168,212,111,1], [255,237,144,1]],
		[[0,153,137,1], [163,169,72,1], [206,24,54,1], [237,185,46,1], [248,89,49,1]],
		[[26,31,30,1], [108,189,181,1], [147,204,198,1], [200,214,191,1], [227,223,186,1]],
		[[165,222,190,1], [183,234,201,1], [251,178,163,1], [252,37,55,1], [255,215,183,1]],
		[[26,20,14,1], [90,142,161,1], [204,65,65,1], [255,255,255,1]],
		[[51,51,51,1], [111,111,111,1], [204,204,204,1], [255,100,0,1], [255,255,255,1]],
		[[51,145,148,1], [167,2,103,1], [241,12,73,1], [246,216,107,1], [251,107,65,1]],
		[[31,3,51,1], [31,57,77,1], [39,130,92,1], [112,179,112,1], [171,204,120,1]],
		[[209,242,165,1], [239,250,180,1], [245,105,145,1], [255,159,128,1], [255,196,140,1]],
		[[60,54,79,1], [109,124,157,1], [124,144,179,1], [149,181,194,1], [185,224,220,1]],
		[[35,179,218,1], [153,214,241,1], [168,153,241,1], [208,89,218,1], [248,78,150,1]],
		[[85,66,54,1], [96,185,154,1], [211,206,61,1], [241,239,165,1], [247,120,37,1]],
		[[20,20,20,1], [177,198,204,1], [255,239,94,1], [255,255,255,1]],
		[[136,238,208,1], [202,224,129,1], [239,67,53,1], [242,205,79,1], [246,139,54,1]],
		[[53,38,29,1], [95,79,69,1], [151,123,105,1], [206,173,142,1], [253,115,26,1]],
		[[68,66,89,1], [159,189,166,1], [219,101,68,1], [240,145,67,1], [252,177,71,1]],
		[[191,208,0,1], [196,60,39,1], [233,60,31,1], [242,83,58,1], [242,240,235,1]],
		[[43,43,43,1], [53,54,52,1], [230,50,75,1], [242,227,198,1], [255,198,165,1]],		
		[[23,20,38,1], [26,15,12,1], [207,207,207,1], [240,240,240,1], [255,77,148,1]],
		[[28,1,19,1], [107,1,3,1], [163,0,6,1], [194,26,1,1], [240,60,2,1]],
		[[10,10,10,1], [140,97,70,1], [214,179,156,1], [242,76,61,1], [255,255,255,1]],
		[[46,13,35,1], [245,72,40,1], [247,128,60,1], [248,228,193,1], [255,237,191,1]],
		[[0,62,95,1], [0,67,132,1], [22,147,165,1], [150,207,234,1], [247,249,114,1]],
		[[66,29,56,1], [87,0,69,1], [190,226,232,1], [205,255,24,1], [255,8,90,1]],
		[[47,59,97,1], [121,128,146,1], [187,235,185,1], [233,236,229,1], [255,103,89,1]],
		[[58,17,28,1], [87,73,81,1], [131,152,142,1], [188,222,165,1], [230,249,188,1]],
		[[147,193,196,1], [198,182,204,1], [242,202,174,1], [250,12,195,1], [255,123,15,1]],
		[[255,3,149,1], [255,9,3,1], [255,139,3,1], [255,216,3,1], [255,251,3,1]],
		[[4,0,4,1], [254,26,138,1], [254,53,26,1], [254,143,26,1], [254,240,26,1]],
		[[125,173,154,1], [196,199,169,1], [249,213,177,1], [254,126,142,1], [255,62,97,1]],
		[[69,38,50,1], [145,32,77,1], [226,247,206,1], [228,132,74,1], [232,191,86,1]],
		[[0,0,0,1], [38,173,228,1], [77,188,233,1], [209,231,81,1], [255,255,255,1]],
		[[44,87,133,1], [209,19,47,1], [235,241,247,1], [237,214,130,1]],
		[[92,172,196,1], [140,209,157,1], [206,232,121,1], [252,182,83,1], [255,82,84,1]],
		[[58,68,8,1], [74,88,7,1], [125,146,22,1], [157,222,13,1], [199,237,14,1]],
		[[22,147,167,1], [200,207,2,1], [204,12,57,1], [230,120,30,1], [248,252,193,1]],
		[[59,12,44,1], [210,255,31,1], [250,244,224,1], [255,106,0,1], [255,195,0,1]],
		[[44,13,26,1], [52,158,151,1], [200,206,19,1], [222,26,114,1], [248,245,193,1]],
		[[28,20,13,1], [203,232,107,1], [242,233,225,1], [255,255,255,1]],		
		[[75,88,191,1], [161,206,247,1], [247,255,133,1], [255,54,134,1]],
		[[74,95,103,1], [92,55,75,1], [204,55,71,1], [209,92,87,1], [217,212,168,1]]
	];

	function ColorPalettes()
	{
		
	}

	function _makeColor(args) 
	{
		return new Color(args[0],args[1],args[2],args[3]);
	}

	function _makeColorPalette(args)
	{				
		var palette = [];
		for(var i = 0, _len = args.length; i < _len; i++) 
		{
			palette.push(_makeColor(args[i]));
		}
		return new ColorPalette(palette);
	}

	ColorPalettes.prototype.getPalette = function(i) 
	{		
		return _makeColorPalette(rawPalettes[i]);
	};

	ColorPalettes.prototype.getCount = function()
	{
		return rawPalettes.length;
	};

	module.exports = ColorPalettes;
});