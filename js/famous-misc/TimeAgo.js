define(function(require, exports, module) {

    function parseTime (time) {
        var now = Date.now();
        var difference = now - time;
        var minute = 60000;
        var hour = 60 * minute;
        var day = 24 * hour;

        if (difference < minute) {
            return "Just Now";
        } else if (difference < hour) {
            var minutes = (difference/minute)>>0;
            return minutes + "m";
        } else if (difference < day) {
            var hours = (difference/hour)>>0;
            return hours + "h";
        } else {
            var days = (difference/day)>>0;
            return days + "d";
        }

    }

    module.exports = {
        parse: parseTime
    };

});
