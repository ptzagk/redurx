import test from 'ava';
import Rx from 'rx';

import { createState } from '../../dist/state';

test('should be able to hook into leaf node observable prior to initial state', t => {
  const testVal = 42;
  const initialVal = 12;
  const finalVal = 54;
  const state = createState();
  const action = new Rx.Subject();

  state.connect();

  state('foo.bar').reduce(action, (state, val) => {
    t.is(state, initialVal);
    t.is(val, testVal);
    return finalVal;
  });

  t.plan(3);

  state('foo.bar').asObservable().skip(1)
    .subscribe(val => t.is(val, finalVal));

  state('foo.bar')
    .setInitialState(initialVal)
    .connect();

  action.onNext(testVal);
});

test('should be able to hook into tree node observable prior to initial state', t => {
  const testVal = 42;
  const initialVal = {
    a: 1,
    b: 2
  };
  const finalVal = {
    a: 43,
    b: 44
  }
  const state = createState();
  const action = new Rx.Subject();
  state('foo.bar').reduce(action, (state, val) => {
    t.deepEqual(state, initialVal);
    t.is(val, testVal);
    return finalVal;
  });

  t.plan(3);

  state('foo.bar').asObservable().skip(1)
    .subscribe(val => t.deepEqual(val, finalVal));

  state('foo.bar').setInitialState(initialVal);

  state.connect();

  action.onNext(testVal);
});

test('setInitialState should throw an error if called on a final node', t => {
  const state = createState();
  const node = state('foo');
  node.setInitialState(1);
  t.throws(() => node.setInitialState(2));
  t.throws(() => state.setInitialState({ foo: 3 }));
});

test('setInitialState should throw an error if children are added to a leaf node', t=> {
  const state = createState();
  const node = state('foo');
  node.setInitialState(1);
  t.throws(() => state.setInitialState({ foo: { bar: 1 }}));
});

test('node accessor should take initial state', t => {
  const fooState = 1;
  const bazState = {
    qux: 2
  };
  const state = createState();
  const foo = state('foo', fooState);

  t.plan(2);

  foo.asObservable().subscribe(val => t.is(val, fooState));

  state.connect();

  const baz = state('bar.baz', bazState);

  baz.asObservable().subscribe(val => t.deepEqual(val, bazState))

  baz.connect();
});
