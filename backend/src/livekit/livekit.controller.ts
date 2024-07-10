// src/livekit/livekit.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { LivekitService } from './livekit.service';

@Controller('livekit')
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  @Get('token')
  getToken(@Query('identity') identity: string, @Query('room') room: string) {
    return this.livekitService.createAccessToken(identity, room);
  }
}
