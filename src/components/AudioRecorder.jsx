import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useWavesurfer } from '@wavesurfer/react'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'

import Waveform from './Waveform';

const AudioRecorder = ({ audioUrl, setAudioUrl, obs, metadata }) => {
    const mediaStream = useRef(null);
    const mediaRecorder = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const chunks = useRef([]);
    const waveformRef = useRef(null);
    const regionsPlugin = useMemo(() => RegionsPlugin.create(), []);
    const recordPlugin = useMemo(() => RecordPlugin.create(), []);
    const plugins = useMemo(() => [regionsPlugin, recordPlugin], [regionsPlugin, recordPlugin]);
    const [prise, setPrise] = useState("a");
    const [bakExists, setBakExists] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showOtherTracks, setShowOtherTracks] = useState(false);
    const [cursorTime, setCursorTime] = useState(0);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [trackDurations, setTrackDurations] = useState({});
    const [maxDuration, setMaxDuration] = useState(0);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [multiTrackMode, setMultiTrackMode] = useState(false); 

    const getUrl = (segment = "bytes", chapter = obs[0], paragraph = obs[1], newPrise = prise) => {
        let chapterString = chapter < 10 ? `0${chapter}` : chapter;
        let paragraphString = paragraph < 10 ? `0${paragraph}` : paragraph;
        return `/burrito/ingredient/${segment}/${metadata.local_path}?ipath=audio_content/${chapterString}-${paragraphString}/${chapterString}-${paragraphString}-${newPrise}.mp3`
    }

    const fileExists = async (newAudioUrl) => {
        const url = `/burrito/paths/${metadata.local_path}`
        const ipath = newAudioUrl.split("?ipath=")[1];

        const response = await fetch(url, {
            method: "GET",
        })
        if (response.ok) {
            const data = await response.json();
            // console.log(data);
            // console.log(`Data: ${data}, ipath: ${ipath} : ${data.includes(ipath)}`);
            if (data.includes(ipath)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    const listPrises = async (chapter, paragraph) => {
        const url = `/burrito/paths/${metadata.local_path}`
        const response = await fetch(url, {
            method: "GET",
        })
        const data = await response.json();
        let chapterString = chapter < 10 ? `0${chapter}` : chapter;
        let paragraphString = paragraph < 10 ? `0${paragraph}` : paragraph;
        return data.filter(item => item.includes(`audio_content/${chapterString}-${paragraphString}`) && !item.includes(".bak"))
    }

    const audioBufferToWav = (buffer) => {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);

        'RIFF'.split('').forEach((char, i) => view.setUint8(i, char.charCodeAt(0)));
        view.setUint32(4, 36 + length * 2, true);
        'WAVEfmt '.split('').forEach((char, i) => view.setUint8(8 + i, char.charCodeAt(0)));
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        'data'.split('').forEach((char, i) => view.setUint8(36 + i, char.charCodeAt(0)));
        view.setUint32(40, length * 2, true);

        const samples = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < length; i++) {
            view.setInt16(offset, samples[i] * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    };

    const concatenateAudioFiles = async (startTimeA, endTimeA, startTimeB, endTimeB) => {
        const urlA = getUrl().replace(`-${prise}.mp3`, '-a.mp3');
        const urlB = getUrl().replace(`-${prise}.mp3`, '-b.mp3');

        const audioContext = new AudioContext();

        try {
            const [responseA, responseB] = await Promise.all([
                fetch(urlA), fetch(urlB)
            ]);

            if (responseA.ok && responseB.ok) {
                const [bufferA, bufferB] = await Promise.all([
                    audioContext.decodeAudioData(await (await responseA.blob()).arrayBuffer()),
                    audioContext.decodeAudioData(await (await responseB.blob()).arrayBuffer())
                ]);

                const sampleRate = bufferA.sampleRate;

                const segmentA = bufferA.getChannelData(0).slice(
                    startTimeA * sampleRate, endTimeA * sampleRate
                );
                const segmentB = bufferB.getChannelData(0).slice(
                    startTimeB * sampleRate, endTimeB * sampleRate
                );

                const totalSamples = segmentA.length + segmentB.length;
                const newBuffer = audioContext.createBuffer(1, totalSamples, sampleRate);
                const channel = newBuffer.getChannelData(0);

                channel.set(segmentA, 0);
                channel.set(segmentB, segmentA.length);

                const wav = audioBufferToWav(newBuffer);
                return URL.createObjectURL(wav);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
        return null;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                { audio: true }
            );
            mediaStream.current = stream;
            mediaRecorder.current = new MediaRecorder(stream);

            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.current.push(e.data);
                }
            };
            mediaRecorder.current.onstart = async () => {
                setTimeout(() => {
                    setIsRecording(true);
                }, 250);
            };
            mediaRecorder.current.onstop = () => {
                setIsRecording(false);
                const recordedBlob = new Blob(
                    chunks.current, { type: "audio/mp3" }
                );
                const url = URL.createObjectURL(recordedBlob);
                setAudioUrl(url);
                chunks.current = [];

                const formData = new FormData();
                formData.append("file", recordedBlob);
                const postUrl = getUrl();
                fetch(postUrl, {
                    method: "POST",
                    body: formData
                });
            };
            mediaRecorder.current.start(250);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();

        }
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach((track) => {
                track.stop();
            });
        }
    };

    const formatTime = (time) => {
        const seconds = Math.floor(time % 60);
        const minutes = Math.floor(time / 60);
        return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
    }

    const { wavesurfer, currentTime, isPlaying } = useWavesurfer({
        container: waveformRef,
        height: 70,
        waveColor: 'rgb(102, 102, 102)',
        progressColor: 'rgb(27, 27, 27)',
        url: audioUrl,
        plugins: plugins,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
    })

    const onPlayPause = () => {
        if (!audioUrl) return;
        wavesurfer && wavesurfer.playPause()
    }

    const onDelete = () => {
        setAudioUrl('')

        const deleteUrl = getUrl("delete");
        fetch(deleteUrl, {
            method: "POST",
        });
    }

    const onSave = () => {
        // A faire: Save le fichier audio
    }

    const addRegion = (start, end, content = "") => {
        regionsPlugin.addRegion({
            content: content,
            start: start,
            end: end,
        });
    }

    const onRestore = () => {
        const bakUrl = getUrl("revert");
        fetch(bakUrl, {
            method: "POST",
        }).then(async () => {
            setBakExists(await fileExists(getUrl() + ".bak"))
            setAudioUrl("")
        })
    }

    useEffect(() => {
        regionsPlugin.getRegions().forEach((region) => {
            console.log(`${region.start} - ${region.end}`);
        });
    });

    wavesurfer?.on("ready", () => {
        setIsLoading(false);
    });
    wavesurfer?.on("loading", () => {
        setIsLoading(true);
    });

    useEffect(() => {

        const updateAudioUrl = async () => {
            setIsLoading(true);
            if (await fileExists(getUrl())) {
                setTimeout(async () => {
                    // if (getUrl().includes("01-00-a")) {
                    //     const concatenatedUrl = await concatenateAudioFiles(3, 8, 0, 3);
                    //     if (concatenatedUrl) {
                    //         setAudioUrl(concatenatedUrl);
                    //         return;
                    //     }
                    // }
                    setAudioUrl(getUrl())
                }, audioUrl != "" ? 200 : 0);
            } else {
                setTimeout(() => {
                    setAudioUrl("")
                }, audioUrl != "" ? 200 : 0);
            }
        }
        updateAudioUrl();
    }, [obs, prise, bakExists])

    useEffect(() => {
        const updateBakExists = async () => {
            setBakExists(await fileExists(getUrl() + ".bak"))
        }
        updateBakExists();
    }, [obs, prise, audioUrl])

    const [otherPrises, setOtherPrises] = useState([]);

    const updateTrackDuration = (trackId, duration) => {
        setTrackDurations(prev => {
            const newDurations = { ...prev, [trackId]: duration };
            const maxDur = Math.max(...Object.values(newDurations));
            setMaxDuration(maxDur);
            return newDurations;
        });
    };

    const handleRegionSelect = (regionData) => {
        console.log('Région sélectionnée:', regionData);
        setSelectedRegions(prev => {
            const filtered = prev.filter(r => r.trackId !== regionData.trackId);
            return [...filtered, regionData];
        });
    };

    const applyRegionToMainTrack = async (regionData) => {
        if (!regionData) return;
        
        console.log(`Application de la région ${regionData.startTime}-${regionData.endTime} de la track ${regionData.trackId} à la track principale`);
        
        alert(`Région appliquée: ${regionData.startTime.toFixed(2)}s - ${regionData.endTime.toFixed(2)}s depuis la track ${regionData.trackId}`);
    };

    useEffect(() => {
        const updateOtherPrises = async () => {
            if (showOtherTracks) {
                const prises = await listPrises(obs[0], obs[1]);
                console.log(prises);

                const chapterString = obs[0] < 10 ? `0${obs[0]}` : obs[0];
                const paragraphString = obs[1] < 10 ? `0${obs[1]}` : obs[1];
                const priseNumbers = prises.map(prise => prise.split(`/${chapterString}-${paragraphString}-`)[1].replace(".mp3", ""));
                console.log(priseNumbers);
                setOtherPrises(priseNumbers);
                
                setTrackDurations({});
                setMaxDuration(0);
                setSelectedRegions([]);
            } else {
                setOtherPrises([]);
                setTrackDurations({});
                setMaxDuration(0);
                setSelectedRegions([]);
            }
        }
        updateOtherPrises();
    }, [showOtherTracks, obs])

    const prepareTracksForEditor = () => {
        return otherPrises.map(priseNumber => ({
            id: priseNumber,
            name: priseNumber.toUpperCase(),
            url: getUrl("bytes", obs[0], obs[1], priseNumber)
        }));
    };

    if (multiTrackMode && showOtherTracks) {
        return (
            <Stack sx={{ mt: 5 }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: 'rgb(255, 254, 246)', 
                    p: 1, 
                    borderRadius: '8px 8px 0 0' 
                }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={multiTrackMode}
                                onChange={(e) => setMultiTrackMode(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Mode MultiTrack Avancé"
                        sx={{ mr: 2 }}
                    />
                    
                    <Box sx={{ flex: 1 }} />
                    
                    <IconButton
                        onClick={() => setShowOtherTracks(false)}
                        title="Fermer l'éditeur"
                    >
                        <ArrowBackIosIcon />
                    </IconButton>
                </Box>
            </Stack>
        );
    }

    return (
        <Stack sx={{ mt: 5, backgroundColor: "rgb(224, 224, 224)", borderRadius: 1, boxShadow: 1, width: '100%', height: otherPrises?.length > 0 ? `${otherPrises?.length * 100 + 150}px` : '150px' }}>

            {/* Barre du haut */}
            <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgb(19, 18, 15)', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', marginLeft: 2, color: 'white' }}>
                    {/*Timer*/}
                    <Box sx={{ fontSize: 16, fontWeight: 600, minWidth: '60px', textAlign: 'center' }}> {formatTime(currentTime)} </Box>
                    {/*Play/Pause Button*/}
                    <IconButton onClick={onPlayPause} sx={{ color: 'white' }}> {isPlaying ? <PauseIcon /> : <PlayArrowIcon />} </IconButton>
                    {/*Record Button*/}
                    <IconButton onClick={isRecording ? stopRecording : startRecording} sx={{ color: 'white' }}> {isRecording ? <StopIcon sx={{ color: 'red' }} /> : <MicIcon />} </IconButton>
                    {/*Delete Button*/}
                    <IconButton onClick={onDelete} sx={{ color: 'white' }}> <DeleteIcon /> </IconButton>
                    {/* Restore Button */}
                    {bakExists && <IconButton onClick={onRestore} sx={{ color: 'white' }}> <RestoreIcon /> </IconButton>}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'flex-end', marginRight: 2 }}>
                    {/* Boutons d'édition pour les régions sélectionnées */}
                    {selectedRegions.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                            <IconButton 
                                size="small" 
                                onClick={() => applyRegionToMainTrack(selectedRegions[selectedRegions.length - 1])}
                                sx={{ backgroundColor: 'rgb(76, 175, 80)', color: 'white', '&:hover': { backgroundColor: 'rgb(56, 142, 60)' } }}
                                title="Appliquer la région sélectionnée à la track principale"
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                onClick={() => setSelectedRegions([])}
                                sx={{ backgroundColor: 'rgb(244, 67, 54)', color: 'white', '&:hover': { backgroundColor: 'rgb(198, 40, 40)' } }}
                                title="Effacer les sélections"
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                    
                    {/* Bouton Mode MultiTrack */}
                    {/* {showOtherTracks && otherPrises.length > 0 && (
                        <IconButton
                            onClick={() => setMultiTrackMode(true)}
                            sx={{ 
                                color: 'rgb(63, 81, 181)', 
                                mr: 1,
                                '&:hover': { backgroundColor: 'rgba(63, 81, 181, 0.1)' }
                            }}
                            title="Passer en mode éditeur multitrack avancé"
                        >
                            <QueueMusicIcon />
                        </IconButton>
                    )} */}
                    
                    {/* Bouton d'affichage pour les autres pistes audio */}
                    <IconButton
                        onClick={() => setShowOtherTracks((prev) => !prev)}
                        sx={{
                            transition: 'transform 0.2s',
                            transform: showOtherTracks ? 'rotate(-90deg)' : 'rotate(0deg)',
                            color: 'white',
                        }}
                        aria-label={showOtherTracks ? "Masquer les autres pistes" : "Afficher les autres pistes"}
                    >
                        <ArrowBackIosIcon />
                    </IconButton>
                </Box>
            </Box>
            <Divider />
            
            {/* Track principale */}
            <Box sx={{ p: 1, backgroundColor: 'rgb(255, 245, 245)', overflow: 'hidden' }}>
                <Box sx={{ fontSize: 12, fontWeight: 600, mb: 1, color: 'rgb(255, 69, 0)' }}>
                    TRACK PRINCIPALE - {prise.toUpperCase()}
                </Box>
                <div
                    ref={waveformRef}
                    className={`audio-waveform ${isLoading ? 'loading' : 'loaded'}`}
                    style={{ width: '100%', height: '100px', marginBottom: '', overflow: 'hidden' }}  
                />
            </Box>
            
            {/* Liste des autres pistes audio */}
            {showOtherTracks && (
                <Box sx={{ p: 1, backgroundColor: 'rgb(235, 235, 235)', maxHeight: '300px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {otherPrises.map((priseNumber, index) => (
                        <Box key={`${obs[0]}-${obs[1]}-${priseNumber}-${index}`} sx={{ mb: 1 }}>
                            <Box sx={{ fontSize: 11, color: 'rgb(120, 120, 120)', mb: 0.5 }}>
                                Track {priseNumber.toUpperCase()} 
                                {trackDurations[priseNumber] && ` - ${formatTime(trackDurations[priseNumber])}`}
                                {selectedRegions.find(r => r.trackId === priseNumber) && 
                                    ` - Région: ${selectedRegions.find(r => r.trackId === priseNumber).startTime.toFixed(1)}s-${selectedRegions.find(r => r.trackId === priseNumber).endTime.toFixed(1)}s`
                                }
                            </Box>
                            <Waveform
                                priseNumber={priseNumber}
                                obs={obs}
                                metadata={metadata}
                                setCursorTime={setCursorTime}
                                cursorTime={cursorTime}
                                setCurrentTrack={setCurrentTrack}
                                currentTrack={currentTrack}
                                maxDuration={maxDuration}
                                enableRegions={true}
                                onRegionSelect={handleRegionSelect}
                                onDurationUpdate={updateTrackDuration}
                                isMainTrack={false}
                            />
                        </Box>
                    ))}
                    {otherPrises.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 2, color: 'rgb(120, 120, 120)' }}>
                            Aucune autre piste audio trouvée
                        </Box>
                    )}
                </Box>
            )}
        </Stack>

    );
};
export default AudioRecorder;