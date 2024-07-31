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
  RemoteTrackPublication,
} from "livekit-client";
import Button from "@/components/shared/button";
import NavigateButtons from "@/components/shared/navigate-buttons";

const roomName = "chat";

export default function LiveKit() {
  const { userData } = useUserStore();
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenTrackRef = useRef<Track | null>(null);

  const [livKitToken, setLiveKitToken] = useState<string>("");
  const [connectedRoom, setConnectedRoom] = useState<Room>();
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(false);
  const [isMyScreenShared, setIsMyScreenShared] = useState<boolean>(false);
  const screenShareVideoRef = useRef<HTMLVideoElement>(null);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [screenTrack, setScreenTrack] = useState<Track | null>(null);

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
    const handleTrackSubscribed = (
      track: Track,
      publication: RemoteTrackPublication
    ) => {
      if (
        track.kind === "video" &&
        remoteVideoRef.current &&
        publication.trackInfo?.name !== "share-screen"
      ) {
        track.attach(remoteVideoRef.current);
      } else if (
        track.kind === "video" &&
        publication.trackInfo?.name === "share-screen"
      ) {
        screenTrackRef.current = track;
        setScreenTrack(track);
        if (screenShareVideoRef.current) {
          track.attach(screenShareVideoRef.current);
        }
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
    room.on(RoomEvent.DataReceived, (payload, participant) => {
      const message = new TextDecoder().decode(payload);

      if (message === "stopScreenShare") {
        stopScreenShare();
      }
    });

    await room.connect(
      process.env.NEXT_PUBLIC_LIVEKIT_URL as string,
      livKitToken
    );

    const localTracks = await createLocalTracks({
      audio: true,
      video: false,
    });
    setIsMicOn(true);
    setIsVideoOn(false);

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

  const addVideoTrack = async () => {
    const videoTracks = await createLocalTracks({
      video: true,
    });

    videoTracks.forEach((track) => {
      if (track.kind === "video" && localVideoRef.current) {
        setVideoTrack(track as LocalVideoTrack);
        track.attach(localVideoRef.current);
        connectedRoom?.localParticipant.publishTrack(track);
        setIsVideoOn(true);
      }
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
    } else {
      addVideoTrack();
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

  const startScreenShare = async () => {
    if (isMyScreenShared) {
      stopScreenShare();
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenVideoTrack = new LocalVideoTrack(
          stream.getVideoTracks()[0]
        );

        if (screenShareVideoRef.current) {
          screenVideoTrack.attach(screenShareVideoRef.current);
        }

        await connectedRoom?.localParticipant.publishTrack(screenVideoTrack, {
          name: "share-screen",
        });
        const message = new TextEncoder().encode("stopScreenShare");

        connectedRoom?.localParticipant.publishData(message);
        screenTrackRef.current = screenVideoTrack;
        setScreenTrack(screenVideoTrack);
        setIsMyScreenShared(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    }
  };

  const stopScreenShare = () => {
    if (screenShareVideoRef.current) {
      screenTrackRef?.current?.detach(screenShareVideoRef.current);
      screenTrackRef?.current?.stop();
      screenTrackRef.current = null;
      if (screenTrack) {
        screenTrack.detach(screenShareVideoRef.current);
        screenTrack.stop();
        setScreenTrack(null);
      }
    }
    setIsMyScreenShared(false);
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
      <NavigateButtons />
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
              <Button onClick={startScreenShare}>
                {isMyScreenShared ? "Stop Screen Share" : "Start Screen Share"}
              </Button>
            </div>
          </>
        ) : (
          <Button className="w-full" onClick={connectToRoom}>
            Join Room
          </Button>
        )}
      </div>
      <div className="flex items-center justify-center h-full w-full gap-3 p-3">
        <div className="flex !w-full flex-col gap-3">
          <video
            className="!w-full h-[500px] bg-black rounded-lg"
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
          />
          <video
            className="!w-full h-[500px] bg-black rounded-lg"
            ref={remoteVideoRef}
            autoPlay
            playsInline
          />
        </div>
        <video
          ref={screenShareVideoRef}
          autoPlay
          playsInline
          className="w-full h-[1012px] bg-black rounded-lg"
        />
      </div>
    </div>
  );
}
