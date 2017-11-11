# Ugly Query

Uglyquery is a request body format that adds incredible flexibility and functionality to your API. Simply setup
independent functions, stick 'em in and enpoint, and then experience ugly query for yourself!

## Begin with _handlers_

Handlers are simply functions that you want to use in your queries. They can do anything you normally do with
an API: insert/query a database, read from a file, perform complex computations- whatever! 

Lets setup some functions for our future queries:

```javascript
// myHandlers.js
const UglyHandler = require('uglyquery').UglyHandler;

module.exports = {
  matrixStore: [
    new UglyHandler('toFile', (args) => {  }),
    new UglyHandler('fromFile', (args) => {  })
  ],
  matrixWork: [
    new UglyHandler('add', (args) => {  }),
    new UglyHandler('mult', (args) => {  })
  ]
};
```

## Now stuff them in an _endpoint_

Endpoints are simply places to put a set of handlers. They are usually tied to a particular path, but that is
up to you!

Let's put those functions we made in an endpoint for our express server...

```javascript
// routes/index.js
```

## Enough setup, let's start querying!


## Pre/post processing

Well that was wonderful but there are some concerns. I don't want just _anyone_ to be able to use these functions.
Let's restrict the "matrix work" functions to signed-in users and the "matrix store" functions to administrators.
We can pull this off with _pre-processing functions_ which can be placed on individual endpoints or handlers.



## Metadata

There is another feature that both Endpoints and Handlers have that has not been discussed: _metadata_. UglyQuery
has specific commands that can be used to investigate default or user-defined metadata. Let's go back to our
matrix-api:

```javascript
// myHandlers.js
const UglyHandler = require('uglyquery').UglyHandler;

module.exports = {
  matrixStore: [
    new UglyHandler(
      'toFile',
      (args) => {  },
      {

      }),
    new UglyHandler('fromFile', (args) => {  })
  ],
  matrixWork: [
    new UglyHandler('add', (args) => {  }),
    new UglyHandler('mult', (args) => {  })
  ]
};
```

Now we can query that metadata with something like this...

```sh
```

Wonderful! We can feel free to mix metadata queries with other UglyQuery functions or our Handlers. There is
currently no specification on what you can keep in your metadata- it is simply a set of key/value pairs.

# Queries

Queries are HTTP POST requests with a JSON-formatted body. Here is an example:

```json
{
  "vars": {
    "var1": 22
  },
  "body": [
    "trigger1": {
      "args": {
        "arg1": 2,
        "arg2": "Something"
      },
      "return": ["arg1", "arg2"]
    },
    "trigger2": {
      "args": {
        "arg1": "$var1"
      }
    }
  ]
}
```

Queries have the following format:

```json
{
  "vars": {
    "var1": 2,
    "var2": "Something",
    "var3": {
      "more-data": "yes please"
    }
  },
  "body": [
    {
      "name": "trigger-name",
      "args": {
        "arg1": "Something",
        "arg2": 2,
        "arg3": [{ "a": "list" }, "of", 4, "things"],
        "arg4": {
          "something": "$var1",
          "somethingElse": "$var3",
          "somethingElseAgain": ["$var1", "$var2", "$var3"],
        },
      },
      "store": "some-var-name"
    },
    {
      "name": "another-or-the-same-trigger",
      ""
    }
  ]
}
```

Let's discuss some query features:

*"cond"*

Allows you 

*"switch"*

Allows you to run based on the value of a key

*"and"*

Accepts a list of values and triggers, firing them until one is falsey

*"or"*

Accepts a list of values and triggers, firing them until one is truthy

*"eq"*

Accepts a list of values that must be identical to return `true`. Objects will
be traversed- no pointer equality here people!

*"neq"*

Accepts a list of values and returns `true` if any two are not equal. Objects
will be traversed- no pointer equality here people!

*"not"*

*"gt"*

*"gte"*

*"lt"*

*"lte"*

*"map"*

*"reduce"*

# Metadata Queries

Both handlers and endpoints have metadata and configuration. It is often useful
for a client to investigate those metadata and configurations in order to
determine how to proceed. This functionality is provided through _metadata 
queries_.

Metadata queries, for the time being, cannot be defined as a handler like other
functions can. Instead, they are a default set of queries. Here is the list:

*"\_getmetadata"*

*"\_listhandlers"*

*"\_listendpoints"*

It is important to note that you can easily mix-in metadata queries with your 
other queries! You can even store the values you recieve so you can make
"intelligent queries." Here is an example:

```json

```
