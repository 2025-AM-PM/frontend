import "../styles/prove.css";

export default function Prove() {
  return (
    <div className="prove-main">
      <form className="prove-form">
        <input
          type="url"
          placeholder="깃 주소를 입력하세요"
          className="url-input"
        ></input>
        <button type="submit" className="submit-button">
          제출하기{" "}
        </button>
      </form>
    </div>
  );
}
