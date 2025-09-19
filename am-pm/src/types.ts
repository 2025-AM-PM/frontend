export interface Post {
  id: number; // 고유한 key로 사용될 id
  title: string;
  createdAt: string;
  view: number;
  link: string;
  author: string;
}

export interface MiniBoardProps {
  boardTitle: string;
  posts: Post[];
}

export interface User {
  studentName: string | null;
  studentTier: string | null;
  studentNumber: string | null;
}
