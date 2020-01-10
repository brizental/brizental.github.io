---
layout: post
title:  "This Week in Glean: Migrations"
date:   2019-12-06 17:30:00 +0100
categories: glean mozilla twig
---

(“This Week in Glean” is a series of blog posts that the Glean Team at Mozilla is using to try to communicate better about our work. They could be release notes, documentation, hopes, dreams, or whatever: so long as it is inspired by Glean. You can find [an index of all TWiG posts online.](https://mozilla.github.io/glean/book/appendix/twig.html))

Last week's blog post: [This Week in Glean: Differences](https://fnordig.de/2019/11/29/this-week-in-glean/) by jan-erik.

---

The Glean team has spent a bunch of 2019 rewriting the Glean SDK (which was initially written in Kotlin) in Rust and by the end of October we finally released that rewrite into the world. For more on that, refer to the previous TWiG blog post by jan-erik: [A Release](https://fnordig.de/2019/10/24/this-week-in-glean/).

Of course, as with any major rewrite, we had to put some mechanisms in place so that a client that needed to transition from a previous version did so without any major problems. For Glean, that meant data migrations. Each metric type was locally stored a bit differently in the Kotlin implementation than it is now in the Rust one, so that had to be changed. The migration code was to be run the first time the updated Glean was initialized and only once.

To be sure that our users were migrating as expected, [telemetry was added](https://github.com/mozilla/glean/pull/334/files) to know everytime a user migrated successfully.

Now that the Rust version had been released, it was time for us to check back on that and see if our users were migrating correctly. For that, I created two queries, one to verify that:
- Only users who should have migrated (e.g. sent pings in previous versions), recorded successful migrations;
- Users have recorded the successful migration only once;
- Users have only recorded successful migrations from versions above 19 -- which is the minimum version where they should.

And another one to verify that:
- For the daily clients that should have migrated, they all have done so.

The first query gave us positive results, with no or very little clients showing any of the problems we were looking for. Great!

The second query, also gave positive results with ~97,5% of our daily clients having recorded succesful migrations. Unfortunately, those ~2,5% that did not record successful migrations were a concern that needed to be verified.

Off I went to write yet more SQL, the question I wanted to answer this time being:
- Are the daily users that have not migrated always the same ones? Or are we getting different users everyday?

Since I didn't know how to answer exactly that with only SQL, I changed the question to:
- How many [metrics pings](https://mozilla.github.io/glean/book/user/pings/metrics.html#crossing-due-time-with-the-application-closed) does a user send after updating, but before recording the successful migration?

I found that for the users that **have** recorded successful migrations, usually that count ranges between 0-2 pings, but for the users that **haven't** recorded the successful migration the count is between 1-73 pings.

(It should be noted, that in a perfect world, all users should send 0 pings after updating, but before migration. Migration should happen immediatelly and all pings should happen after that, but that is not happening due to [another issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1601960).)

Back to the users that haven't recorded a successful migration: the fact that they have recorded so many pings without recording the migration are already an indication that they have successfully migrated and for some reason haven't added that to the ping. Because of the way the migration was implemented, if the user doesn't successfully migrate, they will get a new client id, thus making it impossible for us to relate their pings from the new version with their pings from previous versions.

And that is that! I have still to find out why some clients are not correctly recording the successful migration and if you are curious about that, check on [this bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1599999). I might have found that out by the time you read this blog post.
