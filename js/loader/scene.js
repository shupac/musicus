/**
 * RequireJS plugin for loading YAML files
 */
define(['./text', './js-yaml.min', 'famous/SceneCompiler', 'famous/Scene'], function(text, jsyaml, SceneCompiler, Scene) {
    var buildMap = {};

    function load(name, req, onLoad, config) {
        text.get(req.toUrl(name), function(data) {
            if(config.isBuild) {
                buildMap[name] = data;
                onLoad(data);
            }
            else {
                onLoad(new Scene(jsyaml.load(data)));
            }
        }, onLoad.error);
    };

    function write(pluginName, moduleName, write) {
        var data = SceneCompiler.compile(jsyaml.load(buildMap[moduleName]));
        write.asModule(pluginName + '!' + moduleName, 'define([\'famous/Scene\'], function(Scene) {\n return new Scene(' + data + ');\n});\n');
    };

    return {
        load: load,
        write: write
    };
});
