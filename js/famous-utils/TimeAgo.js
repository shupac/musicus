define(function(require, exports, module) {

    /**
     * @class Helper to return differences between timestamps in human-readable
     *        format.
     */
    function parseTime (time) {
        var now = Date.now();
        var difference = now - time;
        var minute = 60000;
        var hour = 60 * minute;
        var day = 24 * hour;

        if (difference < minute) {
            return "Just Now"
        } else if (difference < hour) {
            var minutes = ~~(difference/minute);
            return minutes + "m";
        } else if (difference < day) {
            var hours = ~~(difference/hour);
            return hours + "h";
        } else {
            var days = ~~(difference/day);
            return days + "d";
        }

    }

    module.exports = {
        parse: parseTime
    }

});
