import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="page-section not-found">
      <p className="eyebrow">404 ERROR</p>
      <h1>This page isn't on the menu.</h1>
      <p>Let's get you back to something delicious.</p>
      <Link className="primary-button" to="/">
        Back to home
      </Link>
    </section>
  );
}
