/*
    Class for the mobile image capture.
*/

import React, { useRef, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';

export default function Camera({ overLayImage, onCaptured }) {
    const [mediaStream, setMediaStream] = useState(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [captured, setCuptureTrue] = useState(false);
    const videoRef = useRef();
    const canvasRef = useRef();

    //initializes the required functions for camera stream
    useEffect(() => {
        async function enableVideoStream() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(
                    {
                        audio: false,
                        video: { facingMode: "environment" }
                    }
                );
                setMediaStream(stream);
            } catch (err) {
                console.log("Could not open the camera");
            }
        }

        if (!mediaStream) {
            enableVideoStream();
        } else {
            return function cleanup() {
                mediaStream.getTracks().forEach(track => {
                    track.stop();
                });
            };
        }
    }, [mediaStream]);

    //if there exists a media stream, show that using the video element
    if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = mediaStream;
    }

    /*
        used for playing the camera stream
    */
    function handleCamPlay() {
        setIsVideoPlaying(true);
        videoRef.current.play();
    }

    /*
        captures the currunt vidoe frame and draws that on the canvas
    */
    function handleCapture() {
        canvasRef.current.style.border = "6px solid gray";
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        const context = canvasRef.current.getContext("2d");
        setCuptureTrue(true);
        context.drawImage(
            videoRef.current,
            0,0
        );
    }

    return (
        <div>
            {/* video feed */}
            <video className="vidoeFeed" ref={videoRef} onCanPlay={handleCamPlay} autoPlay playsInline muted></video>
            {/* The foot overlay */}
            <div className="overLay_div_relative">
                <div className="overLay_div_absolute">
                    <img className="overLay" src={overLayImage} alt="overlay"></img>
                </div>
            </div>

            {/* capture button */}
            <div>
                {isVideoPlaying && (
                    <Button className="captureBtn" onClick={() => handleCapture()}>Capture</Button>
                )}
                {captured && (
                    <Button className="doneBtn" onClick={() => {videoRef.current.pause(); canvasRef.current.toBlob(blob => onCaptured(blob), "image/jpeg", 1)}}>Done</Button>
                )}
            </div>
            {/* Image canvase for the captured image */}
            <div>
                <canvas className="imageCanvas" ref={canvasRef}></canvas>
            </div>
        </div>
    )
}
