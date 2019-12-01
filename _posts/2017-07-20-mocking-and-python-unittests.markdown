---
layout: post
title:  "Mocking GET requests with Python unittest.Mock"
date:   2017-07-20 14:12:00 -0300
categories: outreachy mozilla webcompat testing mocking
---

At the Mozilla All Hands, I finished getting all functional tests to work offline. Which means that I got everything to return fixture data and none of our API calls to ever go to an external website. But while in the All Hands I also realized that some tests from our Python unit tests were network dependant and needed to be mocked.

#### unittest.Mock

Our unit tests are written in Python, because our application is in Flask. So, to make them network independent I had to mock everything out in Python. That's when I realized it was time to study and understand the Python unittest.Mock class. Because it provides us with a series of helper classes and methods to mock any function or object that you may need in a Python test.

In my case, I only needed to mock GET requests to the GitHub API. I had to patch the API call and return the expected data. In order to do that, understanding only one concept was key for me to know what I had to do: I only needed to patch the API call to GitHub, all the logic in the Webcompat application had to stay intact, or else I would be left with testing blind spots.

First I familiarized myself with the exact architecture of the webcompat application, to know which function I had to patch in order to only mock what was necessary. After doing that, it was very stright forward: patch the function and return the expected data from it.

Here is an example of one of the functions that I patched. Mind you, the function that made the API call is the `webcompat.helpers.proxy_request`:

```
def test_api_issues_out_of_range(self):
    '''API issue for a non existent number returns JSON 404.'''
    with patch('webcompat.helpers.proxy_request') as github_data:
        github_data.return_value = mock_api_response({
            'status_code': 404,
            'content': '[{"message":"Not Found","documentation_url":"https://developer.github.com/v3"}]'  # nopep8
        })
        rv = self.app.get('/api/issues/1', environ_base=headers)
        json_body = json.loads(rv.data)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.content_type, 'application/json')
        self.assertEqual(json_body['status'], 404)
```

You can see that I don't even need to return all the response that the GitHub API would, only the parts that I would need for everything to work right.

#### Related Links

- [The PR with the mocking of the requests](https://github.com/webcompat/webcompat.com/pull/1697/files)
- [unittest.Mock Documentation](https://docs.python.org/3/library/unittest.mock.html)
