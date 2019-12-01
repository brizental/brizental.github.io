---
layout: post
title:  "Travis CI and the Submission of PR's"
date:   2017-08-05 14:12:00 -0300
categories: outreachy mozilla webcompat testing travisci
---

One of the goals for my internship was to get the tests of pull requests submitted from forks to work, because they were not working and the reason was unknown. Here I will explain how I did it and how simple it was.

#### What is TravisCI

TravisCI is a continuous integration tool for GitHub test driven development. How it works is really simple, it provides us access to a remote virtual machine that we can control with a GUI and with a `.travis.yml` file. We use this machine to run a series of commands in the branch that is being sent by the a newly submitted pull request or commit.

To make things clearer, I'll just explain how we use it in Webcompat.

Everytime that a user sends in a commit or a pull request, we have a setup Travis configuration file that downloads the new code, builds the webcompat environment for development and runs the unit and functional tests to check that everything is alright. If all tests are passing, the pull request will have a small green tick after it's title, if it doesnt't the pull request will have a small red 'x' after it's title. We can also manually re-run all tests in a pull request as many times as we want.

#### What was the problem with our failing builds

In the Webcompat repository, we had a really annoying problem that was, even if all tests were passing in a pull request, if it came from a fork they would fail. That was even more annoying given that even some of our core contributors use forks instead of just using the webcompat repository.

Luckly the problem was really simple. 

Travis has some "secure variables" that are only available to the owners of the main repository being tested. Our tests were relying in some of these secure variables, because we had to add GitHub token and secret in order to access the GitHub API for running tests. Now, the only thing I had to do was remove all these secure variables, because, as I explained in my previous blog posts, one of the things that I did to the Webcompat unit and functional tests, was mock all GitHub API calls. Everything worked.

#### Conclusion

Sometimes the solution for a coding problem can be super simple. When I first started to tackle this problem I was trying all this crazy workarounds and I actually didn't even need them.

#### Related links

- [TravisCI Secure Variables Documentation](https://docs.travis-ci.com/user/environment-variables/)
- [The PR Where I Fixed the Secure Variables Problem](https://github.com/webcompat/webcompat.com/pull/1710)
