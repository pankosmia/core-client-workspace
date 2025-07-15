import React, { useEffect, useRef, useState } from 'react';
// import { useMicrophonePermission } from './getMIcPermission';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Typography } from '@mui/material';
import { postJson, getText } from 'pithekos-lib';

const AudioRecorder = ({ metadata, setAudioFile }) => {
    const [recordedUrl, setRecordedUrl] = useState('');
    const mediaStream = useRef(null);
    const mediaRecorder = useRef(null);
    const [saveRecording, setSaveRecording] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timer, setTimer] = useState(0);
    const chunks = useRef([]);
    // const { permissionState, requestMicrophone } = useMicrophonePermission();


    const getSupportedMimeType = () => {
        const types = [
            "audio/webm",
            "audio/mp4",
            "audio/ogg; codecs=opus"
        ];

        for (let type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        console.log("No supported mime type found");
        return "";
    };

    const startRecording = async () => {
        // if (permissionState === "denied") {
        //     console.log("Permission denied");
        //     // requestMicrophone();
        //     return;
        // }
        try {
            // console.log("Starting recording, maybe");

            const stream = await navigator.mediaDevices.getUserMedia(
                { audio: true }
            );
            console.log("We have a stream");
            mediaStream.current = stream;
            mediaRecorder.current = new MediaRecorder(stream);
            mediaRecorder.current.ondataavailable = (e) => {
                // console.log("data available")
                if (e.data.size > 0) {
                    chunks.current.push(e.data);
                }
            };
            mediaRecorder.current.onstart = async () => {
                // console.log("Event: Recording started");
                setTimeout(() => {
                    setIsRecording(true);
                    setIsPaused(false);
                }, 250);
            };
            mediaRecorder.current.onstop = async () => {
                console.log("Recording stopped");
                setIsRecording(false);
                setIsPaused(false);
                setTimer(0);
                // if (saveRecording) {
                console.log("Saving recording ...");
                const recordedBlob = new Blob(
                    chunks.current, { type: "audio/mp3" }
                );
                const url = URL.createObjectURL(recordedBlob);
                setRecordedUrl(url);

                // const content = '<q id="a"><span id="b">hey!</span></q>';
                // const blob = new Blob([content], { type: "text/xml" });

                const formData = new FormData();
                formData.append("file", recordedBlob);

                const postUrl = "http://localhost:19119/burrito/ingredient/bytes/a/b/c?ipath=banana.mp3";

                console.log("Form data: ", formData);

                fetch(postUrl, {
                    method: "POST",
                    body: formData,
                }).then((response) => {
                    console.log("Response: ", response);
                });



                // }
                chunks.current = [];
            };
            mediaRecorder.current.start(250);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        setSaveRecording(true);
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            console.log("Stopping recording ...");
            mediaRecorder.current.stop();

        }
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach((track) => {
                track.stop();
            });
        }
    };

    const pauseRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.pause();
            setIsPaused(true);
        }
    }

    const resumeRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'paused') {
            mediaRecorder.current.resume();
            setIsPaused(false);
        }
    }

    const deleteRecording = () => {
        setSaveRecording(false);
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
        }
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach((track) => {
                track.stop();
            });
        }
    }

    useEffect(() => {
        if (isRecording && !isPaused) {
            const interval = setInterval(() => {
                setTimer(prev => prev + 0.1);
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isRecording, isPaused]);

    const formatTime = (time) => {
        const seconds = Math.floor(time % 60);
        const minutes = Math.floor(time / 60);
        return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
    }

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    return (
        <Box>
            <audio controls src={recordedUrl} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: "lightgray", borderRadius: 4, boxShadow: 1, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: "lightgray", borderRadius: 4, boxShadow: 0 }}>
                    <IconButton onClick={isRecording ? stopRecording : startRecording} style={{ backgroundColor: "lightgray", paddingRight: 0 }}>
                        {isRecording ? <StopIcon /> : <MicIcon />}
                    </IconButton>
                    {isRecording && (
                        <IconButton onClick={isPaused ? resumeRecording : pauseRecording} style={{ backgroundColor: "lightgray", paddingLeft: 0 }}>
                            {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                        </IconButton>
                    )}
                </Box>
                {(isRecording) ?
                    <div>
                        {formatTime(timer)}
                    </div>
                    : null
                }
                {isRecording ? <div style={{ margin: 2 }}>
                    {isPaused ? "Paused" : "Recording"}
                </div> : null}
                {isRecording && !isPaused ?
                    <span style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "red",
                        margin: 8
                    }}></span>
                    : null
                }
                {isRecording ? <IconButton onClick={() => deleteRecording()} style={{ backgroundColor: "lightgray" }}>
                    <DeleteIcon />
                </IconButton> : null}
            </Box>
        </Box>
    );
};
export default AudioRecorder;