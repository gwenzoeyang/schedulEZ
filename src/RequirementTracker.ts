import type { Course, Requirement } from "./CourseCatalog.ts";

export interface User {
  id: string;
  name?: string;
}

/**
 * === External dependency (assumed implemented elsewhere) =====================
 * Encodes the institution's rules that map courses -> fulfillment for each req.
 * You can back this by a rules engine, SQL, spreadsheets, etc.
 */
export interface RequirementRulesLike {
  /** All requirements that apply to this user (e.g., their catalog year/major). */
  allRequirementsFor(owner: User): Requirement[][];

  /**
   * Evaluate one requirement against the current course set.
   * Return whether it is fulfilled and which courses serve as evidence.
   */
  evaluate(
    owner: User,
    courses: Course[],
    requirement: Requirement,
  ): { fulfilled: boolean; evidence: Course[] };
}

/**
 * === Internal state model ====================================================
 * A RequirementState per (owner, requirement).
 */
export interface RequirementState {
  owner: User;
  requirement: Requirement;
  fulfilled: boolean;
  evidence: Set<Course>;
}

/**
 * === RequirementTracker concept =============================================
 * purpose:
 *   track whether a student’s chosen courses fulfill graduation/distribution requirements
 *
 * principle:
 *   progress is recomputed whenever a schedule changes; each requirement has rules
 *   mapping courses to fulfillment
 *
 * state:
 *   a set of RequirementStates with (owner, requirement, fulfilled, evidence)
 *
 * actions:
 *   - recompute(owner, courses)
 *   - missing(owner) -> Set<Requirement>
 *   - evidenceFor(owner, req) -> Set<Course>
 */
export class RequirementTracker {
  /**
   * State storage:
   *  userId -> reqKey -> RequirementState
   * reqKey is a normalized (lowercased) requirement code for stable lookup.
   */
  private states: Map<string, Map<string, RequirementState>> = new Map();

  constructor(private readonly rules: RequirementRulesLike) {}

  /**
   * === Action: recompute(owner, courses) =====================================
   * effects:
   *   update all RequirementStates for owner according to current courses
   *
   * Notes about Requirement[][]:
   *   The rules return grouped requirements (e.g., OR-groups). For tracking,
   *   we flatten to the individual Requirement items so each has its own state.
   */
  recompute(owner: User, courses: Set<Course>): void {
    const userId = owner.id;
    const current = this.ensureUserMap(userId);

    // Get grouped reqs, then flatten to individual Requirement items
    const grouped = this.rules.allRequirementsFor(owner); // Requirement[][]
    const flatReqs = flattenRequirements(grouped); // Requirement[]

    // Recompute each requirement afresh from current courses
    for (const req of flatReqs) {
      const key = reqKey(req);
      const { fulfilled, evidence } = this.rules.evaluate(
        owner,
        [...courses],
        req,
      );
      const state: RequirementState = {
        owner,
        requirement: req,
        fulfilled,
        evidence: new Set(evidence ?? []),
      };
      current.set(key, state);
    }

    // Optional: prune obsolete states that no longer apply to this user
    const validKeys = new Set(flatReqs.map(reqKey));
    for (const key of [...current.keys()]) {
      if (!validKeys.has(key)) current.delete(key);
    }
  }

  /**
   * === Action: missing(owner) -> Set<Requirement> =============================
   * effects:
   *   return the set of requirements not yet fulfilled for owner
   *
   * Notes:
   *  - If recompute() hasn't been called yet for this user, we initialize states
   *    from rules with an empty schedule (so the result is accurate: all missing).
   */
  missing(owner: User): Set<Requirement> {
    const userId = owner.id;
    this.ensureInitialized(owner); // ensures at least empty baseline exists

    const current = this.states.get(userId)!;
    const out = new Set<Requirement>();
    for (const s of current.values()) {
      if (!s.fulfilled) out.add(s.requirement);
    }
    return out;
  }

  /**
   * === Action: evidenceFor(owner, req) -> Set<Course> ========================
   * requires:
   *   req is a valid requirement for owner
   * effects:
   *   return the set of courses contributing to fulfillment of req
   *
   * Throws if req is not applicable to the owner (i.e., not in rules list).
   */
  evidenceFor(owner: User, req: Requirement): Set<Course> {
    const userId = owner.id;

    // Ensure baseline states exist so we can validate applicability
    this.ensureInitialized(owner);

    const current = this.states.get(userId)!;
    const key = reqKey(req);
    const state = current.get(key);
    if (!state) {
      // Not applicable for this owner per rules definition
      throw new Error(
        `RequirementTracker.evidenceFor: requirement "${req.code}" is not valid for this user`,
      );
    }
    return new Set(state.evidence);
  }

  // ------------------------------ helpers -----------------------------------

  /** Ensure there's a per-user map, creating it if needed. */
  private ensureUserMap(userId: string): Map<string, RequirementState> {
    let m = this.states.get(userId);
    if (!m) {
      m = new Map<string, RequirementState>();
      this.states.set(userId, m);
    }
    return m;
  }

  /**
   * Ensure we have at least a baseline set of states for this owner.
   * If nothing exists yet, we synthesize from rules using an empty course set.
   */
  private ensureInitialized(owner: User): void {
    const userId = owner.id;
    if (!this.states.has(userId) || this.states.get(userId)!.size === 0) {
      const empty = new Set<Course>();
      this.recompute(owner, empty);
    }
  }
}

/** Normalize requirement code for consistent keys (case-insensitive). */
function reqKey(req: Requirement): string {
  return (req.code || "").trim().toLowerCase();
}

/** Flatten Requirement[][] -> Requirement[] (defensive against null/undefined). */
function flattenRequirements(groups: Requirement[][]): Requirement[] {
  if (!groups) return [];
  // Remove any null/undefined groups or items defensively
  const out: Requirement[] = [];
  for (const g of groups) {
    if (!Array.isArray(g)) continue;
    for (const r of g) {
      if (r && r.code) out.push(r);
    }
  }
  return out;
}
