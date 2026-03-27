import { useMemo, useState } from "react";
import LoginModal from "../components/LoginModal";

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);

  const features = useMemo(
    () => [
      {
        icon: "⬆️",
        title: "Upload your DDT",
        desc: "Create tamper-proof evidence instantly",
      },
      {
        icon: "📊",
        title: "View your proofs",
        desc: "All notarized documents in one dashboard",
      },
      {
        icon: "🔍",
        title: "Verify anytime",
        desc: "Re-upload the file to confirm its integrity",
      },
    ],
    [],
  );

  function onAccessDashboard() {
    setLoginOpen(true);
  }

  return (
    <div className="landing-root">
      <header className="landing-nav">
        <div className="landing-container flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-3"
            style={{ textDecoration: "none" }}
            aria-label="AnchorDoc home"
          >
            <img
              src="/branding/AnchorDocLogo.png"
              className="h-12 w-auto object-contain block"
              alt="AnchorDoc"
            />
          </a>

          <button
            className="landing-btn-primary"
            type="button"
            onClick={onAccessDashboard}
          >
            Access Dashboard
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-container">
          <div
            className="landing-tag landing-up"
            style={{ animationDelay: "0.02s" }}
          >
            IOTA Notarization · Proof of Delivery
          </div>

          <h1
            className="landing-title landing-up"
            style={{ animationDelay: "0.12s" }}
          >
            Prove your transport documents <em>haven’t been altered</em>
          </h1>

          <p
            className="landing-sub landing-up text-center mx-auto"
            style={{ animationDelay: "0.22s" }}
          >
            Upload a DDT, create a tamper-proof fingerprint, and verify it anytime even months later.
          </p>

          <div
            className="landing-cta-row landing-up"
            style={{ animationDelay: "0.32s" }}
          >
            <button className="landing-btn-primary" type="button" onClick={onAccessDashboard}>
              Notarize a document
            </button>
            <a className="landing-btn-ghost" href="#usecase">
            See how it works
            </a>
          </div>
        </div>

      </section>

      <div className="landing-bottom" id="usecase">
        <div className="landing-ps-grid">
          <div className="landing-card problem">
            <div className="landing-card-label">⚠ The Problem</div>
            <h3>Delivery disputes become proof problems.</h3>
            <ul>
              <li>Disputes happen months after delivery</li>
              <li>Finding the original DDT takes days</li>
              <li>No way to prove the document wasn’t altered</li>
              <li>Leads to delays, legal risk, and compliance issues</li>
            </ul>
          </div>

          <div className="landing-card solution">
            <div className="landing-card-label">✓ The Solution</div>
            <h3>Turn every DDT into verifiable proof.</h3>
            <ul>
              <li>Upload your Transport Document (DDT)</li>
              <li>We create a unique digital fingerprint</li>
              <li>Anchor it on IOTA with an immutable timestamp</li>
              <li>Verify anytime by re-uploading the document</li>
            </ul>
          </div>
        </div>

        <div className="landing-real-case">
          <div className="landing-rc-tag">
          Real case — Stenfis S.r.l.{" "}
            <img
              src="/branding/StenfisLogo.png"
              className="h-5 w-auto object-contain inline-block align-middle"
              alt="Stenfis"
            />{" "}
           A delivery dispute with no verifiable proof
          </div>
          <p>
          This project stems from an issue that occurred at Stenfis S.r.l., an Italian manufacturing company.
A dispute occurred after a supplier delivered defective and compromised components, which led to legal action.

During the legal proceedings, it became necessary to retrieve and verify the authenticity and validity of the transport documents (DDTs) under legal supervision. This procedure was time-consuming, costly, and inefficient due to the lack of an immutable, trusted record.

AnchorDoc was designed to solve this problem by introducing a decentralized, tamper-proof document trust layer that enables instant verification and transparency while significantly reducing operational and legal overhead.
          </p>
        </div>

        <div className="landing-features-title">How you prove document integrity in seconds</div>
        <div className="landing-features-row">
          {features.map((f) => (
            <div key={f.title} className="landing-feat">
              <div className="landing-feat-icon" aria-hidden="true">
                {f.icon}
              </div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

