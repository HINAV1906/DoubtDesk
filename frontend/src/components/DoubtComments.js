import React, { useState, useEffect } from 'react';
import { API_BASE, authHeaders, authJsonHeaders } from '../api';
import './DoubtComments.css';

const DoubtComments = ({ doubtId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/doubts/${doubtId}/comments/`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, doubtId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/doubts/${doubtId}/comments/`, {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({ comment: newComment }),
      });

      if (res.ok) {
        const added = await res.json();
        setComments((prev) => [...prev, added]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comments-wrapper">
      <button
        className="comments-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>{isOpen ? 'Hide Clarification Thread' : `Discussion Thread (${comments.length})`}</span>
      </button>

      {isOpen && (
        <div className="comments-box">
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No follow-up messages yet. Ask a clarification below!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className={`comment-bubble ${c.sender_role}`}>
                  <div className="comment-header">
                    <span className="comment-sender">{c.sender_name} ({c.sender_role})</span>
                    <span className="comment-time">{c.created_at}</span>
                  </div>
                  <p className="comment-text">{c.comment}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="comment-form">
            <input
              type="text"
              placeholder="Write a follow-up reply or clarification..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
            />
            <button type="submit" className="comment-send-btn" disabled={loading}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DoubtComments;
