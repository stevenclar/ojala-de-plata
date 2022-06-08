import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DecisionEngineDto } from './request.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  decisionEngine(@Body() decisionEngineDto: DecisionEngineDto) {
    return this.appService.decisionEngine(decisionEngineDto);
  }
}
