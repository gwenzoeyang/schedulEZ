# CrossRegTravel — Concept Specification

## Purpose
Model cross-registration shuttle travel between campuses and compute travel times between stops based on known, hardcoded schedules.

## Principle
- Each route defines aligned arrays of stops and times; indices must correspond across origin/destination.  
- Errors are explicit when requested stops or times don’t exist.  
- Data is static and consistent across trips.

## State
- Hardcoded route tables per service (e.g., Exchange bus).  
- Each service defines:  
  - Ordered list of stops.  
  - Parallel ordered lists of departure/arrival times.  
- All times stored as `"HH:MM"` 24-hour strings.

## Actions

### `getArrivalTime(origin: string, dest: string, timeToLeave: string): string`
**Requires:**  
- `origin` and `dest` exist in the same route.  
- `timeToLeave` matches an entry in the `origin` stop’s schedule.  
**Effects:** Returns the arrival time at `dest` with the same index.  
**Errors:**  
- Throws if `origin`, `dest`, or `timeToLeave` are invalid.

---

### `getDepartureTime(origin: string, dest: string, timeToArrive: string): string`
**Requires:**  
- `origin` and `dest` exist in the same route.  
- `timeToArrive` matches an entry at the destination stop.  
**Effects:** Returns the departure time at `origin` with the same index.  
**Errors:**  
- Throws if any stop or time is invalid or misaligned.

## Invariants
- Each trip index maps 1:1 across all stops.  
- Stop names are unique within a route.  
- All time strings use `"HH:MM"` format.

## Notes
- The schedule is simplified (Friday evening differences ignored).  
- Future extensions may add per-day schedules, but index alignment must remain consistent.
