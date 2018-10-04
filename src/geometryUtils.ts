import Point = require('esri/geometry/Point');
import Polyline = require('esri/geometry/Polyline');
import number = require('dojo/number');

/**
 * @param Point - Point geometry.
 * @param precision - precision of seconds.
 * @returns A string of longitude and latitude degrees-minutes-seconds (123 10 19.45W 45 51 47.99N).
 */
export function decimalToDMS(
  point: Point,
  precision?: number
) : string {
  precision = precision || 0;
  const lng = point.longitude;
  const lat = point.latitude;
  // longitude
  const directionLng = lng > 0 ? 'E' : 'W';
  const absoluteLng = Math.abs(lng);
  const degreeLng = absoluteLng | 0;
  const fractionalLng = absoluteLng - degreeLng;
  const minuteLng = (fractionalLng * 60) | 0;
  const secondLng = number.round(fractionalLng * 3600 - minuteLng * 60, precision);
  // latitude
  const directionLat = lat > 0 ? 'N' : 'S';
  const absoluteLat = Math.abs(lat);
  const degreeLat = absoluteLat | 0;
  const fractionalLat = absoluteLat - degreeLat;
  const minuteLat = (fractionalLat * 60) | 0;
  const secondLat = number.round(fractionalLat * 3600 - minuteLat * 60, precision);
  // return as a string
  return degreeLng + ' ' + (minuteLng < 10 ? '0' + minuteLng : minuteLng) + ' ' + (secondLng < 10 ? '0' + secondLng : secondLng) + directionLng
    + ' '
    + degreeLat + ' ' + (minuteLat < 10 ? '0' + minuteLat : minuteLat) + ' ' + (secondLat < 10 ? '0' + secondLat : secondLat) + directionLat;
}


// polylineMidPoint helpers
function distance(a: any, b:any): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
function lineInterpolate(point1: any, point2: any, distance: number): any {
  const xabs = Math.abs(point1.x - point2.x);
  const yabs = Math.abs(point1.y - point2.y);
  const xdiff = point2.x - point1.x;
  const ydiff = point2.y - point1.y;
  const length = Math.sqrt((Math.pow(xabs, 2) + Math.pow(yabs, 2)));
  const steps = length / distance;
  const xstep = xdiff / steps;
  const ystep = ydiff / steps;
  return {
    x: point1.x + xstep,
    y: point1.y + ystep
  };
};
function lineMidpoint(lineSegments: any[]): any {
  let TotalDistance = 0;
  for (let i = 0; i < lineSegments.length - 1; i += 1) {
    TotalDistance += distance(lineSegments[i], lineSegments[i + 1]);
  }
  let DistanceSoFar = 0;
  for (let i = 0; i < lineSegments.length - 1; i += 1) {
    if (DistanceSoFar + distance(lineSegments[i], lineSegments[i + 1]) > TotalDistance / 2) {
      const DistanceToMidpoint = TotalDistance / 2 - DistanceSoFar;
      return lineInterpolate(lineSegments[i], lineSegments[i + 1], DistanceToMidpoint);
    }
    DistanceSoFar += distance(lineSegments[i], lineSegments[i + 1]);
  }
  return lineSegments[0];
};

/**
 * @param Polyline - Polyline geometry.
 * @returns Midpoint of Polyine as a Point.
 */
export function polylineMidpoint(
  polyline: Polyline
) : Point {
  const segments: any = [];
  polyline.paths[0].forEach(function (pnt) {
    segments.push({
      x: pnt[0],
      y: pnt[1]
    });
  });
  const midpoint = lineMidpoint(segments);
  return new Point({
    x: midpoint.x,
    y: midpoint.y,
    spatialReference: polyline.spatialReference
  });
}
