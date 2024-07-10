import { getLiveKitToken } from "@/model/services";
import useUserStore from "@/stores/user-store";
import { LiveKitGetTokenType, ReturnResponseType } from "@/types&enums/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoMdMic } from "react-icons/io";
import { IoMdMicOff } from "react-icons/io";
import { FaVideo } from "react-icons/fa";
import { FaVideoSlash } from "react-icons/fa";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  Track,
  createLocalTracks,
  LocalAudioTrack,
  LocalVideoTrack,
} from "livekit-client";
import Button from "@/components/shared/button";

const roomName = "chat";

export default function LiveKit() {
  const { userData } = useUserStore();
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [livKitToken, setLiveKitToken] = useState<string>("");
  const [connectedRoom, setConnectedRoom] = useState<Room>();
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(false);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);

  const fetchToken = async () => {
    try {
      const data: ReturnResponseType<LiveKitGetTokenType> =
        await getLiveKitToken({
          identity: userData.username,
          room: roomName,
        });
      const token = data.response?.token;
      setLiveKitToken(token);
    } catch (e) {
      console.log(e);
    }
  };

  const connectToRoom = async () => {
    const room = new Room();
    const handleTrackSubscribed = (track: Track) => {
      if (track.kind === "video" && remoteVideoRef.current) {
        track.attach(remoteVideoRef.current);
      }
    };

    const handleTrackUnsubscribed = (track: Track) => {
      if (track.kind === "video" && remoteVideoRef.current) {
        track.detach(remoteVideoRef.current);
      }
    };

    room.on(
      RoomEvent.ParticipantConnected,
      (participant: RemoteParticipant) => {
        participant.on("trackSubscribed", handleTrackSubscribed);
        participant.on("trackUnsubscribed", handleTrackUnsubscribed);
      }
    );

    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

    await room.connect(
      process.env.NEXT_PUBLIC_LIVEKIT_URL as string,
      livKitToken
    );

    const localTracks = await createLocalTracks({
      audio: true,
      video: true,
    });
    setIsMicOn(true);
    setIsVideoOn(true);

    localTracks.forEach((track) => {
      if (localVideoRef.current) {
        if (track.kind === "video") {
          setVideoTrack(track as LocalVideoTrack);
        }
        if (track.kind === "audio") {
          setAudioTrack(track as LocalAudioTrack);
        }
        track.attach(localVideoRef.current);
      }
      room.localParticipant.publishTrack(track);
      setConnectedRoom(room);
      setIsJoined(true);
    });
  };

  const toggleVideo = () => {
    if (videoTrack) {
      if (videoTrack.isMuted) {
        videoTrack.unmute();
        setIsVideoOn(true);
      } else {
        setIsVideoOn(false);
        videoTrack.mute();
      }
    }
  };

  const toggleAudio = () => {
    if (audioTrack) {
      if (audioTrack.isMuted) {
        audioTrack.unmute();
        setIsMicOn(true);
      } else {
        setIsMicOn(false);
        audioTrack.mute();
      }
    }
  };

  const leaveRoom = () => {
    connectedRoom?.disconnect();
    setConnectedRoom(undefined);
    setIsMicOn(false);
    setIsVideoOn(false);
    setIsJoined(false);
  };

  useEffect(() => {
    if (!userData.token) {
      router.push("/login");
    } else {
      fetchToken();
    }
    return () => {
      connectedRoom?.disconnect();
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <h1 className="text-4xl text-white">Room: {roomName}</h1>
      <div className="flex flex-col items-center gap-2">
        {isJoined ? (
          <>
            <Button className="w-full" onClick={leaveRoom}>
              Leave Room
            </Button>
            <div className="flex gap-2">
              <Button onClick={toggleAudio}>
                {isMicOn ? <IoMdMic size={20} /> : <IoMdMicOff size={20} />}
              </Button>
              <Button onClick={toggleVideo}>
                {isVideoOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
              </Button>
            </div>
          </>
        ) : (
          <Button className="w-full" onClick={connectToRoom}>
            Join Room
          </Button>
        )}
      </div>
      <div className="flex w-full mt-3 gap-3 px-3">
        <video
          className="w-full h-[500px] bg-black rounded-lg"
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
        />
        <video
          className="w-full h-[500px] bg-black rounded-lg"
          ref={remoteVideoRef}
          autoPlay
          playsInline
        />
      </div>
    </div>
  );
}
