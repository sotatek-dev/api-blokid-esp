# BlokId ESP API

## Overview

Coming soon

## How to start

```shell
docker compose up -d database # start docker
# Take the .env from developers
yarn install
yarn db:gen
yarn start:dev
```

## Deployment

```shell
yarn api:deploy  # most of the time it works
# If it is not then
rsync -avz tmp/blokid-image.tar blokId@172.16.200.107:/home/blokId # push docker image to server
# You must ssh to server then
docker load -i blokid-image.tar # load the docker image
docker run -d --name api-blokid -p 3000:3000 -v ./logs:/api-blokid/logs blokid-image
# you can take a look at Makefile if exist
docker exec -it api-blokid bash # interact 
```

## Project special features

#### How to generate admin

```shell
yarn tool:genadmin -e admin@sotatek.com -p Sota@001
```

## Rules, Regulations and Recommendations

### How to write good Dto (recommended)

- **Use `yarn tool:nestjs` to create dto and modules**

If not then:

1. Endpoint dto order: Get -> Create -> Update -> otherwise
2. Each endpoint have ResponseDto, BodyDto, QueryDto, ... attached
3. Separate dto by ```//``` or create a new file if too large
4. Set decorator for each property using @PropertyDto
5. DtoName = ```OperationId + Response/Request/Body/Query/Param + Dto``` (e.g.CreateCourseResponseDto)
6. Extend by corresponding Dto Type. Response should extend Response and Body should be extended by Body (
   e.g.GetCourseResponseDto extends CreateCourseResponseDto)
7. Take a look at "src/modules/base/database/dtos" for database model overview

### Automatic generate Dto classes for 1 module

```shell
yarn tool:gendto -m <path> -s <schemaPathInput> 
# Example: yarn tool:gendto -m cashflow/statement -s cashflow_statement
```

### Draw Entity-Relationship Diagrams, Painlessly 😎

1. Visit: https://dbdiagram.io/d
2. Import prisma/dbml/schema.dbml file
3. Enjoy

### Code style

- [StyleGuide and Coding Conventions](https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md) (
  An unofficial TypeScript StyleGuide)

### Environment variables

- Use `,` to separate multiple values in the same environment variable (array)
- .env file can be used to set up Docker image by docker-compose.yml

## How to debug

Webstorm node param:

```
 -r ts-node/register -r tsconfig-paths/register --trace-warnings
```

Vscode config:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "runtimeArgs": [
        "-r",
        "ts-node/register",
        "-r",
        "tsconfig-paths/register",
        "--trace-warnings"
      ],
      "args": [
        "${workspaceFolder}/src/main.ts"
      ],
      "sourceMaps": true,
      "cwd": "${workspaceFolder}",
      "protocol": "inspector"
    }
  ]
}
```

## Database and Prisma Guide

- **You should use `yarn db` to manipulate with database for better usage.**

#### Understand prisma migrate commands

| Command (prisma) | Environments    | Description                                                                      |
|------------------|-----------------|----------------------------------------------------------------------------------|
| `migrate dev`    | ALL except prod | Creates and applies a new migration                                              |
| `migrate reset`  | Dev             | Resets the database and reapplies all migrations. Useful for <b>Development</b>. |
| `migrate deploy` | Prod            | Applies all pending migrations in <b>Production</b>.                             |
| `db push`        | Local           | Updates the database without creating a migration file. Use in <b>Local</b>.     |
| `migrate status` | ALL             | Shows the migration status (pending/applied migrations).                         |

## Importing in this project

### Barrel Files Import

1. Barrel files should not be used when importing files within the same directory

```typescript
import {DatabaseService} from './database.service';
// not this
import {DatabaseService} from 'src/modules/base/database';
```

2. Otherwise, use alias path

```typescript
import {ServerException} from 'src/exceptions';
// not this
import {ServerException} from '../../../../exceptions';
```

### Solve Circular dependency

```typescript
// both sides of the relationship can use @Inject() and the forwardRef()
@Inject(forwardRef(() => CommonService))
@Inject(forwardRef(() => CatsService))
```
