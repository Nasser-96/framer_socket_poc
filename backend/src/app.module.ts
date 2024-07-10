import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SocketModule } from './socket/socket.module';
import { JwtModule } from '@nestjs/jwt';
import { AppGateway } from './socket/socket.gateway';
import { LivekitService } from './livekit/livekit.service';
import { LivekitController } from './livekit/livekit.controller';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    SocketModule,
    JwtModule.register({
      secret: process.env.JSON_TOKEN_KEY,
    }),
  ],
  controllers: [AppController, LivekitController],
  providers: [AppService, AppGateway, LivekitService],
})
export class AppModule {}
