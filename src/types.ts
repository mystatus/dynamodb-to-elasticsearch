export interface Config {
  [key: string]: any;
}

export interface ExpressionAttributeNames {
  [key: string]: string;
}

export interface ExpressionAttributeValues {
  [key: string]: string | number;
}

export interface ProcessEnv {
  [key: string]: string | undefined;
}

export interface FilterParams {
  FilterExpression?: string | undefined;
  ExpressionAttributeNames?: ExpressionAttributeNames;
  ExpressionAttributeValues?: ExpressionAttributeValues;
}

export interface ScanParams extends FilterParams {
  TableName: string;
  ExclusiveStartKey?: string | number | undefined;
}

export interface QueryParams extends FilterParams {
  TableName: string;
  ExclusiveStartKey?: string | number | undefined;
}
