import "../styles/loginBtn.css";
import { useNavigate } from "react-router-dom";

function LoginBtn() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };
  return (
    <div className="loginBtn">
      <button onClick={handleLoginClick}>
        <span>로그인하기</span>
      </button>
    </div>
  );
}

export default LoginBtn;
