import { StringMappingType } from "typescript";

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
  posts: Post[]; // 단일 게시글 정보 대신 게시글 '배열'을 받도록 수정
}

export interface Session {
  userName: string | null;
  userTier: string | null;
  userId: string | null;
}
