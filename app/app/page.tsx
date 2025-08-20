// app/app/page.tsx
'use client'

import React, { useRef, useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModeToggle } from '@/components/mode-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TextCustomizer from '@/components/editor/text-customizer';
import ImageControls from '@/components/editor/image-controls';
import LoadingIndicator from '@/components/ui/loading-indicator';

import { PlusIcon, ReloadIcon } from '@radix-ui/react-icons';

import { removeBackground } from "@imgly/background-removal";

import '@/app/fonts.css';
import { APP_NAME, getAcronym } from '@/constants/branding';

const Page = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageSetupDone, setIsImageSetupDone] = useState<boolean>(false);
    const [removedBgImageUrl, setRemovedBgImageUrl] = useState<string | null>(null);
    const [textSets, setTextSets] = useState<Array<any>>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false)
    // Image adjustments
    const [rotationDeg, setRotationDeg] = useState<number>(0)
    const [brightness, setBrightness] = useState<number>(1)
    const [contrast, setContrast] = useState<number>(1)
    const [aspectRatio, setAspectRatio] = useState<string>('original')
    const [naturalImageSize, setNaturalImageSize] = useState<{ width: number; height: number } | null>(null)
    const resetImageAdjustments = () => {
        setRotationDeg(0);
        setBrightness(1);
        setContrast(1);
        setAspectRatio('original');
    }

    const handleUploadImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const loadImageFile = async (file: File) => {
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        try {
            const probe = new (window as any).Image();
            probe.onload = () => {
                setNaturalImageSize({ width: probe.naturalWidth, height: probe.naturalHeight });
            };
            probe.src = imageUrl;
        } catch {}
        await setupImage(imageUrl);
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) await loadImageFile(file);
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) await loadImageFile(file);
    }

    const setupImage = async (imageUrl: string) => {
        try {
            const imageBlob = await removeBackground(imageUrl);
            const url = URL.createObjectURL(imageBlob);
            setRemovedBgImageUrl(url);
            setIsImageSetupDone(true);

            // Skip DB update in local testing
            
        } catch (error) {
            console.error(error);
        }
    };

    const addNewTextSet = () => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, {
            id: newId,
            text: 'edit',
            fontFamily: 'Inter',
            top: 0,
            left: 0,
            color: 'white',
            strokeColor: 'black',
            strokeWidth: 0,
            fontSize: 200,
            fontWeight: 800,
            opacity: 1,
            shadowColor: 'rgba(0, 0, 0, 0.8)',
            shadowSize: 4,
            scaleX: 1,
            scaleY: 1,
            blendMode: 'normal',
            rotation: 0,
            tiltX: 0,
            tiltY: 0,
            letterSpacing: 0,
            layer: 'behind'
        }]);
    };

    const handleAttributeChange = (id: number, attribute: string, value: any) => {
        console.log(`PAGE.TSX: Changing ${attribute} to ${value} for text set ${id}`);
        console.log('Current textSets before change:', textSets);
        setTextSets(prev => {
            const updated = prev.map(set => 
                set.id === id ? { ...set, [attribute]: value } : set
            );
            console.log('Updated textSets:', updated);
            return updated;
        });
    };

    const duplicateTextSet = (textSet: any) => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, { ...textSet, id: newId }]);
    };

    const removeTextSet = (id: number) => {
        setTextSets(prev => prev.filter(set => set.id !== id));
    };

    const [exportScale] = useState<number>(1);

    const saveCompositeImage = () => {
        if (!canvasRef.current || !isImageSetupDone) return;
    
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const bgImg = new (window as any).Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
            canvas.width = Math.floor(bgImg.width * exportScale);
            canvas.height = Math.floor(bgImg.height * exportScale);
    
            // Always reset to default compositing before drawing images
            ctx.globalCompositeOperation = 'source-over'
            if (rotationDeg !== 0 || brightness !== 1 || contrast !== 1) {
                ctx.save();
                ctx.filter = `brightness(${brightness}) contrast(${contrast})`;
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
                ctx.translate(cx, cy);
                ctx.rotate((rotationDeg * Math.PI) / 180);
                ctx.translate(-cx, -cy);
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                ctx.restore();
            } else {
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            }
    
            // Render text sets in layer order: behind, middle, then front
            const layerOrder = ['behind', 'middle', 'front'];
            
            // First render behind layer (before removed bg image)
            textSets.filter(textSet => textSet.layer === 'behind').forEach(textSet => {
                ctx.save();
                
                // Set up text properties
                ctx.font = `${textSet.fontWeight} ${textSet.fontSize * 3 * exportScale}px ${textSet.fontFamily}`;
                ctx.fillStyle = textSet.color;
                ctx.globalAlpha = textSet.opacity;
                // Map CSS blend modes to canvas operations (best-effort)
                const blendMap: Record<string, GlobalCompositeOperation> = {
                    'normal': 'source-over',
                    'multiply': 'multiply',
                    'screen': 'screen',
                    'overlay': 'overlay',
                    'darken': 'darken',
                    'lighten': 'lighten',
                    'color-dodge': 'color-dodge',
                    'color-burn': 'color-burn',
                    'hard-light': 'hard-light',
                    'soft-light': 'soft-light',
                    'difference': 'difference',
                    'exclusion': 'exclusion',
                    'hue': 'hue',
                    'saturation': 'saturation',
                    'color': 'color',
                    'luminosity': 'luminosity',
                } as any;
                const prevComposite = ctx.globalCompositeOperation;
                ctx.globalCompositeOperation = (blendMap as any)[textSet.blendMode] ?? 'source-over';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.letterSpacing = `${textSet.letterSpacing}px`;
    
                const x = canvas.width * (textSet.left + 50) / 100;
                const y = canvas.height * (50 - textSet.top) / 100;
    
                // Move to position first
                ctx.translate(x, y);
                
                // Apply 3D transforms
                const tiltXRad = (-textSet.tiltX * Math.PI) / 180;
                const tiltYRad = (-textSet.tiltY * Math.PI) / 180;
    
                // Use a simpler transform that maintains the visual tilt
                ctx.transform(
                    Math.cos(tiltYRad) * (textSet.scaleX ?? 1),
                    Math.sin(0),
                    -Math.sin(0),
                    Math.cos(tiltXRad) * (textSet.scaleY ?? 1),
                    0,
                    0
                );
    
                // Apply rotation last
                ctx.rotate((textSet.rotation * Math.PI) / 180);
    
                const drawWithLetterSpacing = (draw: (ch: string, x: number) => void) => {
                    if (textSet.letterSpacing === 0) {
                        draw(textSet.text, 0);
                        return;
                    }
                    const chars = textSet.text.split('');
                    let currentX = 0;
                    // Calculate total width to center properly
                    const totalWidth = chars.reduce((width, char, i) => {
                        const charWidth = ctx.measureText(char).width;
                        return width + charWidth + (i < chars.length - 1 ? textSet.letterSpacing : 0);
                    }, 0);
                    currentX = -totalWidth / 2;
                    chars.forEach((char) => {
                        const charWidth = ctx.measureText(char).width;
                        draw(char, currentX + charWidth / 2);
                        currentX += charWidth + textSet.letterSpacing;
                    });
                };

                // Draw shadow
                if (textSet.shadowSize > 0) {
                    ctx.save();
                    ctx.shadowColor = textSet.shadowColor;
                    ctx.shadowBlur = textSet.shadowSize;
                    drawWithLetterSpacing((ch, x) => ctx.fillText(ch, x, 0));
                    ctx.restore();
                }

                // Draw stroke (scale with exportScale for parity with preview)
                if (textSet.strokeWidth > 0) {
                    ctx.save();
                    ctx.lineWidth = textSet.strokeWidth * exportScale;
                    ctx.strokeStyle = textSet.strokeColor;
                    ctx.miterLimit = 2;
                    drawWithLetterSpacing((ch, x) => ctx.strokeText(ch, x, 0));
                    ctx.restore();
                }

                // Draw fill
                drawWithLetterSpacing((ch, x) => ctx.fillText(ch, x, 0));
                ctx.restore();
                // Restore composite after each text set
                ctx.globalCompositeOperation = prevComposite;
            });
    
            if (removedBgImageUrl) {
                const removedBgImg = new (window as any).Image();
                removedBgImg.crossOrigin = "anonymous";
                removedBgImg.onload = () => {
                    // Ensure default compositing when drawing the foreground object image
                    ctx.globalCompositeOperation = 'source-over'
                    ctx.drawImage(removedBgImg, 0, 0, canvas.width, canvas.height);
                    
                    // Render front layer text (after removed bg image)
                    textSets.filter(textSet => textSet.layer === 'front').forEach(textSet => {
                        ctx.save();
                        
                        // Set up text properties
                        ctx.font = `${textSet.fontWeight} ${textSet.fontSize * 3 * exportScale}px ${textSet.fontFamily}`;
                        ctx.fillStyle = textSet.color;
                        ctx.globalAlpha = textSet.opacity;
                        
                        const blendMap: Record<string, GlobalCompositeOperation> = {
                            'normal': 'source-over',
                            'multiply': 'multiply',
                            'screen': 'screen',
                            'overlay': 'overlay',
                            'darken': 'darken',
                            'lighten': 'lighten',
                            'color-dodge': 'color-dodge',
                            'color-burn': 'color-burn',
                            'hard-light': 'hard-light',
                            'soft-light': 'soft-light',
                            'difference': 'difference',
                            'exclusion': 'exclusion',
                            'hue': 'hue',
                            'saturation': 'saturation',
                            'color': 'color',
                            'luminosity': 'luminosity',
                        } as any;
                        const prevComposite = ctx.globalCompositeOperation;
                        ctx.globalCompositeOperation = (blendMap as any)[textSet.blendMode] ?? 'source-over';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.letterSpacing = `${textSet.letterSpacing}px`;
            
                        const x = canvas.width * (textSet.left + 50) / 100;
                        const y = canvas.height * (50 - textSet.top) / 100;
            
                        // Move to position first
                        ctx.translate(x, y);
                        
                        // Apply 3D transforms
                        const tiltXRad = (-textSet.tiltX * Math.PI) / 180;
                        const tiltYRad = (-textSet.tiltY * Math.PI) / 180;
            
                        // Use a simpler transform that maintains the visual tilt
                        ctx.transform(
                            Math.cos(tiltYRad) * (textSet.scaleX ?? 1),
                            Math.sin(0),
                            -Math.sin(0),
                            Math.cos(tiltXRad) * (textSet.scaleY ?? 1),
                            0,
                            0
                        );
            
                        // Apply rotation last
                        ctx.rotate((textSet.rotation * Math.PI) / 180);
            
                        const drawWithLetterSpacing = (draw: (ch: string, x: number) => void) => {
                            if (textSet.letterSpacing === 0) {
                                draw(textSet.text, 0);
                                return;
                            }
                            const chars = textSet.text.split('');
                            let currentX = 0;
                            // Calculate total width to center properly
                            const totalWidth = chars.reduce((width, char, i) => {
                                const charWidth = ctx.measureText(char).width;
                                return width + charWidth + (i < chars.length - 1 ? textSet.letterSpacing : 0);
                            }, 0);
                            currentX = -totalWidth / 2;
                            chars.forEach((char) => {
                                const charWidth = ctx.measureText(char).width;
                                draw(char, currentX + charWidth / 2);
                                currentX += charWidth + textSet.letterSpacing;
                            });
                        };

                        // Draw shadow
                        if (textSet.shadowSize > 0) {
                            ctx.save();
                            ctx.shadowColor = textSet.shadowColor;
                            ctx.shadowBlur = textSet.shadowSize;
                            drawWithLetterSpacing((ch, x) => ctx.fillText(ch, x, 0));
                            ctx.restore();
                        }

                        // Draw stroke (scale with exportScale for parity with preview)
                        if (textSet.strokeWidth > 0) {
                            ctx.save();
                            ctx.lineWidth = textSet.strokeWidth * exportScale;
                            ctx.strokeStyle = textSet.strokeColor;
                            ctx.miterLimit = 2;
                            drawWithLetterSpacing((ch, x) => ctx.strokeText(ch, x, 0));
                            ctx.restore();
                        }

                        // Draw fill
                        drawWithLetterSpacing((ch, x) => ctx.fillText(ch, x, 0));
                        ctx.restore();
                        // Restore composite after each text set
                        ctx.globalCompositeOperation = prevComposite;
                    });
                    
                    triggerDownload();
                };
                removedBgImg.src = removedBgImageUrl;
            } else {
                triggerDownload();
            }
        };
        bgImg.src = selectedImage || '';
    
        function triggerDownload() {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${APP_NAME.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.href = dataUrl;
            link.click();
        }
    };
    
    return (
        <>
            {true ? (
                <div className='relative flex flex-col h-screen'>
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div className='absolute -top-40 -left-40 h-80 w-80 rounded-full blur-3xl opacity-60 bg-orange-300 dark:opacity-50 dark:bg-orange-600/50' />
                        <div className='absolute top-10 right-[-6rem] h-72 w-72 rounded-full blur-3xl opacity-60 bg-amber-300 dark:opacity-50 dark:bg-amber-600/50' />
                        <div className='absolute bottom-[-6rem] left-1/2 -translate-x-1/2 h-96 w-96 rounded-full blur-3xl opacity-60 bg-rose-300 dark:opacity-50 dark:bg-rose-700/50' />
                    </div>
                    <header className='sticky top-0 z-20 flex flex-row items-center justify-between p-4 md:p-5 md:px-10 border-b bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md'>
                        <h2 className="text-3xl md:text-2xl font-semibold tracking-tight">
                            <span className="block md:hidden">{getAcronym(APP_NAME)}</span>
                            <span className="hidden md:block">{APP_NAME} Studio</span>
                        </h2>
                        <div className='flex gap-4 items-center'>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept=".jpg, .jpeg, .png"
                            />
                            <div className='flex items-center gap-5'>
                                
                                <div className='flex gap-2 items-center'>
                                    <Button onClick={handleUploadImage} className='bg-orange-600 hover:bg-orange-700 text-white'>
                                        Upload background
                                    </Button>
                                    {selectedImage && (
                                        <Button onClick={saveCompositeImage} className='hidden md:flex'>
                                            Export PNG
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <ModeToggle />
                        </div>
                    </header>
                    <Separator /> 
                    {selectedImage ? (
                        <div className='flex flex-col md:flex-row items-start justify-start gap-8 w-full h-[calc(100vh-6rem)] px-6 md:px-10 mt-4'>
                            <div className="flex flex-col items-start justify-start w-full md:w-1/2 gap-4">
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                                <div className='flex items-center gap-2'>
                                    <Button onClick={saveCompositeImage} className='md:hidden'>
                                        Save image
                                    </Button>
                                    
                                </div>
                                <div className="min-h-[400px] w-[80%] p-4 border border-border rounded-xl bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm">
                                    <div
                                        className='relative w-full overflow-hidden rounded-lg'
                                        style={{
                                            aspectRatio:
                                                aspectRatio === '1:1' ? '1 / 1' :
                                                aspectRatio === '4:5' ? '4 / 5' :
                                                aspectRatio === '3:2' ? '3 / 2' :
                                                aspectRatio === '16:9' ? '16 / 9' :
                                                (naturalImageSize ? `${naturalImageSize.width} / ${naturalImageSize.height}` : undefined)
                                        }}
                                    >
                                        {isImageSetupDone ? (
                                            <Image
                                                src={selectedImage}
                                                alt="Uploaded"
                                                fill
                                                style={{ objectFit: 'contain', objectPosition: 'center', filter: `brightness(${brightness}) contrast(${contrast})`, transform: `rotate(${rotationDeg}deg)` }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="text-center space-y-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <ReloadIcon className="animate-spin h-6 w-6 text-orange-600" />
                                                        <span className="text-lg font-medium">Processing your image...</span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        🎨 Removing background with AI magic... This usually takes 40-60 seconds.
                                                    </div>
                                                    <div className="text-sm text-orange-600">
                                                        ☕ Perfect time to grab a coffee!
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* Behind layer text - render before removed bg image */}
                        {isImageSetupDone && textSets.filter(textSet => textSet.layer === 'behind').map(textSet => {
                            console.log(`Rendering BEHIND text: ${textSet.text} with layer: ${textSet.layer}`);
                            return (
                            <div
                                key={textSet.id}
                                style={{
                                    position: 'absolute',
                                    top: `${50 - textSet.top}%`,
                                    left: `${textSet.left + 50}%`,
                                    transform: `translate(-50%, -50%) rotate(${textSet.rotation}deg) perspective(1000px) rotateX(${textSet.tiltX}deg) rotateY(${textSet.tiltY}deg)`,
                                    color: textSet.color,
                                    textAlign: 'center',
                                    fontSize: `${textSet.fontSize}px`,
                                    fontWeight: textSet.fontWeight,
                                    fontFamily: textSet.fontFamily,
                                    opacity: textSet.opacity,
                                    letterSpacing: `${textSet.letterSpacing}px`,
                                    transformStyle: 'preserve-3d',
                                    WebkitTextStrokeWidth: `${textSet.strokeWidth}px`,
                                    WebkitTextStrokeColor: textSet.strokeColor,
                                    textShadow: textSet.shadowSize > 0 ? `0 0 ${Math.max(1, textSet.shadowSize)}px ${textSet.shadowColor}` : undefined,
                                    paintOrder: 'stroke fill',
                                    mixBlendMode: (textSet.blendMode as any) || 'normal',
                                    zIndex: 1
                                }}
                            >
                                <span style={{ display: 'inline-block', transform: `scale(${textSet.scaleX ?? 1}, ${textSet.scaleY ?? 1})` }}>
                                {textSet.text}
                                </span>
                            </div>
                            );
                        })}                
                        {removedBgImageUrl && (
                            <Image
                                src={removedBgImageUrl}
                                alt="Removed bg"
                                fill
                                style={{ objectFit: 'contain', objectPosition: 'center', zIndex: 2 }}
                                className="absolute top-0 left-0 w-full h-full"
                            /> 
                        )}
                        {/* Front layer - render after removed bg image */}
                        {isImageSetupDone && textSets.filter(textSet => textSet.layer === 'front').map(textSet => {
                            console.log(`Rendering FRONT text: ${textSet.text} with layer: ${textSet.layer}`);
                            return (
                            <div
                                key={textSet.id}
                                style={{
                                    position: 'absolute',
                                    top: `${50 - textSet.top}%`,
                                    left: `${textSet.left + 50}%`,
                                    transform: `translate(-50%, -50%) rotate(${textSet.rotation}deg) perspective(1000px) rotateX(${textSet.tiltX}deg) rotateY(${textSet.tiltY}deg)`,
                                    color: textSet.color,
                                    textAlign: 'center',
                                    fontSize: `${textSet.fontSize}px`,
                                    fontWeight: textSet.fontWeight,
                                    fontFamily: textSet.fontFamily,
                                    opacity: textSet.opacity,
                                    letterSpacing: `${textSet.letterSpacing}px`,
                                    transformStyle: 'preserve-3d',
                                    WebkitTextStrokeWidth: `${textSet.strokeWidth}px`,
                                    WebkitTextStrokeColor: textSet.strokeColor,
                                    textShadow: textSet.shadowSize > 0 ? `0 0 ${Math.max(1, textSet.shadowSize)}px ${textSet.shadowColor}` : undefined,
                                    paintOrder: 'stroke fill',
                                    mixBlendMode: (textSet.blendMode as any) || 'normal',
                                    zIndex: 10
                                }}
                            >
                                <span style={{ display: 'inline-block', transform: `scale(${textSet.scaleX ?? 1}, ${textSet.scaleY ?? 1})` }}>
                                {textSet.text}
                                </span>
                            </div>
                            );
                        })}
                                    </div>
                                </div>
                                {/* Ads removed in this fork */}
                            </div>
                            <div className='flex flex-col w-full md:w-1/2 border rounded-2xl overflow-hidden bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm'>
                                <Tabs defaultValue="text" className="w-full">
                                    <TabsList className="grid grid-cols-3 m-4">
                                        <TabsTrigger value="text">Text</TabsTrigger>
                                        <TabsTrigger value="image">Image</TabsTrigger>
                                        <TabsTrigger value="settings">Settings</TabsTrigger>
                                    </TabsList>
                                    <ScrollArea className="h-[calc(100vh-12rem)] p-4 pt-0">
                                        <TabsContent value="text" className="m-0">
                                            <Button className='w-full' onClick={addNewTextSet}><PlusIcon className='mr-2'/> Add New Text</Button>
                                            <Accordion type="single" collapsible className="w-full mt-2">
                                                {textSets.map(textSet => (
                                                    <TextCustomizer 
                                                        key={textSet.id}
                                                        textSet={textSet}
                                                        handleAttributeChange={handleAttributeChange}
                                                        removeTextSet={removeTextSet}
                                                        duplicateTextSet={duplicateTextSet}
                                                        userId={'guest'}
                                                    />
                                                ))}
                                            </Accordion>
                                        </TabsContent>
                                        <TabsContent value="image" className="m-0">
                                            <ImageControls
                                                rotationDeg={rotationDeg}
                                                brightness={brightness}
                                                contrast={contrast}
                                                aspectRatio={aspectRatio}
                                                onChangeRotation={setRotationDeg}
                                                onChangeBrightness={setBrightness}
                                                onChangeContrast={setContrast}
                                                onChangeAspectRatio={setAspectRatio}
                                                onReset={resetImageAdjustments}
                                            />
                                        </TabsContent>
                                        <TabsContent value="settings" className="m-0">
                                            <div className='space-y-3'>
                                                <Button className='w-full' onClick={saveCompositeImage}>Download Image</Button>
                                                <div className='text-xs text-muted-foreground'>High quality PNG export</div>
                                            </div>
                                        </TabsContent>
                                    </ScrollArea>
                                </Tabs>
                                <div className='border-t p-4'>
                                    <Button className='w-full' onClick={saveCompositeImage}>Download Image</Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`flex flex-col items-center justify-center min-h-[60vh] w-full text-center gap-4 px-6`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <div className={`w-full max-w-2xl rounded-2xl border-2 ${isDragging ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-900/20' : 'border-dashed'} p-10 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md`}> 
                                <div className='text-sm text-muted-foreground'>Drag and drop an image here</div>
                                <div className='text-xs text-muted-foreground'>or click to select a file</div>
                                <div className='mt-4'>
                                    <Button onClick={handleUploadImage} className='bg-orange-600 hover:bg-orange-700 text-white'>Select Image</Button>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                                accept=".jpg, .jpeg, .png"
                            />
                        </div>
                    )} 
                    
                </div>
            ) : (
                <></>
            )}
        </>
    );
}

export default Page;