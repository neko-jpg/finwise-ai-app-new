
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Loader, AlertTriangle, ScanLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TransactionFormValues } from './transaction-form';
import { receiptOcr } from '@/ai/flows/receipt-ocr';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface OcrScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: Partial<TransactionFormValues>) => void;
}

export function OcrScanner({ open, onOpenChange, onComplete }: OcrScannerProps) {
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const getCameraPermission = async () => {
            if (!open || hasCameraPermission === true) return;
            // Only ask for permission when the dialog opens
            if (open && hasCameraPermission === null) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                    setHasCameraPermission(true);
                } catch (error) {
                    console.error('Error accessing camera:', error);
                    setHasCameraPermission(false);
                    toast({
                      variant: 'destructive',
                      title: 'カメラへのアクセスが拒否されました',
                      description: 'レシートスキャン機能を使用するには、ブラウザの設定でカメラへのアクセスを許可してください。',
                    });
                }
            }
        };
        getCameraPermission();
        
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        }

    }, [open, hasCameraPermission, toast]);

    const handleCapture = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsProcessing(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            toast({ variant: 'destructive', title: 'エラー', description: '画像を取得できませんでした。'});
            setIsProcessing(false);
            return;
        };

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');

        try {
            const result = await receiptOcr({ photoDataUri: dataUri });
            const [year, month, day] = result.bookedAt.split('-').map(Number);
            onComplete({
                merchant: result.merchant,
                amount: result.amount,
                bookedAt: new Date(year, month - 1, day),
            });
            toast({ title: 'レシートを読み取りました', description: '内容を確認して保存してください。' });
            onOpenChange(false);
        } catch (e) {
            console.error("OCR failed", e);
            toast({ variant: 'destructive', title: '読み取り失敗', description: 'レシートの解析に失敗しました。もう一度試してください。'});
        } finally {
            setIsProcessing(false);
        }

    }, [onComplete, onOpenChange, toast]);
    
    const handleDialogChange = (isOpen: boolean) => {
        if (!isOpen) {
            // Reset permission state when dialog is closed, so it can be requested again next time.
            setHasCameraPermission(null);
        }
        onOpenChange(isOpen);
    }


    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-2"><ScanLine />レシートスキャン</DialogTitle>
                    <DialogDescription>レシートが枠内に収まるように撮影してください。</DialogDescription>
                </DialogHeader>
                <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                    <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    {hasCameraPermission === false && (
                         <div className="absolute inset-0 flex items-center justify-center p-4">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>カメラアクセスが必要です</AlertTitle>
                                <AlertDescription>
                                    ブラウザの設定でカメラへのアクセスを許可してください。
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <Button onClick={handleCapture} disabled={isProcessing || !hasCameraPermission}>
                    {isProcessing ? (
                        <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            <span>解析中...</span>
                        </>
                    ) : (
                        <>
                            <Camera className="mr-2 h-4 w-4" />
                            <span>撮影して解析</span>
                        </>
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
