'use client';

import { useEffect, useState } from 'react';

export default function MangaReviews({ mangaId }) {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                const res = await fetch(`/api/mangas/${mangaId}/reviews`,
                    { method: 'GET' }
                );
                if (!res.ok) throw new Error('Не вдалося завантажити відгуки');
                const data = await res.json();
                setReviews(data);
            } catch (e) {
                setError(e.message);
            }
        };

        loadReviews();
    }, [mangaId]);

    if (error) return <div className="text-red-500">{error}</div>;
    if (!reviews.length) return <div>Відгуків поки немає.</div>;

    return (
        <div className="">
            <h2 className="text-2xl font-semibold mb-2">Відгуки ({reviews.length})</h2>
            <ul className="space-y-4">
                {reviews.map((review) => (
                    <li key={review.id} className="border rounded p-4 shadow bg-white">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-black">{review.user.name}</span>
                            <span className="text-yellow-400 bg-black p-1 rounded-full px-2">{Array(review.rating).fill(null).map((_, i) => (
                                <span key={i}>✦</span>
                            ))}</span>
                        </div>
                        {review.content && <p className="text-gray-700">{review.content}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
