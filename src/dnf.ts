import {
  FilterParams,
  ExpressionAttributeNames,
  ExpressionAttributeValues,
} from './types';

const CharCodeA: number = 'A'.charCodeAt(0);

export const dnfExpressionToDynamodbFilterParams = (
  str: string
): FilterParams | undefined => {
  const arr: any = JSON.parse(str);

  if (!Array.isArray(arr)) {
    return undefined;
  }

  return dnfArrayToDynamodbFilterParams(arr);
};

export const dnfArrayToDynamodbFilterParams = (arr: any[]): FilterParams => {
  let FilterExpression = '';

  const names: string[] = [];

  const values: any[] = [];

  const ExpressionAttributeNames: ExpressionAttributeNames = {};

  const ExpressionAttributeValues: ExpressionAttributeValues = {};

  for (let i = 0; i < arr.length; i++) {
    if (arr.length > 1) {
      if (i == 0) {
        FilterExpression += '(';
      } else {
        FilterExpression += ') or (';
      }
    }
    for (let j = 0; j < arr[i].length; j++) {
      if (arr[i].length > 1) {
        if (j == 0) {
          FilterExpression += '(';
        } else {
          FilterExpression += ') and (';
        }
      }
      const [name, op, value] = arr[i][j];

      if (!names.includes(name)) {
        names.push(name);
      }

      if (!values.includes(value)) {
        values.push(value);
      }

      ExpressionAttributeNames[
        `#${String.fromCharCode(CharCodeA + names.indexOf(name))}`
      ] = name;

      ExpressionAttributeValues[
        `:${String.fromCharCode(CharCodeA + values.indexOf(value))}`
      ] = value;

      FilterExpression += `#${String.fromCharCode(
        CharCodeA + names.indexOf(name)
      )} ${op} :${String.fromCharCode(CharCodeA + values.indexOf(value))}`;
      if (arr[i].length > 1) {
        if (j == arr[i].length - 1) {
          FilterExpression += ')';
        }
      }
    }
    if (arr.length > 1) {
      if (i == arr.length - 1) {
        FilterExpression += ')';
      }
    }
  }

  return {
    FilterExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  };
};
