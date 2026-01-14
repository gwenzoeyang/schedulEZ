---
timestamp: 'Sun Oct 19 2025 06:07:25 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_060725.80647228.md]]'
content_id: a9f8ce4823c0e661ec73ce194da15a91c0d6007fdbb5a31dfe4698a8c6f322af
---

# response:

Based on the provided text:

## What is a Concept?

A concept is a **reusable unit of user-facing functionality** that serves a **well-defined and intelligible purpose**. It is a separable, modular service designed to be specified, implemented, and understood independently by both users and developers.

Key characteristics of a concept include:

* **User-Facing:** Its behavior is understood as a human behavioral protocol (e.g., *reserve*, *cancel* for *RestaurantReservation*), while also being captured by an API for developers.
* **Reusable and Archetypal:** Concepts are designed to be used across different applications and instantiated multiple times within the same app, providing familiarity for users and a repository of design knowledge for developers.
* **Independent:** Each concept is defined without reference to any other concepts and can be understood in isolation. This allows for scalable design and unhindered reuse.
* **Complete:** It is self-sufficient with respect to its functionality and does not rely on other concepts to fulfill its purpose.
* **Separation of Concerns:** It addresses a single, coherent aspect of functionality, avoiding the conflation of different functions (e.g., user authentication, profiles, and notification are separate concepts, not combined in a single `User` class).
* **Modular:** It breaks down application functionality into discrete, manageable services.

## What Do You Need to Include in One?

To design and implement a concept, you need to include:

1. **A Well-Defined Purpose:** The concept must target a particular function of value in the context of the larger application. This purpose drives its design and behavior (e.g., *Upvote*'s purpose is to rank items by popularity).
2. **State:**
   * **Internal Data:** Each concept maintains its own state. This state typically involves objects of several different kinds, holding relationships between them (e.g., *Upvote* maintains relationships between items and users who voted).
   * **Sufficiency:** The state must be rich enough to support the concept's behavior (e.g., *Upvote* needs user identity to prevent double-voting).
   * **Minimality:** The state should be no richer than it needs to be for its specific purpose (e.g., *Upvote* doesn't need a user's name, only their identity).
   * **Persistence:** The state is generally made persistent using a database as part of its backend service implementation.
3. **Atomic Actions:**
   * **Interactions:** Concepts interact with users and other concepts through discrete, atomic actions.
   * **User and Output Actions:** These can be actions performed by users (e.g., *reserve*, *cancel*) or output actions that occur spontaneously under the concept's control (e.g., a notification being sent).
   * **API Specification:** These actions form the basis of the concept's backend API specification.
4. **Behavioral Protocol:** This is the human-understandable pattern of interaction that defines how users engage with the concept's functionality (e.g., the sequence of reserving, canceling, or being seated for *RestaurantReservation*).
5. **Polymorphic Design:** To ensure independence, the concept's design should be as free as possible from assumptions about the content and interpretation of objects passed as action arguments. Inputs should be generic identities, not specific types from other concepts (e.g., *Comment* should apply to arbitrary targets defined only by identity, not just posts).
