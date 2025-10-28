# Implementing Synchronizations

The implementation of synchronizations is an almost direct mapping between the synchronization specifications and a very lightweight TypeScript DSL that allows each synchronization to be declared independently. To include them as part of your application, simply write them using a file name of `filename.sync.ts`, and store them anywhere under `src/syncs/` where you may have any number of directories and nesting. 

## Imports

At the top of each `filename.sync.ts` file, you can use the simplified imports `@concepts` and `@engine`:

```typescript
// These two help you declare synchronizations
import { actions, Sync } from "@engine";
// Choose whatever concepts you have
import { Button, Counter, Notification } from "@concepts";
```

If you have an error in importing your concepts, don't forget to run `deno run build` to automatically prepare the `@concepts` import that will scan your `src/concepts/` directory for your concepts and generate the proper imports.
## Example

Synchronization code maps directly from their specifications. This synchronization

```sync
when
	Button.clicked (kind: "increment_counter) : ()
then
	Counter.increment ()
```

can be represented in TypeScript as:

```typescript
// Each sync is a function that returns a synchronization record
const ButtonIncrement: Sync = ({}) => ({
    when: actions(
        [Button.clicked, { kind: "increment_counter" }, {}],
    ),
    then: actions(
        [Counter.increment, {}],
    ),
});
```

Each synchronization is a simple function that returns an record with the appropriate keys, minimally containing `when` and `then`. The `actions` helper function enables a shorthand specification of action patterns as an array, where the first argument is the concept action, the second the input pattern, and in the case of the `when` clause, the third is the output pattern.

Synchronizations may additionally have a `where` clause and specify variables. Suppose we had a synchronization involving a query on state:

```sync
when
	Button.clicked (kind: "increment_counter", user) : ()
	Counter.increment () : ()
where
	in Counter: count > 10
then
	Notification.notify ( message: "Reached 10", to: user)
```

Notice that we now have two variables: `user` and `count`. The `user` variable did not show up previously in the partial match for `Button.clicked` because we did not care who clicked the button, but in this case we'd like to know in order to have someone to send the notification `to`. In addition, we see that we have a `where` clause, in which we have a query looking for the `count`. The implementation is:

```typescript
// Each sync can declare variables by destructuring in the function input
const NotifyWhenReachTen: Sync = ({ count, user }) => ({
    when: actions(
        [Button.clicked, { kind: "increment_counter", user }, {}],
        [Counter.increment, {}, {}],
    ),
    where: (frames) => {
        return frames
            .query(Counter._getCount, {}, { count })
            .filter(($) => {
                return $[count] > 10;
            });
    },
    then: actions(
        [Notification.notify, { message: "Reached 10", to: user }],
    ),
});
```

Each synchronization function actually receives a special object that you can destructure arbitrarily to receive variables to use in your patterns: in this case, specifying `{ count, user }` gives us these two variables in the body of the function to use.

The `where` clause is itself also a function that simply takes in a set of `Frames` and returns a set of `Frames`. This refers to the idea that each `Frame` is a `Record<symbol, unknown>` describing the current bindings of the current frame, where each `Frame` that makes it through to the `then` clause corresponds 1-to-1 with calling all actions in the `then` with those bindings. 

To understand what is going on step-by-step, suppose a `user = "xavier"` clicks on the button, and the count is 11. Read through the comments below to follow along what the value of `frames` is at each point.

```typescript
// Suppose we a `user` = "xavier" clicks the button, when `count` = 11
const NotifyWhenReachTen: Sync = ({ count, user }) => ({
    when: actions(
        [Button.clicked, { kind: "increment_counter", user }, {}],
        // `user` is now bound to "xavier"
        [Counter.increment, {}, {}],
    ),
    where: (frames) => {
	    // frames = [{ [user]: "xavier" }]
        return frames
            .query(Counter._getCount, {}, { count })
            // frames = [{ [user]: "xavier", [count]: 11 }]
            .filter(($) => {
                return $[count] >= 10;
            });
            // no change, filter keeps it because count > 10
            // frames = [{ [user]: "xavier", [count]: 11 }]
    },
    then: actions(
        [Notification.notify, { message: "Reached 10", to: user }],
        // we have just one frame, so we fire:
        // Notification.notify { message: "Reached 10", to: "xavier" }
    ),
});
```

If our `count` was less than 10, the `filter` would have reduced `frames = []`, meaning that there would be no actions fired in the `then`. In this way, we are able to declaratively query on arbitrary concept state, as well as fire any number of actions afterward.

**Important:** the syntax `$[count] >= 10` refers to two things:
1. We typically use `$` as a shorthand to refer to the current frame or set of bindings.
2. `count` is a **symbol**, and therefore we do not write `$.count` and instead use `$[count]`

## Working with Frames

`Frames` is simply a small extension of the `Array` class, and all of the standard methods and iterator functions can be applied to it as we have seen (`map`, `filter`, etc.) We have also seen the one additional function, the `.query` method, which enables query functions on concepts to receive certain inputs and produce outputs that enrich the frame. In this basic `where` clause it enhances every frame with a `count` binding. In a slightly more advanced example, something like:

```
frames.query(Comment._getByTarget, { target: post }, { comment })
```

says to lookup the `post` binding for the frame, and query the `Comment` concept for all comments associated with a `target` of that `post`. 

These input/output pattern records match what you expect from the concept specifications. In this case, we have:

```concept
concept Comment [Target]
...
queries
	_getByTarget ( target: Target ): ( comment: Comment )
```

The input pattern, `{ target: post }` says to query with the `target` specified as whatever we have bound in the current set of frames to the variable `post`. The output pattern `{ comment }` leverages JavaScript's shorthand syntax, and really means `{ comment: comment }`, and says to take whatever the query outputs as `comment`, and bind it back into the frames as the `comment` variable.

To see this in action, consider the following synchronization:

```sync
when
	Requesting.request (path: "posts/delete", post) : (request)
	Post.delete (post) : (post)
where
	in Comment: comment has target of post
then
	Comment.delete (comment)
```

with the implementation

```typescript
// Delete all comments for a post when the post is removed
const PostCommentDeletion: Sync = ({ post, comment, request }) => ({
	when: actions(
	    [Requesting.request, { path: "/posts/delete", post }, { request }],
	    [Post.delete, { post }, { post }],
	),
	where: (frames) => {
		return frames
			.query(Comment._getByTarget, { target: post }, { comment }),
	},
	then: actions(
		[Comment.delete, { comment }]
	),
});
```

The interesting aspect of this case is that this notion of frames gives us iteration for free. `Comment._getByTarget` is a query and thus always returns an **array** of potential matches, and each results in a new frame. To visualize this, consider a post p1 with comments c1, c2, and c3 having p1 as their target. When p1 is deleted, the `frames` in the `where` clause evolves as:

```mermaid
flowchart TD
  A["start frames: [{ post: p1 }]"] --> B["where: query comments for post p1"]
  B --> C1["{ post: p1, comment: c1 }"]
  B --> C2["{ post: p1, comment: c2 }"]
  B --> C3["{ post: p1, comment: c3 }"]
  C1 --> D1["then: Comment.delete({ comment: c1 })"]
  C2 --> D2["then: Comment.delete({ comment: c2 })"]
  C3 --> D3["then: Comment.delete({ comment: c3 })"]
```

