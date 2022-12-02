import { GreatCircle } from 'arc';

export const calculateDistance = (coords1: [number, number, number], coords2: [number, number, number]) => {
    
  const R = 6371000;
  const curve = Math.PI / 180;

  const phi1 = coords1[0] * curve;      //долгота 1
  const phi2 = coords2[0] * curve;      //долгота 2

  const alpha1 = coords1[1] * curve;    //широта 1
  const alpha2 = coords2[1] * curve;    //широта 2
  
  const deltaPhi = phi2  - phi1;
  const deltaAlpha = alpha2 - alpha1;

  const a = Math.sin(deltaPhi / 2) ** 2 +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaAlpha / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c;

  const deltaAlt = Math.abs(coords1[2] - coords2[2]);

  return Math.sqrt(d ** 2 + deltaAlt ** 2);
};

// [lat, lon]
export const distanceRoute = (coords1: [number, number], coords2: [number, number]) => {
  const coordinates = [];

    const arcGenerator = new GreatCircle(
      {
        x: coords1[1], 
        y: coords1[0],
      },
      {
        x: coords2[1], 
        y: coords2[0],
      }
    );

    const line = arcGenerator.Arc(100, { offset: 10 });

    for (let i = 0; i < line.geometries[0].coords.length - 1; i++) {
      coordinates.push([
        line.geometries[0].coords[i],
        line.geometries[0].coords[i + 1],
      ]);
    }

  return coordinates;
};