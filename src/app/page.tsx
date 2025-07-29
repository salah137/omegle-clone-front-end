"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import Image from "next/image";
import img from "./assets/images.webp";

export default function Home() {
  const [socket, setSocket] = useState<any>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [otherId, setOtherId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const callVid = useRef<HTMLVideoElement>(null);

  // Get camera/mic stream
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((localStream) => {
      setStream(localStream);
      if (videoRef.current) {
        videoRef.current.srcObject = localStream;
      }
    });
  }, []);

  // Set up Socket and Peer
  useEffect(() => {

    const socketInstance = io("http://localhost:3000");
    setSocket(socketInstance);

    const newPeer = new Peer();

    newPeer.on("open", (peerId) => {
      console.log("hhdhdhdhdhzvsdihqv");
      
      socketInstance.emit("register-id", peerId);
    });

    // Handle incoming call
    newPeer.on("call", (call) => {
      call.answer(stream!);
      call.on("stream", (remoteStream) => {
        if (callVid.current) {
          callVid.current.srcObject = remoteStream;
        }
        setOtherId(call.peer); // Set other ID for UI
      });
    });

    setPeer(newPeer);

    socketInstance.on("found", (peerId: string) => {
      setOtherId(peerId);
      const call = newPeer.call(peerId, stream!);
      call.on("stream", (remoteStream) => {
        if (callVid.current) {
          callVid.current.srcObject = remoteStream;
        }
      });
    });

    socketInstance.on("break", () => {
      setOtherId(null);
      if (callVid.current) {
        callVid.current.srcObject = null;
      }
    });

  }, [stream]);

  const handleSearch = () => {
    if (!socket || !peer || !stream) return;

    if (otherId) {
      socket.emit("cancel", otherId);
      setOtherId(null);
    }

    socket.emit("search");
  };

  return (
    <div>
      <div className="border-white border-solid">
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="w-[20vh] h-[30vh] bg-black absolute right-0"
        ></video>
      </div>

      {otherId ? (
        <div className="w-full h-[95vh]">
          <video
            ref={callVid}
            playsInline
            autoPlay
            className="w-full h-full bg-black"
          ></video>
        </div>
      ) : (
        <Image className="w-full h-[95vh]" src={img} width={100} alt="Waiting..." />
      )}

      <button
        className="w-full text-center bg-orange-600 h-[5vh]"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
}
