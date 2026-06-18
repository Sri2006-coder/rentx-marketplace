'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Upload, FileCheck, AlertCircle, Camera } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function VerificationPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI & Webcam State
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/verification/status');
      setStatus(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        if (!user) router.push('/login');
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      fetchStatus();
    }
  }, [user, router]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const faceapi = await import('@vladmandic/face-api');
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models", err);
        setError("Failed to load AI verification models. Please refresh.");
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (showWebcam && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [showWebcam, mediaStream]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowWebcam(true);
    } catch (err) {
      setError('Camera access denied or unavailable.');
    }
  };

  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setShowWebcam(false);
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
            setSelfieFile(file);
            setSelfiePreview(URL.createObjectURL(file));
            stopWebcam();
          }
        }, 'image/jpeg');
      }
    }
  };

  const detectFace = async (file: File) => {
    const faceapi = await import('@vladmandic/face-api');
    const img = await faceapi.bufferToImage(file);
    const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 });
    const detection = await faceapi.detectSingleFace(img, options).withFaceLandmarks().withFaceDescriptor();
    return detection;
  };

  const handleAutoVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaarFile || !selfieFile) {
      setError('Please upload Aadhaar and capture a selfie.');
      return;
    }

    if (!modelsLoaded) {
      setError('AI models are still loading. Please wait.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsUploading(true);

    try {
      // 1. Run Tesseract OCR Validation
      const Tesseract = (await import('tesseract.js')).default;
      const ocrResult = await Tesseract.recognize(aadhaarFile, 'eng');
      const extractedText = ocrResult.data.text;

      const hasAadhaarNumber = /\d{4}\s?\d{4}\s?\d{4}/.test(extractedText);
      const hasKeyword = /government of india|dob|date of birth|year of birth/i.test(extractedText);

      if (!hasAadhaarNumber || !hasKeyword) {
        throw new Error("This document does not appear to be a valid Aadhaar card. Please upload a clear photo of your ID.");
      }

      // 2. Run AI face detection
      const aadhaarDetection = await detectFace(aadhaarFile);
      if (!aadhaarDetection) {
        throw new Error("No face detected in Aadhaar image. Please upload a clear document.");
      }

      let selfieDetection;
      try {
        selfieDetection = await detectFace(selfieFile);
      } catch (e) {
        console.warn(e);
      }

      if (!selfieDetection) {
        throw new Error("No face detected in your live selfie. Please ensure you are in a well-lit room and looking directly at the camera.");
      }

      const faceapi = await import('@vladmandic/face-api');
      const distance = faceapi.euclideanDistance(aadhaarDetection.descriptor, selfieDetection.descriptor);
      
      // Threshold 0.6 is recommended. Lower is more similar.
      if (distance > 0.6) {
        throw new Error(`Face does not match Aadhaar photo. Please try again.`);
      }

      // 3. Match succeeds! Send to backend
      const matchPercentage = Math.round(Math.max(0, 100 - (distance * 100)));
      const formData = new FormData();
      formData.append('aadhaar', aadhaarFile);
      formData.append('selfie', selfieFile);
      formData.append('score', String(matchPercentage));
      formData.append('ocrText', extractedText);

      await api.post('/verification/auto-verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccessMsg(`Face Match Success! Similarity distance: ${distance.toFixed(2)}. You are verified!`);
      setAadhaarFile(null);
      setSelfieFile(null);
      setSelfiePreview(null);
      await fetchStatus();
      await refreshUser?.();
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isVerified = status?.aadhaarStatus === 'VERIFIED';
  const isPending = status?.aadhaarStatus === 'PENDING' && !isVerified;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/20 p-3 rounded-xl text-primary">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Verification Center</h1>
          <p className="text-muted-foreground">Automated identity verification using facial recognition</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Trust Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                <circle 
                  cx="64" cy="64" r="60" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="377" 
                  strokeDashoffset={377 - (377 * (status?.trustScore || 0)) / 100}
                  className="text-primary transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute text-3xl font-bold">{status?.trustScore || 0}</div>
            </div>
            <div className="text-sm text-muted-foreground">out of 100</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="text-sm text-muted-foreground mb-1">Aadhaar / ID Card</div>
                <StatusBadge status={status?.aadhaarStatus || 'UNVERIFIED'} />
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="text-sm text-muted-foreground mb-1">Face Match Score</div>
                <div className="font-bold">{status?.faceMatchScore !== undefined && status?.faceMatchScore !== null ? `${status.faceMatchScore}%` : 'N/A'}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">{status?.completedRentals || 0}</div>
                <div className="text-xs text-muted-foreground">Completed Rentals</div>
              </div>
              <div>
                <div className="text-xl font-bold">{status?.verifiedAt ? new Date(status.verifiedAt).toLocaleDateString() : 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Verified Date</div>
              </div>
              <div>
                <div className="text-xl font-bold">{status?.verifiedBadge ? 'Yes' : 'No'}</div>
                <div className="text-xs text-muted-foreground">Verified Badge</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isVerified && !isPending && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle>AI Auto-Verification</CardTitle>
            <CardDescription>
              Upload your Aadhaar card and take a live selfie. Our AI will instantly compare your face to verify your identity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 mb-6 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-sm text-green-500">
                <FileCheck className="w-4 h-4" />
                {successMsg}
              </div>
            )}

            {!modelsLoaded && (
              <div className="p-4 mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                Loading AI Face Recognition models...
              </div>
            )}

            <form onSubmit={handleAutoVerify} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Step 1: Upload Aadhaar</label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative h-48 flex flex-col justify-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <div className="text-sm font-medium">
                      {aadhaarFile ? aadhaarFile.name : 'Upload clear Aadhaar image'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Must contain a clear face</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Step 2: Live Selfie</label>
                  {!showWebcam && !selfiePreview ? (
                    <div 
                      onClick={startWebcam}
                      className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer h-48 flex flex-col justify-center"
                    >
                      <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <div className="text-sm font-medium">Click to open Camera</div>
                      <div className="text-xs text-muted-foreground mt-1">Take a well-lit selfie</div>
                    </div>
                  ) : showWebcam ? (
                    <div className="relative rounded-xl overflow-hidden bg-black h-48 border border-white/20">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={captureSelfie} 
                        className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                      >
                        Capture
                      </Button>
                      <Button 
                        type="button" 
                        variant="destructive"
                        size="sm"
                        onClick={stopWebcam} 
                        className="absolute top-2 right-2 px-2 py-1 h-auto"
                      >
                        Close
                      </Button>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden bg-black h-48 border border-white/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selfiePreview!} alt="Selfie" className="w-full h-full object-cover" />
                      <Button 
                        type="button" 
                        variant="secondary"
                        size="sm"
                        onClick={() => { setSelfiePreview(null); setSelfieFile(null); startWebcam(); }} 
                        className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                      >
                        Retake
                      </Button>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button type="submit" disabled={isUploading} size="lg" className="w-full md:w-auto">
                  {isUploading ? 'Running AI Verification...' : 'Run Face Match & Verify'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isPending && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <FileCheck className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Verification Pending</h3>
          <p className="text-muted-foreground">
            Your documents are currently being reviewed manually. This usually takes 24-48 hours. 
            We will notify you once the verification is complete.
          </p>
        </div>
      )}
    </div>
  );
}
