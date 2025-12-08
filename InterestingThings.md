# Interesting Moments (Assignment 4a)

Updated 4b - Changes I made:

Not much, the backend is pretty much the same. The only thing I changed was the Mongo Database and the information represented there, so I had to edit the representation of a course in the backend to include new categories (description, professor rating, etc)

Disconnect in the assignment goal and implementation - I realized while programming that Wellesley students can have travel scheduled the same time as a class, or as another travel (if they are trying to put in all possible times that they can board the bus). I really wanted my app to be more flexible than not, which is why I decided to simplify the entire CrossRegTravel.spec to have it just add times instead of also accouting for overlap.

[previously](context/src/CrossRegTravel.ts/20251019_083101.5cc65812.md)

[now](context/src/CrossRegTravel.ts/20251019_112534.a8b2a47f.md)

Composite Object Leak — By proxy, I realized that I should do the same with courses. The point of my app was for Wellelsey students to have more flexibility in choosing courses, and it would be a hassle to ask them to create a new schedule for every new variety of course they wanted to see. So, I changed it so that they would be able to add courses no matter the conflicts.

[previously](context/src/Schedule.ts/20251019_104733.f6746216.md)

[now](context/src/Schedule.ts/20251019_120137.7affa879.md)

Integrating with MongoDB was interesting because 1. I'm not quite sure it's actually working at all and 2. This opens many more possibilities for automation of the site. There is now potential for a web scraper so that every semester, I would not have to reenter every single course in the catalog. It is a very useful integration, moreso I would say than the gemini stuff.

[integration](context/src/CourseCatalog.ts/20251019_101401.36db6db8.md)

While working with AI, there was a point where it interpreted 2 courses touching as an overlap, which I guess might be true, but also, due to my knowledge of the actual practices of the university, I allowed for adjacent courses. I put this here because sometimes, I really don't understand the code that AI outputs. However, here, I understood the problem, and it was nice to feel needed.

[line 233](context/src/Schedule.ts/20251019_080429.e08f4474.md)

This was a time when the AI corrected and built upon itself without me having to say anything. It changed the way it defined the constants and keys for the bus times, and I liked the way it made that change. Usually I am always exasperated when the AI changes things without my telling it to, but this time was like a breath of fresh air.

[previously](context/src/CrossRegTravel.ts/20251019_112534.a8b2a47f.md)

[now](context/src/CrossRegTravel.ts/20251019_113034.fbd61f0a.md)