// src/livekit/livekit.service.ts
import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import ReturnResponse from 'src/helper/returnResponse';
@Injectable()
export class LivekitService {
  constructor() {}

  async createAccessToken(identity: string, roomName: string) {
    const module = await eval(`import('livekit-server-sdk')`);

    const additionalData = { username_form_server: identity, blah: 'blah' };

    const at = new module.AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_SECRET_KEY,
      {
        identity,
        metadata: JSON.stringify(additionalData),
      },
    ) as AccessToken;

    at.addGrant({ roomJoin: true, room: roomName });

    const token = await at.toJwt();

    return ReturnResponse({
      is_successful: true,
      response: { token: token },
    });
  }
}
