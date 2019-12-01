---
layout: post
title:  "Promises and async / await with Intern.js"
date:   2017-08-20 14:12:00 -0300
categories: outreachy mozilla webcompat testing promises internjs
---

As I mentioned in my previous blog post about Browserstack, I got a lot of errors when I tried to run our Intern.js functional tests in browsers other than Chrome and Firefox. I left this issue aside at the time, because it was too saturated in my mind, but I decided to give it another go these past two weeks.

#### Understanding how Intern.js works

The framework that we use for Javascript functional testing is Intern.js. Intern.js has a tool called Leadfoot, that puts a layer of abstraction over the Selenium WebDriver API and makes it cross browser compatible. 

Here is an example of a simple Intern.js test that we have in the Webcompat tests: 

```
"Comments form visible when logged in": function() {
    return (
      FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
        // Comment form visible for logged in users.
        .findDisplayedByCssSelector(".js-Comment-form")
        .end()
    );
  },
```

Each one of the functions that is called inside of the tests return a promise.

#### Debugging Safari tests

The first thing I did to start debugging the Safari tests was modify the Intern.js config file to have the tests run on Safari. After I ran them a bunch of times, I realized that most of the errors I was getting were actually intermittent (they happened randomly). I fixed a lot of other intermittent errors in the tests before, and all of them where latency problems. Some function would return after or before expected.

Since all of the Intern.js/Leadfoot functions return Promises, I thought that maybe it was a problem of a function that resolved after expected and broke the code. So, I took one single test that failed in Safari continuously and decided to use it as a proof of concept. 

The test before I changed anything looked like this:

```
"Add a screenshot to a comment": function() {
    return FunctionalHelpers.openPage(
      this,
      url("/issues/100"),
      ".wc-Comment-body"
    )
      .findById("image")
      .type("tests/fixtures/green_square.png")
      .end()
      .sleep(2000)
      .findByCssSelector(".js-Comment-text")
      .getProperty("value")
      .then(function(val) {
        assert.include(
          val,
          "[![Screenshot Description](http://localhost:5000/uploads/",
          "The image was correctly uploaded and its URL was copied to the comment text."
        );
      })
      .end();
  },
```

I tried to modify it to call the Promises in a synchronous manner, which means, only call the next function once the previous one has resolved. The code looked horrible, but it worked, the test started passing. Here is what it looked like:

```
"Add a screenshot to a comment": function() {
	var remote = FunctionalHelpers.openPage(
	  this,
	  url("/issues/100"),
	  ".wc-Comment-body",
	    true
	  );
	  return (
	    remote
	      // Find image upload input.
	      .findById("image")
	      .then(function(el) {
	        el
	          // Type fixture image path into it.
	          .type(require.toUrl("../fixtures/green_square.png"))
	          .then(function() {
	            remote
	              .end()
	              // Find the comment textarea.
	              .findByCssSelector(".js-Comment-text")
	              .then(function(el) {
	                el
	                  // Get it's value.
	                  .getProperty("value")
	                  .then(function(val) {
	                    // Check that the value is what expected.
	                    assert.include(
	                      val,
	                      "[![Screenshot Description](http://localhost:5000/uploads/",
	                      "The image was correctly uploaded and its URL was copied to the comment text."
	                    );
	                  });
	              });
	          });
	      })
	      .end()
	  );
},
```

At the moment we have a total of 76 functional tests in 17 different files. It would be very difficult to maintain code like this. It's too extensive and difficult to read. So I started researching some other way to write it and make it look good and be easy to maintain, that's when I stumbled upon `async / await`.

#### Understanding async / await

When you have code that is heavy with Promises, async / await is a great tool to help you organize and synchronize your code. I think the best way to understand it is with a simple example:

```
function simplePromise() {
    return new Promise(function(resolve) {
        setTimeout(resolve, 10000);
    });
}

async function exampleAsync() {
	await simplePromise();
	console.log('Promise is done!');
}
```

If you run this example in your console, you will see that 'Promise is done!' will only be printed after the time interval. That is what async / await does. It holds of code execution until a promise is returned. The usage is pretty simple. It's important to note that for you to be able to use `await` you have to be inside of an asynchronous function and for a function to asynchronous you need to add the keyword `async` before declaring it.

#### Using async / await in our tests

I used the same test and applied the async / await idea to it. It looked like this:

```
"Add a screenshot to a comment": async function() {
    await FunctionalHelpers.openPage(
      this,
      url("/issues/100"),
      ".wc-Comment-body"
    );

    let input = await this.remote.findById("image");
    await input.type(require.toUrl("../fixtures/green_square.png"));

    let textarea = await this.remote.findByCssSelector(".js-Comment-text");
    let text = await textarea.getProperty("value");

    assert.include(
      text,
      "[![Screenshot Description](http://localhost:5000/uploads/",
      "The image was correctly uploaded and its URL was copied to the comment text."
    );
},
```

This looks much better than the first time I tried the idea. Interestingly enough, it didn't work.

Unfortunately, this blog post will end in a sad note as I didn't find out the solution for this and Safari tests are still on hold. We had some other more necessary features to add to the tests and my internship is almost over, so we left it aside, once again.

If anyone knows the solution for this, please write me or open an issue in the repository for this blog.

#### Related Links

- [Intern.js Tutorial with async / await examples](https://github.com/theintern/intern-tutorial)
- [Intern.js Website](https://theintern.io/)
- [async / await Definition on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)


