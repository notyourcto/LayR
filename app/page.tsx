'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import InlineEditor from '@/components/editor/inline-editor';

const Page = () => {
    const editorRef = useRef<HTMLDivElement>(null)

    const scrollToEditor = () => {
        editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return ( 
        <div className='relative flex flex-col min-h-screen w-full items-center justify-start overflow-hidden'>
            <header className='sticky top-0 z-30 w-full border-b bg-background/70 backdrop-blur-md'>
                <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-3'>
                    <Link href='/' className='font-semibold tracking-tight flex items-center gap-2'>
                        <span className='inline-block h-6 w-6 rounded-md bg-gradient-to-tr from-orange-500 via-amber-400 to-rose-300' />
                        <span>LayR</span>
                    </Link>
                    <nav className='flex items-center gap-4'>
                        <ModeToggle />
                        <Button size='sm' onClick={scrollToEditor} className='bg-orange-600 hover:bg-orange-700 text-white'>Get Started</Button>
                    </nav>
                </div>
            </header>

            <div className="pointer-events-none absolute inset-0">
                <div className='absolute -top-40 -left-40 h-80 w-80 rounded-full blur-3xl opacity-60 bg-orange-300 dark:opacity-50 dark:bg-orange-600/50' />
                <div className='absolute top-10 right-[-6rem] h-72 w-72 rounded-full blur-3xl opacity-60 bg-amber-300 dark:opacity-50 dark:bg-amber-600/50' />
                <div className='absolute bottom-[-6rem] left-1/2 -translate-x-1/2 h-96 w-96 rounded-full blur-3xl opacity-60 bg-rose-300 dark:opacity-50 dark:bg-rose-700/50' />
            </div>

            <section className="relative z-10 w-full max-w-7xl px-6 pt-10 pb-2 text-center">
                <h1 className='font-extrabold tracking-tight leading-tight'>
                    <span className='block text-4xl md:text-6xl text-zinc-800 dark:text-zinc-100'>Place Text</span>
                    <span className='block text-[2.75rem] md:text-7xl text-orange-600'>Behind Your Subject</span>
                </h1>
                <p className='mt-4 max-w-3xl mx-auto text-muted-foreground'>
                    Create text-behind-image designs in seconds. Unlimited downloads. 100% free to use. No ads. No signup required.
                </p>
                
            </section>

            <section ref={editorRef} id='editor' className='relative z-10 w-full max-w-7xl px-6 py-4'>
                <InlineEditor />
            </section>

            {/* features section removed per request */}

            <section className="relative z-10 w-full max-w-7xl px-6 pb-16">
                <div className='pointer-events-none absolute inset-0 -z-10 opacity-40' style={{backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px'}} />
                <h2 className='text-3xl md:text-4xl font-bold text-center mb-8'>Create Your Design in 4 Simple Steps</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="relative rounded-xl border p-5 bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm">
                        <span className='absolute -top-3 -left-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-800'>1</span>
                        <h3 className="font-semibold mb-1 mt-2">Upload Photo</h3>
                        <p className="text-sm text-muted-foreground">Upload any image from your device</p>
                    </div>
                    <div className="relative rounded-xl border p-5 bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm">
                        <span className='absolute -top-3 -left-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-800'>2</span>
                        <h3 className="font-semibold mb-1 mt-2">Add Text</h3>
                        <p className="text-sm text-muted-foreground">Add and style your text layers</p>
                    </div>
                    <div className="relative rounded-xl border p-5 bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm">
                        <span className='absolute -top-3 -left-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-800'>3</span>
                        <h3 className="font-semibold mb-1 mt-2">Position Text</h3>
                        <p className="text-sm text-muted-foreground">Place text behind image elements</p>
                    </div>
                    <div className="relative rounded-xl border p-5 bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm">
                        <span className='absolute -top-3 -left-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-800'>4</span>
                        <h3 className="font-semibold mb-1 mt-2">Download</h3>
                        <p className="text-sm text-muted-foreground">Export in high quality PNG format</p>
                    </div>
                </div>
                
            </section>

            <section className="relative z-10 w-full max-w-5xl px-6 pb-8 text-center">
                <div className='text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                    Trending text-behind-image style posts
                </div>
                <h3 className='mt-2 text-2xl md:text-3xl font-bold'>
                    Your Photos, Your Words — Blended into Scroll-Stopping Designs
                </h3>
                <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='relative aspect-[16/9] rounded-xl overflow-hidden'>
                        <Image src={'/aim1.jpg'} alt='aim1' fill className='object-cover' priority />
                    </div>
                    <div className='relative aspect-[16/9] rounded-xl overflow-hidden'>
                        <Image src={'/aim2.jpg'} alt='aim2' fill className='object-cover' />
                    </div>
                    <div className='relative aspect-[16/9] rounded-xl overflow-hidden'>
                        <Image src={'/aim3.jpg'} alt='aim3' fill className='object-cover' />
                    </div>
                    <div className='relative aspect-[16/9] rounded-xl overflow-hidden'>
                        <Image src={'/aim4.jpg'} alt='aim4' fill className='object-cover' />
                    </div>
                </div>
            </section>

            <section className='relative z-10 w-full max-w-5xl px-6 pb-10'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground'>
                    <div className='rounded-2xl border p-4 bg-white/70 dark:bg-zinc-900/40 backdrop-blur'>
                        <div className='font-medium text-foreground mb-2 flex items-center gap-2'>
                            <span className='inline-block h-4 w-4 rounded-sm bg-gradient-to-tr from-orange-500 via-amber-400 to-rose-300' />
                            <span>LayR</span>
                        </div>
                        <p>
                            Instantly create text-behind-image magic. Always free, built with <span className='text-red-500'>❤</span>.
                        </p>
                    </div>
                    <div className='rounded-2xl border p-4 bg-white/70 dark:bg-zinc-900/40 backdrop-blur'>
                        <div className='font-medium text-foreground mb-2'>Connect</div>
                        <div className='flex items-center gap-4'>
                            <Link href={'https://www.instagram.com/notyourcfo'} target="_blank" rel="noopener noreferrer" className='underline underline-offset-4'>Instagram</Link>
                            <Link href={'https://x.com/notyourcfo'} target="_blank" rel="noopener noreferrer" className='underline underline-offset-4'>Twitter/X</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* additional info section removed per request */}
        </div>
    );
}

export default Page;