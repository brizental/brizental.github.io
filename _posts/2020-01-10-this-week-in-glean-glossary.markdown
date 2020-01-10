---
layout: post
title:  "This Week in Glean: Glossary"
date:   2020-01-10 13:30:00 +0100
categories: glean mozilla twig
---

(“This Week in Glean” is a series of blog posts that the Glean Team at Mozilla is using to try to communicate better about our work. They could be release notes, documentation, hopes, dreams, or whatever: so long as it is inspired by Glean. You can find [an index of all TWiG posts online.](https://mozilla.github.io/glean/book/appendix/twig.html))

Last blog post: [This Week in Glean: Migrations](https://brizental.github.io/2019/12/06/this-week-in-glean-migrations.html) by me.

---

I am the newest Glean team member, having joined October/2019. One of the most challenging parts of understanding our product and our code base these past months has been keeping up with terminology. Coming from a web development background, some of the terms used in Glean have slight or big differences in meaning from that context. This has been an exercise in resignifying or flat out learning new words from the English language.

This blog post will be a sort of glossary with explanations and background on the terms that stood out to me.

### The glossary

#### "Glean", not "GLEAN" or "glean"

I think it is appropriate to start with the name of the product. Contrary to what I thought before joining the team, “Glean” is not an acronym. This may be obvious to those who already know the word, but I didn’t and the logo can be misleading since all the letters are capitalized.

{% include image.html
  url="https://raw.githubusercontent.com/mozilla/glean/master/docs/glean.jpeg"
  description="The Glean logo. To know more about it, see <a href='https://dianaciufo.wordpress.com/2019/10/11/glean-graphic-identity-for-mozilla-firefox/' target='_blank'>This Week in Glean: What is the Glean logo about?</a>"
%}

According to [the dictionary](https://www.merriam-webster.com/dictionary/glean) the word "glean" means:
> to gather information or material bit by bit

There are other meanings to it, of course. The one I quoted is the one that makes the most sense given what Glean is about.

I should also note that Glean is not a synonym to The Glean SDK, which is part, but not the whole of the Glean product. For more on “what is Glean exactly”, refer to [the documentation](https://docs.telemetry.mozilla.org/concepts/glean/glean.html).

Finally, as suggested by the title of this section, the “official” way to write “Glean”, is by capitalizing the word. Not all caps, not non-capitalized.

#### "metric"

Metrics are the individual things being measured using Glean. They are defined in `metrics.yaml` files. Glean itself provides some metrics out of the box and looking at its own [`metrics.yaml`](https://github.com/mozilla/glean/blob/master/glean-core/metrics.yaml) we can see some examples of what a metric can be:

- The metric `glean.baseline.duration` of type `timespan` holds "The duration of the last foreground session."
- The metric `glean.internal.metrics.os` of type `string` holds "The name of the operating system."
- The metric `glean.internal.metrics.first_run_date` of type `datetime` holds "The date of the first run of the application."

In previous versions of telemetry the word “probe” was used to describe a metric. The Glean team decided not to use that word anymore because it can be misleading since its meaning is not accurate to what a metric is.

For more information or questions on how to define or set metrics, refer to [The Glean SDK Book](https://mozilla.github.io/glean/book/user/adding-new-metrics.html).

#### "ping"

In the Glean context, a ping is an entity used to bundle related metrics. Out of the box the Glean SDK provides four default pings: the baseline ping, the metrics ping, the events ping, and the deletion-request ping. The Glean SDK also provides a way for the user to define their own custom pings.

For more information on custom or default pings, refer to [The Glean SDK Book](https://mozilla.github.io/glean/book/user/pings/index.html).

#### "submission"

In the Glean context, “to submit” means the *to collect + to upload* a ping.

The Glean SDK stores locally all the metrics set by it or by its clients. Each ping has its own schedule to gather all its locally saved metrics and create a JSON payload with them (e.g. every time the app goes to background for the baseline ping, or everyday at 4am for the metrics ping). This is called “collection”.

Upon successful collection, the payload is queued for upload, which may not happen immediately or at all (in case network connectivity is not available).

Unless the user has defined their own custom pings, they don’t need to worry too much about submitting pings. All the default pings have their scheduling and submission handled by the SDK.

For information on how to submit pings, refer to [The Glean SDK Book](https://mozilla.github.io/glean/book/user/pings/custom.html#submitting-a-custom-ping).

### Conclusion

Naming is hard and consistency is key.
