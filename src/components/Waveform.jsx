import { useRef, useMemo, useEffect, useState } from 'react';
import { useWavesurfer } from '@wavesurfer/react'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const Waveform = ({ 
    priseNumber, 
    obs, 
    metadata, 
    setCursorTime, 
    cursorTime, 
    currentTrack, 
    setCurrentTrack,
    maxDuration = null,
    enableRegions = false,
    onRegionSelect = null,
    isMainTrack = false,
    onDurationUpdate = null
}) => {
    const waveformRef = useRef(null);
    const regionsPlugin = useMemo(() => RegionsPlugin.create(), []);
    const recordPlugin = useMemo(() => RecordPlugin.create(), []);
    const plugins = useMemo(() => [regionsPlugin, recordPlugin], [regionsPlugin, recordPlugin]);
    const [actualDuration, setActualDuration] = useState(0);

    const getUrl = (segment = "bytes", chapter = obs[0], paragraph = obs[1], prise = priseNumber) => {
        let chapterString = chapter < 10 ? `0${chapter}` : chapter;
        let paragraphString = paragraph < 10 ? `0${paragraph}` : paragraph;
        return `/burrito/ingredient/${segment}/${metadata.local_path}?ipath=audio_content/${chapterString}-${paragraphString}/${chapterString}-${paragraphString}-${prise}.mp3`
    }

    const waveformConfig = {
        container: waveformRef,
        height: isMainTrack ? 80 : 60,
        waveColor: isMainTrack ? 'rgb(27, 27, 27)' : 'rgb(102, 102, 102)',
        progressColor: isMainTrack ? 'rgb(255, 69, 0)' : 'rgb(27, 27, 27)',
        url: getUrl(),
        plugins: plugins,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        normalize: true,
        fillParent: true,
        responsive: true,
        hideScrollbar: true,
        ...(maxDuration && { 
            minPxPerSec: 50 
        })
    };

    const { wavesurfer, currentTime, isPlaying } = useWavesurfer(waveformConfig);

    useEffect(() => {
        if (!wavesurfer) return;

        const handleReady = () => {
            const duration = wavesurfer.getDuration();
            setActualDuration(duration);
            
            if (onDurationUpdate) {
                onDurationUpdate(priseNumber, duration);
            }
            
            if (maxDuration && duration < maxDuration) {
                const ratio = duration / maxDuration;
                console.log(`Track ${priseNumber}: ${duration}s/${maxDuration}s (${(ratio * 100).toFixed(1)}%)`);
            }
        };

        const handleClick = () => {
            setCursorTime(wavesurfer.getCurrentTime());
        };

        const handleInteraction = () => {
            setCurrentTrack(priseNumber);
        };

        if (enableRegions) {
            const handleRegionCreate = (region) => {
                if (onRegionSelect) {
                    onRegionSelect({
                        trackId: priseNumber,
                        startTime: region.start,
                        endTime: region.end,
                        region: region
                    });
                }
            };

            const handleRegionUpdate = (region) => {
                if (onRegionSelect) {
                    onRegionSelect({
                        trackId: priseNumber,
                        startTime: region.start,
                        endTime: region.end,
                        region: region,
                        action: 'update'
                    });
                }
            };

            regionsPlugin?.on('region-created', handleRegionCreate);
            regionsPlugin?.on('region-updated', handleRegionUpdate);

            // return () => {
            //     regionsPlugin?.off('region-created', handleRegionCreate);
            //     regionsPlugin?.off('region-updated', handleRegionUpdate);
            // };
        }

        wavesurfer?.on('ready', handleReady);
        wavesurfer?.on('click', handleClick);
        wavesurfer?.on('interaction', handleInteraction);

        // return () => {
        //     wavesurfer?.off('ready', handleReady);
        //     wavesurfer?.off('click', handleClick);
        //     wavesurfer?.off('interaction', handleInteraction);
        // };
    }, [wavesurfer, enableRegions, onRegionSelect, maxDuration, priseNumber, setCursorTime, setCurrentTrack, onDurationUpdate]);

    useEffect(() => {
        if (wavesurfer && cursorTime !== undefined) {
            const clampedTime = Math.min(cursorTime, actualDuration);
            wavesurfer?.setTime(clampedTime);
        }
    }, [cursorTime, wavesurfer, actualDuration]);

    const onPlayPause = () => {
        wavesurfer && wavesurfer?.playPause();
    };

    const formatTime = (time) => {
        const seconds = Math.floor(time % 60);
        const minutes = Math.floor(time / 60);
        return minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
    };

    const getDurationIndicator = () => {
        // if (!maxDuration || !actualDuration) return null;
        
        // return (
        //     <Box 
        //         sx={{ 
        //             position: 'absolute', 
        //             top: 0, 
        //             right: 8, 
        //             backgroundColor: 'rgba(0,0,0,0.6)', 
        //             color: 'white', 
        //             px: 1, 
        //             py: 0.5, 
        //             borderRadius: 1, 
        //             fontSize: '0.75rem',
        //             zIndex: 1
        //         }}
        //     >
        //         {formatTime(actualDuration)} ({percentage.toFixed(0)}%)
        //     </Box>
        // );
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: currentTrack == priseNumber ? 'rgb(255, 239, 239)' : 'rgb(255, 255, 255)', 
            mb: 1, 
            borderRadius: 1,
            position: 'relative',
            border: isMainTrack ? '2px solid rgb(255, 69, 0)' : '1px solid rgb(200, 200, 200)'
        }}>
            <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <div
                    ref={waveformRef}
                    style={{ 
                        width: actualDuration * 100, 
                        height: isMainTrack ? '80px' : '60px',
                        overflow: 'hidden',
                    }}
                />
                {getDurationIndicator()}
            </Box>
            
            {/* Boutons de contrôle pour la track principale */}
            {isMainTrack && (
                <Box sx={{ px: 1 }}>
                    <IconButton size="small" onClick={onPlayPause}>
                        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};

export default Waveform;