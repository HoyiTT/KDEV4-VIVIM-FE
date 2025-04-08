import React from 'react';
import styled from 'styled-components';

const Comments = ({ comments }) => {
  // 부모 댓글만 필터링
  const parentComments = comments.filter(comment => comment.parentId === null);

  // 특정 부모 댓글에 속한 자식 댓글들을 찾는 함수
  const findChildComments = (parentId) => {
    return comments.filter(comment => comment.parentId === parentId);
  };

  return (
    <CommentsContainer>
      {parentComments.map(comment => (
        <CommentThread key={comment.commentId}>
          {/* 부모 댓글 */}
          <CommentItem>
            <CommentContent>{comment.content}</CommentContent>
            <CommentDate>{new Date(comment.createdAt).toLocaleDateString()}</CommentDate>
          </CommentItem>
          
          {/* 자식 댓글들 */}
          {findChildComments(comment.commentId).map(childComment => (
            <ChildCommentItem key={childComment.commentId}>
              <ReplyIcon>↳</ReplyIcon>
              <div>
                <CommentContent>{childComment.content}</CommentContent>
                <CommentDate>{new Date(childComment.createdAt).toLocaleDateString()}</CommentDate>
              </div>
            </ChildCommentItem>
          ))}
        </CommentThread>
      ))}
    </CommentsContainer>
  );
};

const CommentsContainer = styled.div`
  margin-top: 20px;
`;

const CommentThread = styled.div`
  margin-bottom: 20px;
`;

const CommentItem = styled.div`
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const ChildCommentItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 8px;
  margin-left: 24px;
  margin-bottom: 8px;
`;

const ReplyIcon = styled.span`
  margin-right: 8px;
  color: #64748b;
`;

const CommentContent = styled.p`
  margin: 0;
  color: #1e293b;
  font-size: 14px;
`;

const CommentDate = styled.span`
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
  display: block;
`;

export default Comments;