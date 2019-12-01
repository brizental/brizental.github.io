---
layout: post
title:  "Cross Browser Testing with Browserstack"
date:   2017-06-21 14:12:00 -0300
categories: outreachy mozilla webcompat testing crossbrowser
---

This will be another Outreachy diary.

One of my goals for the internship was to user Browserstack for cross browser testing. That is important, because right now we are only testing in Firefox, but our users can come from any browser, so we should test with as many as possible.

#### Trying Browserstack out

Browserstack a "free for open source projects" tool, that let's you use and run automated tests in remote machines with different operating systems, different browsers and even on mobile devices. Our functional tests are written using Intern.js, an awesome functional testing tool written in JavaScript, that uses Selenium to automate tests in any browser. Other than that, Intern.js has Browserstack Tunnel built in, so that the integration is painless.

Even though Browserstack is a great tool, I ran into quite a lot of problems while trying to do cross browser testing with it. I'm going to list them all here.

#### Uploading local files

One of the functionalitites that we check in our Intern.js tests is file uploading. The problem that I ran into was that, even though the tests were running in the Browserstack remote machine, the path for the test file that we wanted to upload was referencing my local machine and that returned a "File not found" error.

I looked for quite a while into that, but nothing seemed to work. It was a really weird error, because when I looked into Leadfoot's documentation it explained that when you tried to upload a file through a file input the driver would seamlesly upload the file to the remote server before uploading it through the input.

Anyways, I was completely lost on this issue, so I asked a question in Stack Overflow (my first question there ever) and a guy really helped me out. The only thing I needed to do was add this to the Intern.js configuration object:

```
capabilities: {
    fixSessionCapabilities: true,
    remoteFiles: true,
    .
    .
    #.
  },

```

### Latency

Now that I got the uploading out of the way, I could just start testing in different browsers. That was when I ran into another issue. It's great to test everything in remote machines, but it has a real set back: it is really slow. Because of the latency, many tests would time out or not run at all. For that I found no solution.

### Inconsi#stencies across browsers

Since we only tested with Firefox, we didn't have a real idea of how the tests would go about in diferent browsers. For starters, I tried testing with Chrome and that went well. The results were not so different from Firefox, one minor change to the tests code and everything passed.

Now it was time to try out Edge. When I started the internship, Mozilla sent me a MacBook Pro, so I didn't even have Edge to test with locally, anyways. The results were sad. Many of the tests didn't pass, the error messages were not really clear and I couldn't even test locally to have a better and faster development experience. I explained the issue to Mike and after checking Google Analytics and realizing that less than one percent of our users came from Edge (really should have looked at that first thing right, you live and learn) we decided to leave it aside and go back to it when we have time or if ever it becomes really important.

Finally it was time to test with Safari. Those were the most depressing results of all. The majority of tests would fail in Safari remote and locally, nothing made much sense and hope was crushed. Safari is the third most used browser among our users, but still it's not even 5% of our user base, so we decided to also leave it aside.

One import observation about this section is that even though tests were not passing, it didn't mean that the stuff being tested was not working. I tried testing manually and proved that. The problem was with Selenium or Leadfoot, so it was not crucial that we fixed it rig#ht away.

### Conclusion

Phew. 

After all this, I think I don't even have to say that I was frustrated with Browserstack. And then I got to thinking: Do we really need to use it? 

I added Chrome testing to our TravisCI Pull Request automated testing code and I found out that I could use OS X in Travis as well, so that I could test Safari with it too. And that was my answer: I didn't really need to use it.

I presented to Mike my findings and he agreed that it was not necessary and we closed all issues about it. 

I think Browserstack is a really good tool if your application has users coming from all sorts of places from mobile devices to diferent operating systems and different browsers, but it turns out that is not the case for Webcompat. Our users come from Desktop devices almost exclusively using Firefox or Chrome and Browserstack was overkill and an unnecessary burden.

Now what is left to be done is see what is going on with Safari and get all tests running with it so that we can also test there, but I think I should leave this issue aside for now since it's too saturated in my mind at the mo#ment.

### Related Links

- [Browserstack Website](https://www.browserstack.com/#)
- [Leadfoot Docs](https://theintern.io/leadfoot/)
- [My Stack Overflow Question](https://stackoverflow.com/questions/45201328/how-can-i-test-an-input-type-file-with-browserstack)




