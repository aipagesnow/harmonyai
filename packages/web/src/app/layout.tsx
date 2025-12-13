import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'HarmonyAI - Workplace Conflict Prevention',
    description: 'Proactive conflict detection and resolution for remote teams.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="bg-slate-50 min-h-screen text-slate-900 font-sans antialiased">
                <main className="flex flex-col items-center justify-center min-h-screen p-4">
                    {children}
                </main>
            </body>
        </html>
    )
}
