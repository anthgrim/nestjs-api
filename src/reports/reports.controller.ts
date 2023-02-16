import { Controller, Post, Body } from '@nestjs/common';
import { CreateReportDto } from './dtos/create-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reportService: ReportsService) {}

  @Post()
  create(@Body() body: CreateReportDto) {
    console.log(body);
  }
}
