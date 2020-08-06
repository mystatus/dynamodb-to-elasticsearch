import {
  FilterParams,
  //ExpressionAttributeNames,
  //ExpressionAttributeValues,
} from '../src/types';

import { dnfArrayToDynamodbFilterParams } from '../src/dnf';

describe('can translate dnf', () => {
  it('single predicate', () => {
    expect.assertions(3);

    const params: FilterParams = dnfArrayToDynamodbFilterParams([
      [['Timestamp', '>', 123]],
    ]);

    expect(params.FilterExpression).toBe('#A > :A');
    expect(params.ExpressionAttributeNames).toStrictEqual({
      '#A': 'Timestamp',
    });
    expect(params.ExpressionAttributeValues).toStrictEqual({ ':A': 123 });
  });

  it('multiple or predicates', () => {
    expect.assertions(3);

    const params: FilterParams = dnfArrayToDynamodbFilterParams([
      [['Timestamp', '>', 123]],
      [['Hello', '=', 'World']],
    ]);

    expect(params.FilterExpression).toBe('(#A > :A) or (#B = :B)');
    expect(params.ExpressionAttributeNames).toStrictEqual({
      '#A': 'Timestamp',
      '#B': 'Hello',
    });
    expect(params.ExpressionAttributeValues).toStrictEqual({
      ':A': 123,
      ':B': 'World',
    });
  });

  it('multiple and predicates', () => {
    expect.assertions(3);

    const params: FilterParams = dnfArrayToDynamodbFilterParams([
      [
        ['Timestamp', '>', 123],
        ['Hello', '=', 'World'],
      ],
    ]);

    expect(params.FilterExpression).toBe('(#A > :A) and (#B = :B)');
    expect(params.ExpressionAttributeNames).toStrictEqual({
      '#A': 'Timestamp',
      '#B': 'Hello',
    });
    expect(params.ExpressionAttributeValues).toStrictEqual({
      ':A': 123,
      ':B': 'World',
    });
  });

  it('complex predicate', () => {
    expect.assertions(3);

    const params: FilterParams = dnfArrayToDynamodbFilterParams([
      [
        ['Timestamp', '>', 123],
        ['Hello', '=', 'World'],
      ],
      [['Ciao', '!=', 'Ciao']],
    ]);

    expect(params.FilterExpression).toBe(
      '((#A > :A) and (#B = :B)) or (#C != :C)'
    );
    expect(params.ExpressionAttributeNames).toStrictEqual({
      '#A': 'Timestamp',
      '#B': 'Hello',
      '#C': 'Ciao',
    });
    expect(params.ExpressionAttributeValues).toStrictEqual({
      ':A': 123,
      ':B': 'World',
      ':C': 'Ciao',
    });
  });
});
