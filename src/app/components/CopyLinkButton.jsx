'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyLinkButton() {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Повернути стан через 2 сек
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-gray-300 transition w-fit cursor-pointer"
        >
            {copied ? (
                <>
                    <Check size={20} className="text-green-400" />
                    Скопійовано
                </>
            ) : (
                <>
                    <Copy size={20} />
                    Поширити
                </>
            )}
        </button>
    );
}
