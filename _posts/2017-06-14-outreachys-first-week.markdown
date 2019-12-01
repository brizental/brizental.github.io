---
layout: post
title:  "Outreachy's First Weeks and Mocking Login"
date:   2017-06-14 14:12:00 -0300
categories: outreachy mozilla webcompat testing mocking
---
The first two weeks of Outreachy have passed already. This are my thoughts on them.

#### The first week

On the first day, me and Mike Taylor (my Outreachy mentor) had our first video conference. I was kind of nervous, but Mike is a super cool guy and everything went well. We introduced ourselves and Mike told me how the intership will happen. Basically, I will have a lot of freedom on choosing what to do. I have the guidelines for the project, which is "Better functional and Unit tests", but that is really open and I can even work on other stuff related to Webcompat.com, if I want to.

So, for the first week I mainly just familiarized myself even more with the tecnologies that I will be using throughout the internship (Intern.js, TravisCI, unittests, Browserstack, and so on) and I also finished up an issue about the label editor UI that I had been working on before the internship started.

#### My first assignment: Mocking the GitHub login

After this first week of getting used to everything, I wanted to get going and start actually working on issues about testing.

One big problem for the functional tests was that login was not mocked, and everytime we did any tests that involved it, the GitHub API would be called. That was a problem, because calling the GitHub API would slow down the tests which caused some intermittent errors because of latency. Also the tests would not work offline.

I started reading the GitHub API docs and the login flow works like this:

- First you have to get an access token from the GitHub API.
- Then you can use the token to make API requests as if you were logged in as a given user.

That was interesting, but didn't really tell me how I could mock it. Mind you, I had never worked with mocking before this and even had to familiarize myself with the concept.

After checking that, I started looking at the Flask Github Python module, that we use to access and login with GitHub through our application. The module is really small and I could kind of understand what it did quite easily. It even had some unittests in place, so that could have been a clue as to how to mock everything. Still I was kind of lost.

I even read some theory about OAuth 2 and mocking in general, but that didn't really help.

On the first week, me and Mike had setup a weekly meeting every Thursday and the day of the meeting was arriving and I had nothing to show. My anxiety was kicking in because of that (which I know is unnecessary, but anyways) and then I decided to look and see how our application worked, to see if I could find a way to mock the login through that.

Our app works like this: when the user logs in we get username and avatar from GitHub and add it to the Session object, also we create a database entry with the user and the acces token returned from GitHub. If there is a username and an avatar on the Session object, that means the user is logged in. Then it hit me, if I just skip the whole GitHub calling, add a fake username and a fake avatar to the Session object and inject a fake access token to the database entry function, that would do the trick. And it worked.

I showed Mike the solution and he was really pleased and surprised with my solution for the problem and the Pull Request was merged in.

Now, that are some issues with this solution, it just skips part of that code while testing and that is not good, because it leaves us with a blind spot. I think a better solution would be to patch the GitHub requests using the unittest.Mock object, but I will leave it for another time, since the solutiin that is in place now is working. We don't have any unit or functional tests to actually test the login function, so, when I go to that I will review this code.

#### Related Links

- [GitHub Authorization Flow](https://developer.github.com/apps/building-integrations/setting-up-and-registering-oauth-apps/about-authorization-options-for-oauth-apps/)
- [Flask GitHub Repo](https://github.com/cenkalti/github-flask)
- [OAuth2 Documentation](https://oauth.net/2/)
- [The PR for the Mcoked Login](https://github.com/webcompat/webcompat.com/pull/1588)

