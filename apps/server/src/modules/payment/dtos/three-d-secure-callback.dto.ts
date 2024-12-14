import { IsOptional, IsString } from 'class-validator'

export class ThreeDSecureCallbackDto {
  @IsString()
  @IsOptional()
  MD?: string

  @IsString()
  PaRes: string
}
