import "../styles/footer.css";
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className="footer">
      <div className="container footer-inner">
        <div className="legal">© {year} AMP M • All rights reserved.</div>
        <div className="links" aria-label="Footer Links">
          <a href="mailto:you@example.com">Email</a>
          <a
            href="https://github.com/yourname"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/yourname"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
