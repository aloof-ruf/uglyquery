# Handlers

Handlers are functions that fire off based on a name. They have the following
features:

- a _trigger name_
- a _function_
- and _metadata_

## Trigger Names

Trigger names are strings that must be unique within an _endpoint_ (see below).
Readable endpoints are preferred, as they will be what 

## Handler Functions

## Metadata

Handler metadata is not required, but is often useful for understanding a 
particular handler. Metadata must be a map/object/dictionary/etc. although
entries may be whatever you desire. Metadata is returned via _metadata queries_
(described below).

# Endpoints

Endpoints are a set of handlers. Enpoints must be given handlers with *unique 
trigger names*, although the same handler (or same trigger name) can exist in 
two (or more) different endpoints simultaneously. 

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
