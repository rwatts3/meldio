/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from '../parser';
import { print } from '../printer';

describe('Printer', () => {

  it('prints minimal ast', () => {
    const ast = {
      kind: 'ScalarTypeDefinition',
      name: { kind: 'Name', value: 'foo' }
    };
    expect(print(ast)).to.equal('scalar foo');
  });

  it('produces helpful error messages', () => {
    const badAst1 = { random: 'Data' };
    expect(() => print(badAst1)).to.throw(
      'Invalid AST Node: {"random":"Data"}'
    );
  });

  const kitchenSink = readFileSync(
    join(__dirname, '/schema-kitchen-sink.graphql'),
    { encoding: 'utf8' }
  );

  it('does not alter ast', () => {
    const ast = parse(kitchenSink);
    const astCopy = JSON.parse(JSON.stringify(ast));
    print(ast);
    expect(ast).to.deep.equal(astCopy);
  });

  it('prints kitchen sink', () => {

    const ast = parse(kitchenSink);

    const printed = print(ast);

    expect(printed).to.equal(
`type Foo implements Bar {
  one: Type
  two(argument: InputType!): Type
  three(argument: InputType, other: String): Int
  four(argument: String = "string"): String
  five(argument: [String] = ["string", "string"]): String
  six(argument: InputType = {key: "value"}): Type
}

interface Bar {
  one: Type
  four(argument: String = "string"): String
}

union Feed = Story | Article | Advert

scalar CustomScalar

enum Site {
  DESKTOP
  MOBILE
}

input InputType {
  key: String!
  answer: Int = 42
}

extend type Foo {
  seven(argument: [String]): Type
}

mutation addFoo(id: ID!, name: String!) {
  newFoo: Edge(Foo)
  newFooWithEdge: Edge(Foo, FooEdge)
  statusMessage: String
}

type ConnectionsTest {
  nodeConnection: NodeConnection(Foo, baz)
  nodeConnectionWithEdge: NodeConnection(Foo, baz, FooEdge)
  objConnection: ObjectConnection(Foo)
  objConnectionWithEdge: ObjectConnection(Foo, FooEdge)
  scalarConnection: ScalarConnection(Int)
  scalarConnectionWithEdge: ScalarConnection(Int, IntEdge)
}

filter on NodeConnection(Foo) {
  ONE: {node: {three: {eq: 1}}}
  TWO: {node: {three: {eq: 2}}}
  THREE: {node: {three: {eq: 3}}}
  SOME: (number: Int) {node: {three: {eq: $number}}}
  ANY: {}
}

order on NodeConnection(Foo) {}

filter on NodeConnection(Foo, FooEdge) {
  ONE: {node: {three: {eq: 1}}}
  TWO: {node: {three: {eq: 2}}}
  THREE: {node: {three: {eq: 3}}}
  SOME: (number: Int) {node: {three: {eq: $number}}}
  ANY: {}
}

order on NodeConnection(Foo, FooEdge) {
  ONE: [{node: {one: ASCENDING}}, {node: {two: ASCENDING}}]
  TWO: [{node: {two: ASCENDING}}, {node: {one: ASCENDING}}]
}

filter on [Feed] {}

filter on ObjectConnection(Bar) {}

filter on ObjectConnection(Bar, BarEdge) {}

filter on ScalarConnection(String) {}

filter on ScalarConnection(String, StringEdge) {}

order on [Feed] {}

order on ObjectConnection(Bar) {}

order on ObjectConnection(Bar, BarEdge) {}

order on ScalarConnection(String) {}

order on ScalarConnection(String, StringEdge) {}
`);

  });
});
