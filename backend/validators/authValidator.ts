import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

export class RegisterDTO {
  @Expose()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsString()
  email!: string;

  @Expose()
  @IsString()
  @MinLength(12)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
  password!: string;
}

export class LoginDTO {
  @Expose()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsString()
  email!: string;

  @Expose()
  @IsString()
  password!: string;
}

export class RefreshTokenDTO {
  @Expose()
  @IsString()
  refreshToken!: string;
}