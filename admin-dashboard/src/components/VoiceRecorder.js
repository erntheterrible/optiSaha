import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  IconButton, 
  Typography, 
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const VoiceRecorder = ({ onRecordingComplete, onDelete, initialAudioUrl }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(initialAudioUrl || null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const recordingInterval = useRef(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
      }
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Handle initial audio URL change
  useEffect(() => {
    if (initialAudioUrl) {
      setRecordedAudio(initialAudioUrl);
    }
  }, [initialAudioUrl]);
  
  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        onRecordingComplete(audioBlob);
      };
      
      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Update recording time every second
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(t('notes.micAccessError'));
    }
  };
  
  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      clearInterval(recordingInterval.current);
      setIsRecording(false);
    }
  };
  
  // Toggle play/pause for recorded audio
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current);
    } else {
      audioRef.current.play();
      const startTime = Date.now() - (elapsedTime * 1000);
      
      const updateElapsedTime = () => {
        if (audioRef.current) {
          setElapsedTime((Date.now() - startTime) / 1000);
          
          if (!audioRef.current.paused) {
            animationRef.current = requestAnimationFrame(updateElapsedTime);
          }
        }
      };
      
      animationRef.current = requestAnimationFrame(updateElapsedTime);
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle audio end
  const handleAudioEnd = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    cancelAnimationFrame(animationRef.current);
  };
  
  // Delete recorded audio
  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
    }
    
    setRecordedAudio(null);
    setElapsedTime(0);
    setIsPlaying(false);
    onDelete();
  };
  
  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <audio
        ref={audioRef}
        src={recordedAudio}
        onEnded={handleAudioEnd}
        style={{ display: 'none' }}
      />
      
      {!recordedAudio ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={t('notes.recordVoiceNote')}>
            <IconButton
              color={isRecording ? 'error' : 'primary'}
              onClick={isRecording ? stopRecording : startRecording}
              sx={{
                width: 56,
                height: 56,
                '&:hover': {
                  backgroundColor: isRecording ? 'rgba(244, 67, 54, 0.08)' : 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>
          
          <Box sx={{ flexGrow: 1, ml: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {isRecording 
                ? t('notes.recording')
                : t('notes.clickToRecord')
              }
            </Typography>
            {isRecording && (
              <Typography variant="caption" color="textSecondary">
                {formatTime(recordingTime)}
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="primary"
            onClick={togglePlayPause}
            sx={{
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          
          <Box sx={{ flexGrow: 1, ml: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={audioRef.current ? (elapsedTime / audioRef.current.duration) * 100 : 0} 
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="textSecondary">
                {formatTime(elapsedTime)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {audioRef.current ? formatTime(audioRef.current.duration) : '00:00'}
              </Typography>
            </Box>
          </Box>
          
          <Tooltip title={t('common.delete')}>
            <IconButton
              color="error"
              onClick={deleteRecording}
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.08)',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default VoiceRecorder;
