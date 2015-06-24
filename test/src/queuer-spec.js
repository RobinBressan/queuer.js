import {Promise} from 'es6-promise';
import queuer from 'queuer';

describe('Queuer', () => {
   let queue;
   let tasks;

    beforeEach(() => {
        tasks = [
            jasmine.createSpy('task1').and.callFake((cursor = 0) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => resolve(cursor + 5), 1000);
                });
            }),
            jasmine.createSpy('task2').and.callFake((cursor) => {
                return cursor * 2;
            }),
            (cursor, queue) => {
                queue.emit('custom', 'event');
                return cursor;
            },
        ];
        queue = queuer();
        queue.task('task1', tasks[0]);
        queue.task('task2', tasks[1]);
        queue.task('task3', tasks[2]);
    });

    it('should execute the tasks in the right order', (done) => {
        queue(3)
            .then((cursor) => {
                expect(tasks[0]).toHaveBeenCalledWith(3, jasmine.any(Function));
                expect(tasks[1]).toHaveBeenCalledWith(8, jasmine.any(Function));
                expect(cursor).toBe(16);
                done();
            })
            .catch((error) => done(error || 'error'));
    });

    it('should emit events for each task', (done) => {
        let onTaskStart = jasmine.createSpy('onTaskStart');
        queue.on(queue.EVENT_TASK_START, onTaskStart);

        let onTaskStop = jasmine.createSpy('onTaskStop');
        queue.on(queue.EVENT_TASK_STOP, onTaskStop);

        queue(3)
            .then((cursor) => {
                expect(onTaskStart.calls.argsFor(0)).toEqual(['task1', 3]);
                expect(onTaskStop.calls.argsFor(0)).toEqual(['task1', 8]);

                expect(onTaskStart.calls.argsFor(1)).toEqual(['task2', 8]);
                expect(onTaskStop.calls.argsFor(1)).toEqual(['task2', 16]);
                done();
            })
            .catch((error) => done(error || 'error'));
    });

    it('should allow task to emit custom event', (done) => {
        let onCustomEvent = jasmine.createSpy('onCustomEvent');
        queue.on('custom', onCustomEvent);

        queue()
            .then(() => {
                expect(onCustomEvent.calls.argsFor(0)).toEqual(['event']);
                done();
            })
            .catch((error) => done(error || 'error'));
    });

    it('should expose a cancel method', (done) => {
        let onCancelEvent = jasmine.createSpy('onCancelEvent');
        queue.on(queue.EVENT_CANCEL, onCancelEvent);

        queue()
            .then(null, (error) => {
                expect(error.message).toBe('canceled');
                expect(tasks[0]).toHaveBeenCalled();
                expect(tasks[1]).not.toHaveBeenCalled();
                expect(onCancelEvent.calls.argsFor(0)).toEqual(['hello', 'world']);
                done();
            })
            .catch((error) => done(error || 'error'));

        setTimeout(() => queue.cancel('hello', 'world'), 100);
    });

    it('should emit an event if an error occurred in a task and reject the queue', (done) => {
        let queue = queuer();
        let error = new Error('Oops');
        let task2 = jasmine.createSpy('task2');

        queue.task('task1', () => {
            throw error;
        });
        queue.task('task2', task2);

        let onErrorEvent = jasmine.createSpy('onErrorEvent');
        queue.on(queue.EVENT_TASK_ERROR, onErrorEvent);

        queue()
            .then(null, (error) => {
                expect(error.message).toBe('Oops');
                expect(onErrorEvent.calls.argsFor(0)).toEqual(['task1', error]);
                expect(task2).not.toHaveBeenCalled();
                done();
            })
            .catch((error) => done(error || 'error'));

        setTimeout(() => queue.cancel(), 100);
    });
});
