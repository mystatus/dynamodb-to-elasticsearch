#!/usr/bin/env node

import AWS from 'aws-sdk';

import {
  Client as ElasticSearchClient,
  //
  ApiResponse,
  ClientOptions,
  RequestParams,
} from '@elastic/elasticsearch';

const commander = require('commander');

import { Command, CommanderError } from 'commander';

const pkg = require('../package.json');

export interface ProcessEnv {
  [key: string]: string | undefined;
}

interface Config {
  [key: string]: any;
}

const newCommand = (): Command => {
  const command = new commander.Command();
  command.storeOptionsAsProperties(false);
  command.passCommandToAction(false);
  return command;
};

const initFlags = (command: Command): Command => {
  return command
    .version(pkg.version, '-v, --version', 'show version')
    .option('-d, --debug', 'print debug output')
    .option(
      '--aws-default-region [AWS_DEFAULT_REGION]',
      'AWS Default Region',
      process.env.AWS_DEFAULT_REGION
    )
    .option(
      '--db-endpoint <DB_ENDPOINT>',
      'DynamoDB Endpoint',
      process.env.DB_ENDPOINT
    )
    .option('--db-table <DB_TABLE>', 'DynamoDB Table', process.env.DB_TABLE)
    .option('--db-region [DB_REGION]', 'DynamoDB Region', process.env.DB_REGION)
    .option(
      '--es-endpoint <ES_ENDPOINT>',
      'Elasticsearch Endpoint',
      process.env.ES_ENDPOINT
    )
    .option(
      '--es-index <ES_INDEX>',
      'Elasticsearch Index',
      process.env.ES_INDEX
    );
};

const checkConfig = (config: Config): string[] => {
  const errors: string[] = [];
  if (!config.dbEndpoint) {
    errors.push(`db-endpoint is missing, expecting value`);
  }
  if (!config.dbTable) {
    errors.push(`db-table is missing, expecting value`);
  }
  if (!config.awsDefaultRegion) {
    if (!config.dbRegion) {
      errors.push(
        `aws-default-region and db-region are missing, expecting value for either`
      );
    }
  }
  if (!config.esEndpoint) {
    errors.push(`es-endpoint is missing, expecting value`);
  }
  if (!config.esIndex) {
    errors.push(`es-index is missing, expecting value`);
  }
  return errors.sort();
};

const connectToDynamoDB = ({
  accessKeyId,
  secretAccessKey,
  sessionToken,
  region,
  endpoint,
}: any) => {
  return new AWS.DynamoDB.DocumentClient({
    accessKeyId,
    secretAccessKey,
    sessionToken,
    region,
    endpoint,
  });
};

const connectToElasticsearch = (options: ClientOptions) => {
  return new ElasticSearchClient(options);
};

const scan = ({ dynamodb, params }: any) => {
  return new Promise((resolve, reject) => {
    dynamodb.scan(params, (err: any, data: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const getErroredDocuments = (
  request: BulkUpload,
  response: ApiResponse
): any[] => {
  const erroredDocuments: any[] = [];

  response.body.items.forEach((action: any, i: number) => {
    const operation = Object.keys(action)[0];

    if (action[operation].error) {
      erroredDocuments.push({
        status: action[operation].status,
        error: action[operation].error,
        operation: request.body[i * 2],
        document: request.body[i * 2 + 1],
      });
    }
  });

  return erroredDocuments;
};

interface BulkUpload extends RequestParams.Bulk {
  body: any[];
}

const transferFunction = async (config: Config, env: ProcessEnv) => {
  config.awsDefaultRegion = config.awsDefaultRegion || env.AWS_DEFAULT_REGION;
  config.dbEndpoint = config.dbEndpoint || env.DB_ENDPOINT;
  config.dbRegion = config.dbRegion || env.DB_REGION;
  config.dbTable = config.dbTable || env.DB_TABLE;
  config.esEndpoint = config.esEndpoint || env.ES_ENDPOINT;
  config.esIndex = config.esIndex || env.ES_INDEX;
  config.debug = config.debug || false;

  if (config.debug) {
    console.log('Using config:', config);
  }

  const configErrors = checkConfig(config);

  if (configErrors.length > 0) {
    console.error('config is invalid:', configErrors);
    process.exitCode = 1;
    return;
  }

  if (config.debug) {
    console.log('Connecting to DynamoDB using credentials:', {
      endpoint: config.dbEndpoint,
      region: config.dbRegion || config.awsDefaultRegion,
    });
  }

  const dynamodb = connectToDynamoDB({
    endpoint: config.dbEndpoint,
    region: config.dbRegion || config.awsDefaultRegion,
  });

  if (config.debug) {
    console.log('Connecting to Elasticsearch using options:', {
      node: config.esEndpoint,
    });
  }

  const elasticsearch = connectToElasticsearch({ node: config.esEndpoint });

  const scanParams: any = {
    TableName: config.dbTable,
    ExclusiveStartKey: undefined,
  };

  let done = false;

  for (let i = 0; i < 10 && !done; i++) {
    if (config.debug) {
      console.log(
        `Scanning with exclusive start key ${scanParams.ExclusiveStartKey}`
      );
    }

    const data: any = await scan({
      dynamodb,
      params: scanParams,
    });

    if (config.debug) {
      console.log(`Collected ${data.Items.length} items.`);
      console.log(`LastEvaluatedKey: ${data.LastEvaluatedKey}`);
    }

    if (data.Items.length > 0) {
      const body = data.Items.flatMap((doc: any) => [
        { index: { _index: config.esIndex, _id: doc.ID } },
        doc,
      ]);

      const bulkRequest: BulkUpload = { refresh: 'true', body };

      const bulkResponse: ApiResponse = await elasticsearch.bulk(bulkRequest);

      if (config.debug) {
        console.log('Elasticsearch Response:', bulkResponse);
      }

      if (bulkResponse.body.errors) {
        const erroredDocuments: any[] = getErroredDocuments(
          bulkRequest,
          bulkResponse
        );
        console.error('Error inserting documents:', erroredDocuments);
        done = true;
        continue;
      }
    }

    if (data.LastEvaluatedKey !== undefined) {
      scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
    } else {
      done = true;
    }
  }
};

export async function main() {
  const command = newCommand();

  command.exitOverride((err: CommanderError) => {
    if (
      err.code === 'commander.help' ||
      err.code === 'commander.helpDisplayed'
    ) {
      process.exit(err.exitCode);
    }

    console.error(`Try transfer --help for more information."`);

    process.exit(err.exitCode);
  });

  initFlags(command).action((config: Config) =>
    transferFunction(config, process.env)
  );

  await command.parseAsync(process.argv);
}

main();
