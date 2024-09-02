"use client";
import { useEffect, useRef, useState } from "react";
// ES modules
import { io } from "socket.io-client";
import Peer from "peerjs";
import Image from "next/image";
import img from "./assets/images.webp"
// CommonJS
export default function Home() {
  const [socket, setSocket] = useState<any>();
  const [stream, setStream] = useState<MediaStream>();
  const videoRef = useRef<HTMLVideoElement>(null); // Use a ref to directly access the video element
  const callVid = useRef<HTMLVideoElement>(null);
  const [otherId, setOtherId] = useState<any>();
  const [peer, setPeer] = useState<Peer>();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((o) => {
        setStream(o);
        if (videoRef.current) {
          videoRef.current.srcObject = o;
        }
      });
  }, []);

  // https://omegle-clone-back-end.onrender.com
  useEffect(() => {
    let socketE = io("https://omegle-clone-back-end.onrender.com");
    socketE.on("get-id", (id) => {
      var peer = new Peer(`${id}`);
      peer.on("call", function (call) {
        call.answer(stream);
      });

      setPeer(peer);
    });
    socketE.on("break", () => {
      console.log("Hi")
      setOtherId(null)
    });
    setSocket(socketE);
  }, []);

  return (
    <div>
      <div id="vid" className="border-white border-solid " >
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="w-[20vh] h-[30vh] bg-black absolute right-0 "
        ></video>{" "}
      </div>

      {
        otherId ?
      <div id="vid" className="w-full h-[90vh]">
        <video
          ref={callVid}
          
          playsInline
          autoPlay
          className="w-full h-[100%] bg-black"
        ></video>
          </div> : < Image className="w-full h-[90vh]" src={img} width={100} alt = "dd"/>
      }
      <button
        className="w-full text-center bg-orange-600 h-[5vh]"
        onClick={() => {
          console.log('fcddd');
          
          socket.emit("cancel", otherId);
          setOtherId(null)
          socket.emit("search");
          socket.on("found", (id: any, myId: any) => {
            setOtherId(id);
            var call = peer!.call(id, stream!);

            peer!.on("call", function (call) {
              call.answer(stream);
            });

            call.on("stream", function (othstream) {
              if (callVid.current) {
                callVid.current.srcObject = othstream;
              }
            });
            
          });
        }}
      >
        Search
      </button>
    </div>
  );
}
/*


*/
