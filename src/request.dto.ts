import { IsNotEmpty, IsString } from 'class-validator';

export class DecisionEngineDto {
  @IsNotEmpty()
  @IsString()
  firstLastname: string;

  @IsNotEmpty()
  identification: string;

  @IsNotEmpty()
  requestAmount: number;

  @IsNotEmpty()
  interestRate: number;

  @IsNotEmpty()
  term: number;

  @IsNotEmpty()
  income: number;
}
