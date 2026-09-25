import { useEffect, useRef, useState } from "react";
import { downloadPartnershipOverview } from "./mediaKitPdf";

const emailAddress = "nomiemotso@gmail.com";
const bookingLink = `mailto:${emailAddress}?subject=Partnership%20enquiry%20-%20Nomthandazo%20Nkosi`;

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="arrow-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <path d="M10 3v10M6 9l4 4 4-4M4 16h12" />
    </svg>
  );
}

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="arrow-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {diagonal ? (
        <path d="M5 15 15 5M6 5h9v9" />
      ) : (
        <path d="M3 10h13m-5-5 5 5-5 5" />
      )}
    </svg>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pdfState, setPdfState] = useState<"idle" | "working" | "done" | "error">("idle");
  const menuOpenRef = useRef(false);
  const pdfTimer = useRef(0);
  menuOpenRef.current = menuOpen;

  const downloadOverview = () => {
    if (pdfState === "working") return;
    setPdfState("working");
    window.setTimeout(() => {
      try {
        downloadPartnershipOverview();
        setPdfState("done");
        window.clearTimeout(pdfTimer.current);
        pdfTimer.current = window.setTimeout(() => setPdfState("idle"), 2800);
      } catch {
        setPdfState("error");
      }
    }, 40);
  };

  useEffect(() => {
    if (menuOpen) document.querySelector(".site-header")?.classList.remove("is-hidden");
  }, [menuOpen]);

  useEffect(() => () => window.clearTimeout(pdfTimer.current), []);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const counts = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    const writeCount = (element: HTMLElement, value: number) => {
      const decimals = Number(element.dataset.decimals || 0);
      const suffix = element.dataset.suffix ?? "";
      element.textContent = `${decimals ? value.toFixed(decimals) : Math.round(value)}${suffix}`;
    };

    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((element) => element.classList.add("is-visible"));
      counts.forEach((element) => writeCount(element, Number(element.dataset.count || 0)));
      return;
    }

    const header = document.querySelector<HTMLElement>(".site-header");
    const hero = document.querySelector<HTMLElement>(".hero");
    const title = document.querySelector<HTMLElement>("#hero-title");
    const frame = document.querySelector<HTMLElement>(".pointer__frame");
    const dot = document.querySelector<HTMLElement>(".pointer__dot");
    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".site-nav a[href^='#']"));
    const sections = navLinks
      .map((link) => document.querySelector<HTMLElement>(link.getAttribute("href") || ""))
      .filter((section): section is HTMLElement => Boolean(section));

    let mx = window.innerWidth * 0.5;
    let my = window.innerHeight * 0.4;
    let fx = mx;
    let fy = my;
    let intent: "down" | "up" = "up";
    let touchY = 0;
    let scrollDirty = true;
    let active = true;
    let paused = false;
    let raf = 0;

    const schedule = () => {
      if (!raf && active && !paused) raf = window.requestAnimationFrame(tick);
    };

    const updateScroll = () => {
      const y = window.scrollY;
      root.dataset.scrollDir = intent;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll", max > 0 ? (y / max).toFixed(4) : "0");

      if (header) {
        header.classList.toggle("is-hidden", !menuOpenRef.current && y > 150 && intent === "down");
        header.classList.toggle("is-scrolled", y > 8);
      }

      if (hero) {
        const rect = hero.getBoundingClientRect();
        const passed = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
        hero.style.setProperty("--hero-p", passed.toFixed(4));
      }

      const midpoint = window.innerHeight * 0.55;
      reveals.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const outside = rect.bottom < 0 || rect.top > window.innerHeight;
        if (outside && !element.classList.contains("is-visible")) {
          element.dataset.from = intent;
          element.style.setProperty("--enter", intent === "up" ? "-36px" : "36px");
        }
        if (rect.bottom < -140 || rect.top > window.innerHeight + 140) return;
        const shift = Math.max(-14, Math.min(14, (rect.top + rect.height * 0.3 - midpoint) * -0.028));
        element.style.setProperty("--shift", `${shift.toFixed(2)}px`);
      });

      let current = "";
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.45 && rect.bottom > 96) current = section.id;
      });
      navLinks.forEach((link) => {
        link.classList.toggle("is-current", link.getAttribute("href") === `#${current}`);
      });
    };

    const tick = () => {
      raf = 0;
      if (!active || paused) return;
      fx += (mx - fx) * 0.16;
      fy += (my - fy) * 0.16;
      frame?.style.setProperty("translate", `${fx}px ${fy}px`);
      dot?.style.setProperty("translate", `${mx}px ${my}px`);
      if (hero) {
        hero.style.setProperty("--breathe", Math.sin(performance.now() / 1500).toFixed(3));
      }
      if (scrollDirty) {
        scrollDirty = false;
        updateScroll();
      }
      raf = window.requestAnimationFrame(tick);
    };

    const onScroll = () => {
      scrollDirty = true;
      schedule();
    };
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 0.5) return;
      intent = event.deltaY > 0 ? "down" : "up";
      scrollDirty = true;
      schedule();
    };
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? touchY;
    };
    const onTouchMove = (event: TouchEvent) => {
      const next = event.touches[0]?.clientY ?? touchY;
      if (Math.abs(next - touchY) > 2) intent = next < touchY ? "down" : "up";
      touchY = next;
      scrollDirty = true;
      schedule();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") intent = "down";
      if (event.key === "ArrowUp" || event.key === "PageUp") intent = "up";
      scrollDirty = true;
      schedule();
    };
    const onMove = (event: MouseEvent) => {
      mx = event.clientX;
      my = event.clientY;
      document.body.classList.add("is-pointing");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        if (my >= rect.top && my <= rect.bottom && mx >= rect.left && mx <= rect.right) {
          hero.style.setProperty("--px", ((mx - rect.left) / rect.width - 0.5).toFixed(4));
          hero.style.setProperty("--py", ((my - rect.top) / rect.height - 0.5).toFixed(4));
        }
      }
      if (title) {
        const rect = title.getBoundingClientRect();
        const hot = mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom;
        title.style.setProperty("--name-hot", hot ? "1" : "0");
        if (hot) title.style.setProperty("--name-x", `${mx - rect.left}px`);
      }
      const target = event.target instanceof Element ? event.target : null;
      frame?.classList.toggle("is-hot", Boolean(target?.closest("a, button")));
      schedule();
    };
    const onLeave = () => {
      document.body.classList.remove("is-pointing");
      hero?.style.setProperty("--px", "0");
      hero?.style.setProperty("--py", "0");
      title?.style.setProperty("--name-hot", "0");
    };
    const onVisibility = () => {
      paused = document.hidden;
      if (!paused) schedule();
    };

    const magnetCleanups: Array<() => void> = [];
    if (fine) {
      document.querySelectorAll<HTMLElement>(".button").forEach((button) => {
        const move = (event: MouseEvent) => {
          const rect = button.getBoundingClientRect();
          const x = (event.clientX - (rect.left + rect.width / 2)) * 0.16;
          const y = (event.clientY - (rect.top + rect.height / 2)) * 0.28;
          button.style.setProperty("translate", `${x.toFixed(1)}px ${y.toFixed(1)}px`);
        };
        const leave = () => button.style.setProperty("translate", "0px 0px");
        button.addEventListener("mousemove", move);
        button.addEventListener("mouseleave", leave);
        magnetCleanups.push(() => {
          button.removeEventListener("mousemove", move);
          button.removeEventListener("mouseleave", leave);
        });
      });
    }

    const counted = new WeakSet<HTMLElement>();
    const animateCount = (element: HTMLElement) => {
      if (counted.has(element)) return;
      counted.add(element);
      const target = Number(element.dataset.count || 0);
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / 1150, 1);
        writeCount(element, target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const fromUp = root.dataset.scrollDir === "up";
          if (entry.isIntersecting) {
            element.dataset.from = fromUp ? "up" : "down";
            element.style.setProperty("--enter", "0px");
            element.classList.add("is-visible");
          } else if (entry.intersectionRatio === 0) {
            element.dataset.from = fromUp ? "up" : "down";
            element.style.setProperty("--enter", fromUp ? "-36px" : "36px");
            element.classList.remove("is-visible");
          }
        });
      },
      { threshold: [0, 0.16], rootMargin: "0px 0px -7% 0px" },
    );
    reveals.forEach((element) => revealObserver.observe(element));

    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) animateCount(entry.target as HTMLElement);
        });
      },
      { threshold: 0.45 },
    );
    counts.forEach((element) => countObserver.observe(element));

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    if (fine) {
      window.addEventListener("mousemove", onMove);
      document.documentElement.addEventListener("mouseleave", onLeave);
    }
    schedule();

    return () => {
      active = false;
      if (raf) window.cancelAnimationFrame(raf);
      revealObserver.disconnect();
      countObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      magnetCleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <div className="scroll-progress" aria-hidden="true">
        <span />
      </div>
      <div className="pointer" aria-hidden="true">
        <span className="pointer__frame" />
        <span className="pointer__dot" />
      </div>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Nomthandazo Nkosi, home" onClick={closeMenu}>
          <span className="wordmark__seal" aria-hidden="true">
            NN
          </span>
          <span className="wordmark__name">
            Nomthandazo <strong>Nkosi</strong>
          </span>
        </a>

        <button
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <span className="menu-toggle__lines" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>

        <nav
          className={`site-nav${menuOpen ? " is-open" : ""}`}
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          <a href="#profile" onClick={closeMenu}>
            Profile
          </a>
          <a href="#not-sorry" onClick={closeMenu}>
            Not Sorry
          </a>
          <a href="#partnerships" onClick={closeMenu}>
            Partnerships
          </a>
          <a href="#overview" onClick={closeMenu}>
            Overview
          </a>
          <a className="site-nav__booking" href={bookingLink} onClick={closeMenu}>
            Get in touch <ArrowIcon diagonal />
          </a>
        </nav>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <img
            className="hero__image"
            src="https://images.pexels.com/photos/27152278/pexels-photo-27152278.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1500&w=2400"
            alt="Editorial portrait placeholder for Nomthandazo Nkosi's approved portrait."
            fetchPriority="high"
          />
          <div className="hero__shade" aria-hidden="true" />

          <div className="hero__content">
            <h1 id="hero-title">
              <span>Nomthandazo</span>
              <span>Nkosi</span>
            </h1>
            <p className="hero__role">
              Master&apos;s graduate <span aria-hidden="true">·</span> Businesswoman <span aria-hidden="true">·</span> Host, Not Sorry
            </p>
            <p className="hero__intro">
              Postgraduate rigor in business. An unfiltered voice in the conversations shaping South Africa.
            </p>
            <div className="hero__actions">
              <a className="button button--brass" href={bookingLink}>
                Discuss a partnership <ArrowIcon diagonal />
              </a>
              <button
                className="button button--line"
                type="button"
                onClick={downloadOverview}
                disabled={pdfState === "working"}
              >
                {pdfState === "working" ? "Preparing PDF" : "Download overview"} <DownloadIcon />
              </button>
              <a className="text-link text-link--light" href="#credentials">
                Explore her story <ArrowIcon />
              </a>
            </div>
          </div>
          <a className="scroll-cue" href="#credentials">
            <span>Scroll</span>
            <i aria-hidden="true" />
          </a>
        </section>

        <section className="credentials section-space" id="credentials" aria-labelledby="credentials-title">
          <div className="section-inner">
            <div className="section-intro" data-reveal>
              <div>
                <p className="section-kicker">01 / Credentials &amp; work</p>
                <h2 className="section-title" id="credentials-title">
                  Credentials come first.
                </h2>
              </div>
              <p className="section-intro__copy">
                Her public profile is grounded in education, business ownership and a seat at the table earned through preparation.
              </p>
            </div>

            <div className="credential-list">
              <article className="credential-row" data-reveal>
                <span className="credential-row__number">01</span>
                <h3>Master&apos;s graduate</h3>
                <p>An advanced academic foundation that informs a considered, rigorous point of view.</p>
              </article>
              <article className="credential-row" data-reveal>
                <span className="credential-row__number">02</span>
                <h3>Business owner</h3>
                <p>Runs tender and RFQ compliance consulting services for businesses preparing submissions.</p>
              </article>
              <article className="credential-row" data-reveal>
                <span className="credential-row__number">03</span>
                <h3>Podcast host</h3>
                <p>Co-host of Not Sorry, a South African show built on honest, unfiltered conversation.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="reach section-space" id="reach" aria-labelledby="reach-title">
          <div className="section-inner">
            <div className="section-intro section-intro--reach" data-reveal>
              <div>
                <p className="section-kicker">02 / Audience</p>
                <h2 className="section-title" id="reach-title">
                  Reach with a point of view.
                </h2>
              </div>
              <p className="section-intro__copy">
                A clear, engaged audience built around content that moves between faith, television, running and everyday life.
              </p>
            </div>

            <div className="reach-grid">
              <a
                className="reach-platform"
                data-reveal
                href="https://www.tiktok.com/@nomie_nkosi"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok, 492 thousand followers and 17.2 million likes"
              >
                <div className="reach-platform__topline">
                  <span>Primary platform / TikTok</span>
                  <ArrowIcon diagonal />
                </div>
                <div className="reach-platform__number">
                  <strong>
                    <span data-count="492" data-suffix="K">
                      0K
                    </span>
                  </strong>
                  <span>followers</span>
                </div>
                <p className="reach-platform__secondary">
                  <span data-count="17.2" data-suffix="M" data-decimals="1">
                    0M
                  </span>{" "}
                  <span className="reach-platform__unit">likes</span>
                </p>
                <span className="reach-platform__handle">@nomie_nkosi</span>
              </a>

              <a
                className="reach-platform"
                data-reveal
                href="https://www.instagram.com/nomieland.nkosi/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram, 26.5 thousand followers"
              >
                <div className="reach-platform__topline">
                  <span>Instagram</span>
                  <ArrowIcon diagonal />
                </div>
                <div className="reach-platform__number">
                  <strong>
                    <span data-count="26.5" data-suffix="K" data-decimals="1">
                      0K
                    </span>
                  </strong>
                  <span>followers</span>
                </div>
                <p className="reach-platform__secondary reach-platform__secondary--quiet">A close-knit community</p>
                <span className="reach-platform__handle">@nomieland.nkosi</span>
              </a>
            </div>
          </div>
        </section>

        <section className="profile section-space" id="profile" aria-labelledby="profile-title">
          <div className="section-inner profile-grid">
            <div className="profile__lead" data-reveal>
              <p className="section-kicker">03 / The work</p>
              <h2 className="section-title" id="profile-title">
                A seat earned.
                <br />
                In every room.
              </h2>
              <p className="profile__pullquote">She leads with credentials, preparation and a point of view.</p>
            </div>
            <div className="profile__copy" data-reveal>
              <p>
                Based in Johannesburg, Nomthandazo Nkosi works across business, media and political spaces. In rooms where women remain underrepresented, she has earned her position through education, enterprise and the quality of her work, not visibility alone.
              </p>
              <p>
                Her tender and RFQ compliance consultancy brings practical focus to business. Alongside it, her content offers considered takes on faith, television, running and lifestyle, with the same directness she brings to the Not Sorry podcast.
              </p>
              <p className="profile__topics">
                Faith <span>/</span> TV &amp; show reviews <span>/</span> Running <span>/</span> Lifestyle
              </p>
            </div>
          </div>
        </section>

        <section className="podcast section-space" id="not-sorry" aria-labelledby="podcast-title">
          <div className="section-inner podcast-grid">
            <div className="podcast__identity" data-reveal>
              <p className="section-kicker section-kicker--light">04 / The show</p>
              <h2 id="podcast-title">Not Sorry<span>.</span></h2>
              <span className="podcast__hairline" aria-hidden="true" />
            </div>
            <div className="podcast__details" data-reveal>
              <p className="podcast__dek">Honest conversation. No softening the edges.</p>
              <p>
                A South African podcast hosted by Nomthandazo Nkosi, Seemah Mangolwane and Munaka Muthambi. Not Sorry makes space for candid, unfiltered conversation about the ideas and experiences that matter.
              </p>
              <a className="text-link text-link--light" href={`${bookingLink}&body=I%20would%20like%20to%20discuss%20a%20Not%20Sorry%20partnership.`}>
                Enquire about the show <ArrowIcon />
              </a>
            </div>
          </div>
        </section>

        <section className="partnerships section-space" id="partnerships" aria-labelledby="partnerships-title">
          <div className="section-inner">
            <div className="section-intro" data-reveal>
              <div>
                <p className="section-kicker">05 / Partnerships &amp; services</p>
                <h2 className="section-title" id="partnerships-title">
                  Work that earns attention.
                </h2>
              </div>
              <p className="section-intro__copy">
                Thoughtful collaboration, backed by professional credibility and a distinctive public voice.
              </p>
            </div>

            <div className="offer-list">
              <article className="offer-row" data-reveal>
                <span className="offer-row__number">01</span>
                <h3>Brand partnerships</h3>
                <p>Campaigns and creator collaborations across TikTok and Instagram, shaped around a credible fit.</p>
              </article>
              <article className="offer-row" data-reveal>
                <span className="offer-row__number">02</span>
                <h3>Not Sorry collaborations</h3>
                <p>Show partnerships and integrations built for honest conversation with the podcast community.</p>
              </article>
              <article className="offer-row" data-reveal>
                <span className="offer-row__number">03</span>
                <h3>Affiliate &amp; ambassador</h3>
                <p>A longer association for brands that want to be identified with her. Disclosed, and only where the fit is credible.</p>
              </article>
              <article className="offer-row" data-reveal>
                <span className="offer-row__number">04</span>
                <h3>Tender &amp; RFQ compliance</h3>
                <p>Consulting support for businesses preparing clear, compliant tender and RFQ submissions.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="overview section-space" id="overview" aria-labelledby="overview-title">
          <div className="section-inner overview-grid">
            <div data-reveal>
              <p className="section-kicker">06 / Partnership overview</p>
              <h2 className="section-title" id="overview-title">
                A document for the room she is not in.
              </h2>
              <p className="overview-copy">
                Three pages a brand, affiliate or client can forward before they write. Credentials lead. The audience is the proof, not the pitch. Rates stay off the page until there is a brief.
              </p>
              <ol className="overview-contents">
                <li>
                  <span>01</span> Who she is, and who the overview is prepared for
                </li>
                <li>
                  <span>02</span> The case, the room, and the audience
                </li>
                <li>
                  <span>03</span> Not Sorry, affiliate work, and how to brief her
                </li>
              </ol>
            </div>
            <div className="overview-sheet" data-reveal>
              <div className="overview-sheet__page" aria-hidden="true">
                <span>Partnership overview</span>
                <strong>
                  Nomthandazo
                  <em>Nkosi</em>
                </strong>
                <p>Master&apos;s graduate / Businesswoman / Host, Not Sorry</p>
                <i />
              </div>
              <button
                className="button button--brass overview-sheet__download"
                type="button"
                onClick={downloadOverview}
                disabled={pdfState === "working"}
              >
                {pdfState === "working" ? "Preparing PDF" : "Download the PDF"} <DownloadIcon />
              </button>
              <p className="overview-sheet__meta">PDF / 3 pages / For brands, affiliates and clients</p>
            </div>
          </div>
        </section>

        <section className="contact section-space" id="contact" aria-labelledby="contact-title">
          <div className="section-inner contact__inner" data-reveal>
            <div>
              <p className="section-kicker section-kicker--light">07 / Booking &amp; enquiries</p>
              <h2 id="contact-title">Make the introduction.</h2>
              <p className="contact__copy">
                For brand partnerships, affiliate work, podcast collaborations and compliance briefs.
              </p>
            </div>
            <div className="contact__action">
              <a className="button button--brass" href={bookingLink}>
                Email Nomthandazo <ArrowIcon diagonal />
              </a>
              <button
                className="button button--line"
                type="button"
                onClick={downloadOverview}
                disabled={pdfState === "working"}
              >
                {pdfState === "working" ? "Preparing PDF" : "Download overview"} <DownloadIcon />
              </button>
              <a className="contact__email" href={`mailto:${emailAddress}`}>
                {emailAddress}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark wordmark--footer" href="#top" aria-label="Back to top">
          <span className="wordmark__seal" aria-hidden="true">
            NN
          </span>
          <span className="wordmark__name">
            Nomthandazo <strong>Nkosi</strong>
          </span>
        </a>
        <div className="site-footer__links">
          <a href="https://www.tiktok.com/@nomie_nkosi" target="_blank" rel="noreferrer">
            TikTok <ArrowIcon diagonal />
          </a>
          <a href="https://www.instagram.com/nomieland.nkosi/" target="_blank" rel="noreferrer">
            Instagram <ArrowIcon diagonal />
          </a>
          <button type="button" onClick={downloadOverview} disabled={pdfState === "working"}>
            Overview PDF <DownloadIcon />
          </button>
          <span>Johannesburg, South Africa</span>
        </div>
        <span className="site-footer__copyright">© {new Date().getFullYear()} Nomthandazo Nkosi</span>
      </footer>
      <p className={`download-status${pdfState === "idle" ? "" : " is-visible"}`} role="status">
        {pdfState === "working" && "Preparing the overview."}
        {pdfState === "done" && "Overview downloaded."}
        {pdfState === "error" && `The PDF could not be prepared. Email ${emailAddress}.`}
      </p>
    </div>
  );
}

export default App;