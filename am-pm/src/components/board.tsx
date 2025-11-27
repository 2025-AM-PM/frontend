import { useEffect, useState } from "react";
import "../styles/board.css";
import MiniBoard from "./miniBoard";
import { apiFetch } from "../api/client";
import { PageData, Post } from "../types";

function Board() {
  const [postsMap, setPostsMap] = useState<Record<string, Post[]>>({
    NOTICE: [],
    STUDY: [],
    JOB: [],
    INFO: [],
  });

  const categories = [
    { key: "NOTICE", title: "공지사항" },
    { key: "STUDY", title: "스터디" },
    { key: "JOB", title: "취업 정보" },
    { key: "INFO", title: "학교 정보" },
  ];

  useEffect(() => {
    const fetchAll = async () => {
      const promises = categories.map(async ({ key }) => {
        try {
          const res = await apiFetch<PageData>(
            `/posts?category=${key}&page=0&size=5&sort=createdAt,desc`
          );
          return { key, data: res.data?.content || [] };
        } catch (e) {
          console.error(`Failed to fetch ${key}`, e);
          return { key, data: [] };
        }
      });

      const results = await Promise.all(promises);
      const newMap: Record<string, Post[]> = { ...postsMap };
      results.forEach(({ key, data }) => {
        newMap[key] = data;
      });
      setPostsMap(newMap);
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="board-main">
      <div className="board-container">
        {categories.map(({ key, title }) => (
          <MiniBoard key={key} boardTitle={title} posts={postsMap[key]} />
        ))}
      </div>
    </div>
  );
}

export default Board;
