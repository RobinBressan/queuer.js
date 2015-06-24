# Queuer [![Build Status](https://travis-ci.org/RobinBressan/queuer.js.svg?branch=master)](https://travis-ci.org/RobinBressan/queuer.js)

Run easily queue of tasks.

## Installation

It is available with bower or npm:

```
bower install queuer.js
npm install queuer.js
```

Include `queuer.min.js` to the HTML, and the `queuer` object is now available in the global scope:

```html
<script type="text/javascript" src="/path/to/bower_components/queuer.js/dist/queuer.min.js"></script>
```

Alternately, you can use a module manager to avoid global scoping:

```js
var queuer = require('queuer.js');
// or es6 import
import queuer from 'queuer.js';
```

# Usage

## Create a queue

```js
var queue = queuer();
```

## Register tasks on it

```js
queue.task('task1', function(payload, queue) {
    // the payload will be either the result of the previous task
    // or the initial payload given to the queue if it is the first task
     
    // the queue argument is the task's queue
    
    console.log('I am a task');

    // if you want to deal with async task you must return a promise.
});

```

## Running the queue

```js
queue(initialPayload) // You can pass an initial payload to the queue
    .then(function(payload) {
        // everything worked
        // the payload is the result returned by the last task
    })
    .catch(function(error) {
        // an error occured, the queue was stopped
    });
```

## Dealing with events

The queue is an event emitter. That means you can emit or listen events on it. The queue already emit some events:

* `EVENT_TASK_START`: A task was started.
* `EVENT_TASK_STOP`: A task was stopped.
* `EVENT_TASK_START`: A task threw an error. 
* `EVENT_CANCEL`: The queue was canceled.

To register an event listener use `on(event, listener)` or `once(event, listener)` method on the queue:

```js
queue.on(queue.EVENT_TASK_START, function(taskName, payload) {
    // taskName was started with the given payload
    // other task events have the save listener signature
});

queue.once(queue.EVENT_CANCEL, function() {
    // the queue was cancelled
    // we use once instead of on because it will happen only once
});
```

As the queue is given as an argument to the task, you can use it in tasks to listen or to emit some custom event as you wish:

```js
queue.task('task1', function(payload, queue) {
    queue.once(queue.EVENT_CANCEL, function() {
        // the queue was canceled, we use this to cancel our task's asynchronous operations
    });

    queue.on('myCustomEvent', function(data) {
        // we listen to our custom event
    });
});

queue.emit('myCustomEvent', 'test');
```

## Cancel the queue

The queue exposes a shorcut method to cancel it `queue.cancel()`. You can pass arguments to it if you wish, they will be forwarded across the cancel event.

# Development

## Installation

`make install`

## Build

`make build` or `make build-dev` (unminified version)

## Watch

`make watch`

## Test

`make test`

## Contributing

All contributions are welcome and must pass the tests. If you add a new feature, please write tests for it.

## License

This application is available under the MIT License.

