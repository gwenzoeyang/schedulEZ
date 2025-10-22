# Concept: CrossRegTravel [Course]

## Purpose
Provide simple, reliable lookups between shuttle stops using a shared timetable.  
Given a departure time at one stop, return the **corresponding same‑index** time at another stop.  
This implementation **does not** compute feasibility, buffers, or violations; it only maps times by index across stops.

---

## Principle
- A single authoritative timetable object (`EXCHANGE_BUS_TIMES`) contains ordered times (strings in am/pm) for each stop.
- Two operations are supported:
  1) From **origin** time → **arrival** time at **dest** (same index)  
  2) From **dest** time → **departure** time at **origin** (same index)
- Defensive checks ensure the provided time exists and indices align.

---

## State
- `EXCHANGE_BUS_TIMES: Record<ExchangeStop, string[]>` — stop → ordered list of time strings (am/pm).  
- `ExchangeStop = keyof typeof EXCHANGE_BUS_TIMES` — exact union of stop names.

_No per-user or per-course state is kept._

---

## Actions

### `getArrivalTime(origin: ExchangeStop, dest: ExchangeStop, timeToLeave: string): string`
**Requires**  
- `timeToLeave` exists in `EXCHANGE_BUS_TIMES[origin]`  
- The derived index is within bounds of `EXCHANGE_BUS_TIMES[dest]`

**Effects**  
- Returns `EXCHANGE_BUS_TIMES[dest][idx]` where `idx` is the index of `timeToLeave` in the origin list.

**Throws**  
- `Error("Time not found at ${origin}: ${timeToLeave}")` if not present at origin  
- `Error("Schedule misalignment at index ${idx}")` if destination lacks that index

---

### `getDepartureTime(origin: ExchangeStop, dest: ExchangeStop, timeToArrive: string): string`
**Requires**  
- `timeToArrive` exists in `EXCHANGE_BUS_TIMES[dest]`  
- The derived index is within bounds of `EXCHANGE_BUS_TIMES[origin]`

**Effects**  
- Returns `EXCHANGE_BUS_TIMES[origin][idx]` where `idx` is the index of `timeToArrive` in the destination list.

**Throws**  
- `Error("Time not found at ${dest}: ${timeToArrive}")` if not present at dest  
- `Error("Schedule misalignment at index ${idx}")` if origin lacks that index

---

## Notes & Scope
- This concept does **not** estimate travel durations, buffers, or feasibility.  
- Validation is limited to time existence and index alignment across stops.  
- Times must be curated so that corresponding lists across stops share consistent ordering.


# Changes Made

The CrossRegTravel part changed the most in meaning. The original version described estimating travel times between campuses, but my actual code is much more direct — it just looks up shuttle times from a static timetable. So I rewrote the specification to match that, focusing on getArrivalTime and getDepartureTime instead of estimating or checking violations. I mentioned that the data comes from the EXCHANGE_BUS_TIMES dictionary, and that the goal is to provide reliable lookups rather than complex travel feasibility checks. It’s simpler now, but I think it better reflects what the file actually does.