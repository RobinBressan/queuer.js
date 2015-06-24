import assign from 'object-assign';
import {EventEmitter} from 'events';
import {Promise} from 'es6-promise';

export default function() {
    let tasks = [];

    let queue = (initialPayload) => {
        return new Promise((resolve, reject) => {
            let canceled = false;
            queue.once(queue.EVENT_CANCEL, () => {
                canceled = true;
                reject(new Error('canceled'));
            });

            tasks
                .reduce(
                    (flow, task) => {
                        return flow.then((previousPayload) => {
                            if (canceled) {
                                throw new Error('canceled');
                            }

                            queue.emit(queue.EVENT_TASK_START, task.name, previousPayload);
                            return Promise.resolve()
                                .then(() => {
                                    return task.callback(previousPayload, queue);
                                })
                                .then((nextPayload) => {
                                    queue.emit(queue.EVENT_TASK_STOP, task.name, nextPayload);
                                    return nextPayload;
                                }, (error) => {
                                    queue.emit(queue.EVENT_TASK_ERROR, task.name, error);
                                    throw error;
                                });
                        });
                    },
                    Promise.resolve(initialPayload)
                )
                .then(resolve)
                .catch((error) => {
                    if (canceled) {
                        return;
                    }

                    reject(error)
                });
        });
    };

    return assign(queue, EventEmitter.prototype, {
        EVENT_TASK_START: 'EVENT_TASK_START',
        EVENT_TASK_STOP: 'EVENT_TASK_STOP',
        EVENT_TASK_ERROR: 'EVENT_TASK_ERROR',
        EVENT_CANCEL: 'EVENT_CANCEL',
        cancel: function() {
            // not using fat arrow to access arguments variable
            queue.emit.apply(queue, [queue.EVENT_CANCEL].concat([].slice.apply(arguments)));
        },
        task: (name, callback) => tasks.push({ name: name, callback: callback }),
    });
}
