'use client';

import { useEffect, useState } from 'react';
import CommentForm from './CommentForm';

export default function CommentSection({ mangaId, volumeId }) {
    const [comments, setComments] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error('Помилка отримання користувача:', err);
            }
        };

        fetchUser();
    }, []);

    const loadComments = async () => {
        const res = await fetch(`/api/mangas/${mangaId}/volumes/${volumeId}/comments`);
        if (res.ok) {
            const data = await res.json();
            setComments(data);
        } else {
            console.error('Помилка завантаження комментарів');
        }
    };

    useEffect(() => {
        loadComments();
    }, [mangaId, volumeId]);

    const handleReplyClick = (commentId) => {
        setReplyingTo(commentId === replyingTo ? null : commentId);
    };

    const renderComments = (parentId = null, depth = 0) => {
        return comments
            .filter((c) => c.parentId === parentId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((comment) => (
                <div key={comment.id} className="mt-4 border-l border-blue-700 pl-4">
                    <div className="text-sm text-white">
                        <strong>{comment.authorName || 'Аноним'}</strong> •{' '}
                        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-white mt-1 break-words">{comment.content}</p>
                    {user && depth <= 10 && (
                        <button
                            onClick={() => handleReplyClick(comment.id)}
                            className="text-blue-500 text-sm mt-1 hover:underline"
                        >
                            Відповісти
                        </button>
                    )}

                    {replyingTo === comment.id && (
                        <CommentForm
                            mangaId={mangaId}
                            volumeId={volumeId}
                            parentId={comment.id}
                            onSubmit={() => {
                                setReplyingTo(null);
                                loadComments();
                            }}
                        />
                    )}

                    {renderComments(comment.id, depth + 1)}
                </div>
            ));
    };

    return (
        <div className="flex flex-col gap-3" id='comments'>
            <h2 className="text-xl font-bold">Коментарі</h2>

            {user ? (
                <CommentForm
                    mangaId={mangaId}
                    volumeId={volumeId}
                    onSubmit={loadComments}
                />
            ) : (
                <p className="text-gray-600">Увійдіть щоб залишати коментарі.</p>
            )}

            <div className="">
                {comments.length === 0 ? (
                    <p className="text-gray-500">Коменатрів поки немає. Будь першим!</p>
                ) : (
                    renderComments()
                )}
            </div>
        </div>
    );
}
