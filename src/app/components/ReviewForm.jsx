'use client';

import { useState } from 'react';

export default function ReviewForm({ mangaId, onReviewAdded }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const submitReview = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`/api/mangas/${mangaId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ rating, content }),
            });

            if (!res.ok) throw new Error('Не вдалося залишити відгук');

            setSuccess(true);
            setRating(0);
            setContent('');
            if (onReviewAdded) onReviewAdded();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submitReview} className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold">Залишити відгук</h3>

            <div className="flex gap-1">
                {[...Array(10)].map((_, index) => {
                    const starValue = index + 1;
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHover(starValue)}
                            onMouseLeave={() => setHover(0)}
                            className={`text-2xl transition cursor-pointer ${starValue <= (hover || rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                                }`}
                        >
                            ✦
                        </button>
                    );
                })}
            </div>

            <textarea
                className="w-full p-2 border rounded"
                placeholder="Ваш відгук (необов'язково)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
            />

            <button
                type="submit"
                disabled={loading || rating === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
            >
                Надіслати
            </button>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">Відгук додано!</p>}
        </form>
    );
}
