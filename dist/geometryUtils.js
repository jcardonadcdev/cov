define(["require", "exports", "esri/geometry/Point", "dojo/number"], function (require, exports, Point, number) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function decimalToDMS(point, precision) {
        precision = precision || 0;
        var lng = point.longitude;
        var lat = point.latitude;
        var directionLng = lng > 0 ? 'E' : 'W';
        var absoluteLng = Math.abs(lng);
        var degreeLng = absoluteLng | 0;
        var fractionalLng = absoluteLng - degreeLng;
        var minuteLng = (fractionalLng * 60) | 0;
        var secondLng = number.round(fractionalLng * 3600 - minuteLng * 60, precision);
        var directionLat = lat > 0 ? 'N' : 'S';
        var absoluteLat = Math.abs(lat);
        var degreeLat = absoluteLat | 0;
        var fractionalLat = absoluteLat - degreeLat;
        var minuteLat = (fractionalLat * 60) | 0;
        var secondLat = number.round(fractionalLat * 3600 - minuteLat * 60, precision);
        return degreeLng + ' ' + (minuteLng < 10 ? '0' + minuteLng : minuteLng) + ' ' + (secondLng < 10 ? '0' + secondLng : secondLng) + directionLng
            + ' '
            + degreeLat + ' ' + (minuteLat < 10 ? '0' + minuteLat : minuteLat) + ' ' + (secondLat < 10 ? '0' + secondLat : secondLat) + directionLat;
    }
    exports.decimalToDMS = decimalToDMS;
    function distance(a, b) {
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    function lineInterpolate(point1, point2, distance) {
        var xabs = Math.abs(point1.x - point2.x);
        var yabs = Math.abs(point1.y - point2.y);
        var xdiff = point2.x - point1.x;
        var ydiff = point2.y - point1.y;
        var length = Math.sqrt((Math.pow(xabs, 2) + Math.pow(yabs, 2)));
        var steps = length / distance;
        var xstep = xdiff / steps;
        var ystep = ydiff / steps;
        return {
            x: point1.x + xstep,
            y: point1.y + ystep
        };
    }
    ;
    function lineMidpoint(lineSegments) {
        var TotalDistance = 0;
        for (var i = 0; i < lineSegments.length - 1; i += 1) {
            TotalDistance += distance(lineSegments[i], lineSegments[i + 1]);
        }
        var DistanceSoFar = 0;
        for (var i = 0; i < lineSegments.length - 1; i += 1) {
            if (DistanceSoFar + distance(lineSegments[i], lineSegments[i + 1]) > TotalDistance / 2) {
                var DistanceToMidpoint = TotalDistance / 2 - DistanceSoFar;
                return lineInterpolate(lineSegments[i], lineSegments[i + 1], DistanceToMidpoint);
            }
            DistanceSoFar += distance(lineSegments[i], lineSegments[i + 1]);
        }
        return lineSegments[0];
    }
    ;
    function polylineMidpoint(polyline) {
        var segments = [];
        polyline.paths[0].forEach(function (pnt) {
            segments.push({
                x: pnt[0],
                y: pnt[1]
            });
        });
        var midpoint = lineMidpoint(segments);
        return new Point({
            x: midpoint.x,
            y: midpoint.y,
            spatialReference: polyline.spatialReference
        });
    }
    exports.polylineMidpoint = polylineMidpoint;
});
//# sourceMappingURL=geometryUtils.js.map