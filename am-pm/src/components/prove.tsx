import "../styles/prove.css";
import { useState } from "react";

const onSubmit = () => {};

// const handleSubmit = (e: React.FormEvent) => {
//   e.preventDefault();
//   onSubmit();
// };

export default function Prove() {
  const [url] = useState("");

  return (
    <div className="prove-main">
      <form className="prove-form">
        <input
          type="url"
          placeholder="깃 주소를 입력하세요"
          value={url}
          className="url-input"
        ></input>
        <button type="submit" className="submit-button">
          제출하기{" "}
        </button>
      </form>
    </div>
  );
}
