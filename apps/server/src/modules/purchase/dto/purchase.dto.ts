import { IsNotEmpty, IsString } from 'class-validator'

export class PurchaseDto {
  @IsNotEmpty()
  @IsString()
  id: string

  @IsNotEmpty()
  @IsString()
  direct_post_url: string
}
