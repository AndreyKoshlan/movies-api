import { IsEmail, IsMobilePhone, IsOptional, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ProfileRegistrationDto {
 
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Электронная почта пользователя',
    format: 'email'
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: 'pass12345',
    description: 'Пароль пользователя',
  })
  @MinLength(8)
  @MaxLength(256)
  readonly password: string;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя пользователя',
  })
  @MinLength(1)
  @MaxLength(256)
  readonly name: string;

  @ApiProperty({
    example: 'Иванов',
    description: 'Фамилия пользователя',
  })
  @MinLength(1)
  @MaxLength(256)
  readonly surname: string;

  @ApiProperty({
    example: '+79000000000',
    description: 'Номер телефона пользователя',
    required: false
  })
  @IsOptional()
  @IsMobilePhone()
  readonly phoneNumber: string;

  @ApiProperty({
    example: 'Люблю смотреть фильмы',
    description: 'Описание пользователя',
    required: false
  })
  @IsOptional()
  readonly selfDescription: string;
}