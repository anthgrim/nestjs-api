import { IsNumber } from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  price: number;
}
