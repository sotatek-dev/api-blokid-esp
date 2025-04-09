import { applyDecorators, Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

interface DtoPropertyOptions {
  type: Type<unknown> | Function | [Function] | Record<string, any> | 'file';
  structure?: 'array' | 'enum' | 'enumArray';
  validated?: boolean;
  required?: boolean;
  example?: any;
  deprecated?: boolean;
  description?: string;
}

/**
 * Comprehensive decorator for DTO's property. Must use everywhere
 * Note:
 * 1. Always validate the property by default
 *
 * @param {DtoPropertyOptions} options - The options for the property.
 * @returns The decorators for the property.
 */
function PropertyDto(options?: DtoPropertyOptions) {
  const { structure, validated, ...propertyOptions } = {
    validated: true,
    required: false,
    ...options,
  };
  const isFile = propertyOptions.type === 'file';
  const type = (isFile ? String : propertyOptions.type) as Type<unknown>;
  const isArray = structure === 'array' || structure === 'enumArray';
  const isEnum = structure === 'enum' || structure === 'enumArray';

  const decorators: PropertyDecorator[] = [
    Expose(),
    ApiProperty({
      ...propertyOptions,
      type,
      ...(isFile && { format: 'binary' }),
      ...(isEnum && { enum: Object.values(type), enumName: type.name }),
      isArray,
      required: propertyOptions.required,
    }),
  ];

  // required or optional?
  if (propertyOptions.required) {
    decorators.push(IsNotEmpty({ each: isArray }));
  } else {
    decorators.push(IsOptional({ each: isArray }));
  }

  if (!validated) {
    return applyDecorators(...decorators);
  }

  if (isArray) {
    decorators.push(IsArray());
  }

  // validate
  switch (type) {
    case String:
      decorators.push(IsString({ each: isArray }));
      break;
    case Number:
      decorators.push(IsNumber({}, { each: isArray }));
      break;
    case Date:
      decorators.push(IsDate({ each: isArray }));
      break;
    case Boolean:
      decorators.push(
        IsBoolean({ each: isArray }),
        Transform(({ obj, key }) => obj[key] === 'true'),
      );
      break;
    default: // enum
      isEnum && decorators.push(IsEnum(type as any, { each: isArray }));
  }

  return applyDecorators(...decorators);
}

export { PropertyDto };
