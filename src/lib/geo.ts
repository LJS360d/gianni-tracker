export type Point = { lat: number; lng: number; device_ts: number; segment_type?: string };

function perpendicularDistance(
  p: Point,
  lineStart: Point,
  lineEnd: Point
): number {
  const dx = lineEnd.lng - lineStart.lng;
  const dy = lineEnd.lat - lineStart.lat;
  const mag = Math.sqrt(dx * dx + dy * dy) || 1e-10;
  const u =
    ((p.lng - lineStart.lng) * dx + (p.lat - lineStart.lat) * dy) / (mag * mag);
  let x: number;
  let y: number;
  if (u < 0) {
    x = lineStart.lng;
    y = lineStart.lat;
  } else if (u > 1) {
    x = lineEnd.lng;
    y = lineEnd.lat;
  } else {
    x = lineStart.lng + u * dx;
    y = lineStart.lat + u * dy;
  }
  return Math.sqrt((p.lng - x) ** 2 + (p.lat - y) ** 2);
}

export function douglasPeucker(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;
  let dmax = 0;
  let idx = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      dmax = d;
      idx = i;
    }
  }
  if (dmax <= epsilon) return [points[0], points[end]];
  const left = douglasPeucker(points.slice(0, idx + 1), epsilon);
  const right = douglasPeucker(points.slice(idx), epsilon);
  return [...left.slice(0, -1), ...right];
}

export function downsampleTrack(
  points: Point[],
  maxPoints: number = 500
): Point[] {
  if (points.length <= maxPoints) return points;
  const epsilonStep = 0.0001;
  let epsilon = epsilonStep;
  let result = douglasPeucker(points, epsilon);
  while (result.length > maxPoints && epsilon < 1) {
    epsilon += epsilonStep;
    result = douglasPeucker(points, epsilon);
  }
  return result;
}
