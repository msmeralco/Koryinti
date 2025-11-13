import { ROADS, CITY_IDS, RoadPath, randomRoadInCity } from './simRoads';

export type CarPlanSegment = {
  startHour: number; // 0..23
  endHour: number;   // 0..23 (exclusive)
  pathId: string;    // id of a road path
  direction: 1 | -1; // forward or reverse along path
};

export type DailyPlan = CarPlanSegment[]; // segments in chronological order

export type Car = {
  id: string;
  cityId: string; // home city cluster
  workPathId: string; // commute target within city
  seed: number; // deterministic plan generation
};

export type CarPlans = {
  car: Car;
  days: DailyPlan[]; // 120 days (approx 4 months at 30 days/month)
};

function mulberry32(a: number) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function makeCars(count = 80): Car[] {
  const cars: Car[] = [];
  for (let i = 0; i < count; i++) {
    const cityId = CITY_IDS[Math.floor(Math.random() * CITY_IDS.length)];
    const workPathId = randomRoadInCity(cityId).id;
    cars.push({ id: `car-${i}`, cityId, workPathId, seed: 1000 + i });
  }
  return cars;
}

// Generate a 4-month plan (120 days) for each car with typical daily patterns
export function buildPlans(cars: Car[], months = 4, daysPerMonth = 30): CarPlans[] {
  const totalDays = months * daysPerMonth;
  return cars.map(car => {
    const rng = mulberry32(car.seed);
    const days: DailyPlan[] = [];
    for (let d = 0; d < totalDays; d++) {
      const isWeekend = (d % 7) === 5 || (d % 7) === 6; // Sat/Sun
      const segments: DailyPlan = [];
      const homePath: RoadPath = randomRoadInCity(car.cityId);
      const workPathId = car.workPathId;
      // Morning commute 7-9
      if (!isWeekend) {
        const start = randInt(rng, 7, 8);
        const end = start + randInt(rng, 1, 2);
        segments.push({ startHour: start, endHour: Math.min(23, end), pathId: workPathId, direction: 1 });
      }
      // Midday errands 12-14 within city
      if (rng() < 0.6) {
        const start = randInt(rng, 12, 13);
        const end = start + 1;
        segments.push({ startHour: start, endHour: Math.min(23, end), pathId: homePath.id, direction: rng() < 0.5 ? 1 : -1 });
      }
      // Evening commute 17-20
      if (!isWeekend) {
        const start = randInt(rng, 17, 18);
        const end = start + randInt(rng, 1, 2);
        segments.push({ startHour: start, endHour: Math.min(23, end), pathId: workPathId, direction: -1 });
      }
      // Occasional intercity trip once/twice a month on weekends
      if (isWeekend && rng() < 0.2) {
        // pick a random road anywhere in Luzon that's NOT Manila biased
        const candidates = ROADS.filter(r => r.city !== 'manila');
        const r = candidates[Math.floor(rng() * candidates.length)];
        segments.push({ startHour: randInt(rng, 9, 14), endHour: randInt(rng, 15, 20), pathId: r.id, direction: rng() < 0.5 ? 1 : -1 });
      }
      // Optional late-night short drive
      if (rng() < 0.15) {
        const start = randInt(rng, 21, 22);
        segments.push({ startHour: start, endHour: Math.min(23, start + 1), pathId: homePath.id, direction: rng() < 0.5 ? 1 : -1 });
      }

      // sort by start
      segments.sort((a, b) => a.startHour - b.startHour);
      days.push(segments);
    }
    return { car, days };
  });
}
