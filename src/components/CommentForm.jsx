import React, { useState } from 'react';
import styled from 'styled-components';

const CommentForm = ({ postId, comment, onCommentSubmit }) => {
  const [content, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      // comment가 없으면 최상위 댓글, 있으면 답글
      const parentId = comment ? (comment.parentId === null ? comment.commentId : comment.parentId) : null;
      
      const response = await fetch(`https://dev.vivim.co.kr/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          content: content,
          parentId: parentId
        })
      });

      if (response.ok) {
        setComment('');
        onCommentSubmit();
      } else {
        console.error('Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <CommentInput
        value={content}  // Changed from 'content' to 'comment'
        onChange={(e) => setComment(e.target.value)}
        placeholder="댓글을 입력하세요..."
      />
      <SubmitButton type="submit">댓글 작성</SubmitButton>
    </FormContainer>
  );
};

const FormContainer = styled.form`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const SubmitButton = styled.button`
  padding: 8px 16px;
  background-color: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 6px;
  color: #16a34a;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #bbf7d0;
    color: #15803d;
  }
`;

export default CommentForm;