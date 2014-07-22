/**
 * RequireJS plugin for loading YAML files
 */
define(['./text', './js-yaml.min'], function(text, jsyaml) {
    var buildMap = {};

    function load(name, req, onLoad, config) {
        text.get(req.toUrl(name), function(data) {
            if(config.isBuild) {
                buildMap[name] = data;
                onLoad(data);
            }
            else {
                onLoad(jsyaml.load(data));
            }
        }, onLoad.error);
    };

    function write(pluginName, moduleName, write) {
        var data = JSON.stringify(jsyaml.load(buildMap[moduleName]));
        write.asModule(pluginName + '!' + moduleName, 'define(function() {\n return ' + data + ';\n});\n');
    };

    return {
        load: load,
        write: write
    };
});
