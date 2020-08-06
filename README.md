# dynamodb-to-elasticsearch

[![npm version](https://badge.fury.io/js/%40mystatus%2Fdynamodb-to-elasticsearch.svg)](https://badge.fury.io/js/%40mystatus%2Fdynamodb-to-elasticsearch)

## Description

`dynamodb-to-elasticsearch` is a simple CLI tool for scanning over a DynamoDB table and sending documents to Elasticsearch.  This package is written in [TypeScript](https://www.typescriptlang.org/).

This package is currently maintained by [Defense Digital Service](https://dds.mil/) (DDS).

## Usage

### Installation

NPM:

```shell
npm install @mystatus/dynamodb-to-elasticsearch
```

Yarn:

```shell
yarn add @mystatus/dynamodb-to-elasticsearch
```

### Usage

```text
Usage: dynamodb-to-elasticsearch [options]

Options:
  -v, --version                              show version
  -d, --debug                                print debug output
  --aws-default-region <AWS_DEFAULT_REGION>  AWS Default Region
  --db-endpoint <DB_ENDPOINT>                DynamoDB Endpoint
  --db-table <DB_TABLE>                      DynamoDB Table
  --db-region <DB_REGION>                    DynamoDB Region
  --db-filter <DB_FILTER>                    filter to apply when scanning DynamoDB
  --db-filter-format <DB_FILTER_FORMAT>      format of the filter to apply when scanning DynamoDB (default: "dnf")
  --es-endpoint <ES_ENDPOINT>                Elasticsearch Endpoint
  --es-index <ES_INDEX>                      Elasticsearch Index
  -h, --help                                 display help for command
```

### NPX

To use `npx` to temporarily download and run `dynamodb-to-elasticsearch` use the following command.

```shell
npx github:mystatus/dynamodb-to-elasticsearch
```

## Local Development

Clone git repo:

```shell
git clone git@github.com:mystatus/dynamodb-to-elasticsearch
```

Download dependencies and build `@mystatus/dynamodb-to-elasticsearch`:

```shell
yarn
```

Rebuild `@mystatus/dynamodb-to-elasticsearch`:

```shell
yarn build
```

Run `@mystatus/dynamodb-to-elasticsearch`:

```shell
node dist/index.js
```

## Contributing

We'd love to have your contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more info.

## Security

Please see [SECURITY.md](SECURITY.md) for more info.

## License

This project constitutes a work of the United States Government and is not subject to domestic copyright protection under 17 USC § 105. However, because the project utilizes code licensed from contributors and other third parties, it therefore is licensed under the MIT License. See LICENSE file for more information.
