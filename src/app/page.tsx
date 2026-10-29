
import Link from "next/link";

const features = [
  {
    number: "01",
    code: "LEARN",
    title: "Practical networking",
    description:
      "Explore networking fundamentals, understand network devices, and develop skills through structured learning.",
  },
  {
    number: "02",
    code: "BUILD",
    title: "Hands-on assignments",
    description:
      "Apply what you learn through administrator-assigned tasks, practical exercises, and technical projects.",
  },
  {
    number: "03",
    code: "GROW",
    title: "Your technical portfolio",
    description:
      "Organize your projects, maintain your resume, and build a record of your professional development.",
  },
];

function NetworkDiagram() {
  return (
    <div className="network-panel technical-corner min-w-0">
      <div className="relative z-10 flex items-center justify-between border-b border-white/15 px-4 py-3 sm:px-5">
        <span className="font-technical text-[9px] tracking-[0.14em] text-[#E7D6C1] sm:text-[10px]">
          NETWORK TOPOLOGY / 001
        </span>
        <span className="flex items-center gap-2 font-technical text-[9px] text-[#E7D6C1]">
          <span className="status-light" />
          SIMULATION
        </span>
      </div>

      <div className="relative z-10 px-2 py-3 sm:px-4">
        <svg
          viewBox="0 0 440 320"
          role="img"
          aria-labelledby="network-title network-description"
          className="block h-auto w-full"
        >
          <title id="network-title">NetForge network topology</title>
          <desc id="network-description">
            A router connects to a central switch, which connects to three
            computers in a simulated local area network.
          </desc>

          <defs>
            <pattern
              id="diagram-grid"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="#FFF9EF" opacity="0.15" />
            </pattern>
          </defs>

          <rect
            x="0"
            y="0"
            width="440"
            height="320"
            fill="url(#diagram-grid)"
          />

          <g className="network-line">
            <path d="M220 76 V112" />
            <path d="M220 164 V195 H86 V224" />
            <path d="M220 195 V224" />
            <path d="M220 195 H354 V224" />
          </g>

          <g>
            <circle className="network-packet" r="3">
              <animateMotion
                dur="2.8s"
                repeatCount="indefinite"
                path="M220 76 V112"
              />
            </circle>
            <circle className="network-packet" r="3">
              <animateMotion
                dur="3.6s"
                repeatCount="indefinite"
                path="M220 164 V195 H86 V224"
              />
            </circle>
            <circle className="network-packet" r="3">
              <animateMotion
                dur="3.1s"
                repeatCount="indefinite"
                path="M220 164 V195 H354 V224"
              />
            </circle>
          </g>

          <g transform="translate(184 26)">
            <rect
              width="72"
              height="50"
              rx="2"
              className="network-node"
            />
            <path
              d="M18 16 H54 M18 24 H54 M18 32 H54"
              stroke="#A95850"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="22" cy="41" r="2" fill="#A95850" />
            <circle cx="32" cy="41" r="2" fill="#A95850" />
          </g>

          <text
            x="220"
            y="17"
            textAnchor="middle"
            fill="#E7D6C1"
            fontSize="9"
            letterSpacing="1.5"
          >
            ROUTER / GW-01
          </text>

          <g transform="translate(177 112)">
            <rect
              width="86"
              height="52"
              rx="2"
              className="network-node"
            />
            {Array.from({ length: 6 }, (_, index) => (
              <g key={index}>
                <rect
                  x={13 + index * 10}
                  y="13"
                  width="6"
                  height="10"
                  fill="#A95850"
                />
                <circle
                  cx={16 + index * 10}
                  cy="35"
                  r="2"
                  fill="#A95850"
                />
              </g>
            ))}
          </g>

          <text
            x="220"
            y="105"
            textAnchor="middle"
            fill="#E7D6C1"
            fontSize="9"
            letterSpacing="1.5"
          >
            SWITCH / SW-01
          </text>

          {[86, 220, 354].map((x, index) => (
            <g key={x} transform={`translate(${x - 28} 224)`}>
              <rect
                width="56"
                height="43"
                rx="2"
                className="network-node"
              />
              <rect
                x="8"
                y="7"
                width="40"
                height="24"
                fill="none"
                stroke="#A95850"
                strokeWidth="1.5"
              />
              <path
                d="M19 36 H37 M28 31 V36"
                fill="none"
                stroke="#A95850"
                strokeWidth="1.5"
              />
              <circle cx="46" cy="35" r="2" fill="#A95850" />
              <text
                x="28"
                y="58"
                textAnchor="middle"
                fill="#E7D6C1"
                fontSize="9"
                letterSpacing="0.7"
              >
                {`PC-0${index + 1}`}
              </text>
            </g>
          ))}

          <text
            x="220"
            y="308"
            textAnchor="middle"
            fill="#B9AA98"
            fontSize="9"
            letterSpacing="1.3"
          >
            LOCAL AREA NETWORK / LAN
          </text>
        </svg>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 px-4 py-3 sm:px-5">
        <span className="font-technical text-[9px] text-[#B9AA98]">
          TOPOLOGY: STAR
        </span>
        <span className="font-technical text-[9px] text-[#B9AA98]">
          PACKET FLOW: DEMO
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="top-navigation">
        <div className="site-shell flex min-h-[76px] items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="NetForge home"
            className="flex shrink-0 items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center border border-[#A95850] font-technical text-sm text-[#A95850]">
              NF
            </span>
            <span className="flex flex-col gap-1">
              <span className="brand text-[23px] leading-none tracking-tight">
                NetForge
              </span>
              <span className="font-technical text-[8px] tracking-[0.12em] text-[#756B61]">
                NETWORKING &amp; IT CLUB
              </span>
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 md:flex"
          >
            <a className="nav-link" href="#about">
              ABOUT
            </a>
            <a className="nav-link" href="#learning">
              LEARNING
            </a>
            <a className="nav-link" href="#access">
              ACCESS
            </a>
          </nav>

          <Link
            className="button-primary min-h-10 px-3 text-[10px] sm:px-4"
            href="/login/member"
          >
            MEMBER LOGIN <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <section className="site-shell grid items-center gap-12 pb-16 pt-14 sm:pb-20 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-24 lg:pt-24">
        <div className="min-w-0">
          <div className="technical-label">
            <span className="status-light" />
            AN ENGINEERING-MINDED LEARNING CLUB
          </div>

          <h1 className="hero-title">
            Build Skills.
            <br />
            <em>Forge Your</em>
            <br />
            Future.
          </h1>

          <p className="hero-copy mt-6">
            A practical space for curious minds to understand networks, solve
            technical challenges, build real projects, and develop skills that
            move beyond the classroom.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="button-primary" href="/login/member">
              ENTER MEMBER SPACE <span aria-hidden="true">↗</span>
            </Link>
            <a className="button-secondary" href="#learning">
              EXPLORE THE CLUB <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#D8CCBA] pt-5">
            <span className="technical-label">
              <span className="text-[#A95850]">01</span> UNDERSTAND
            </span>
            <span className="technical-label">
              <span className="text-[#A95850]">02</span> EXPERIMENT
            </span>
            <span className="technical-label">
              <span className="text-[#A95850]">03</span> BUILD
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <NetworkDiagram />

          <div className="mt-3 flex items-start justify-between gap-3">
            <p className="max-w-xs font-technical text-[9px] leading-5 text-[#756B61]">
              FIG. 001 — A SIMPLE NETWORK, A THOUSAND THINGS TO UNDERSTAND.
            </p>
            <span className="shrink-0 font-technical text-[9px] text-[#756B61]">
              NF / LAB
            </span>
          </div>
        </div>
      </section>

      <section id="about" className="border-y border-[#D8CCBA] bg-[#FFF9EF]/70">
        <div className="site-shell grid gap-6 py-7 sm:grid-cols-3 sm:gap-8">
          <div>
            <p className="eyebrow">THE PURPOSE</p>
            <p className="mt-2 text-sm leading-7 text-[#756B61]">
              Learn by understanding how real systems work, not just by
              memorizing definitions.
            </p>
          </div>
          <div>
            <p className="eyebrow">THE METHOD</p>
            <p className="mt-2 text-sm leading-7 text-[#756B61]">
              Structured courses, practical assignments, troubleshooting, and
              project-based learning.
            </p>
          </div>
          <div>
            <p className="eyebrow">THE OUTCOME</p>
            <p className="mt-2 text-sm leading-7 text-[#756B61]">
              Stronger technical foundations, measurable development, and a
              portfolio of work.
            </p>
          </div>
        </div>
      </section>

      <section id="learning" className="site-shell py-20 sm:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">THE NETFORGE APPROACH / 001–003</p>
            <h2 className="mt-4 max-w-2xl text-3xl leading-tight sm:text-4xl">
              Knowledge is the beginning.
              <br />
              Practice makes it yours.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[#756B61]">
            A focused learning environment designed to help club members turn
            concepts into practical skills and demonstrable work.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="feature-card technical-frame technical-corner p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="font-technical text-xs text-[#A95850]">
                  {feature.number} / {feature.code}
                </span>
                <span
                  aria-hidden="true"
                  className="font-technical text-lg text-[#A95850]"
                >
                  ↗
                </span>
              </div>

              <h3 className="mt-10 text-2xl leading-snug">
                {feature.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#756B61]">
                {feature.description}
              </p>

              <div className="mt-8 border-t border-[#D8CCBA] pt-4">
                <span className="font-technical text-[9px] tracking-[0.12em] text-[#756B61]">
                  NETFORGE / {feature.code}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-shell pb-20">
        <div className="technical-frame technical-corner grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="eyebrow">A WORKSPACE FOR DEVELOPMENT</p>
            <h2 className="mt-4 max-w-xl text-3xl leading-tight sm:text-4xl">
              Every skill has a starting point.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#756B61]">
              The NetForge workspace is designed for administrator-assigned
              learning, assignment submissions, personal projects, and
              progress tracking.
            </p>
          </div>

          <div className="border border-[#D8CCBA] bg-[#F3EBDD] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="font-technical text-[10px] tracking-[0.1em]">
                LEARNING / WORKFLOW
              </span>
              <span className="text-xs text-[#756B61]">NF—001</span>
            </div>

            <div className="mt-6 space-y-5">
              {[
                ["01", "Learn the concept"],
                ["02", "Complete the assignment"],
                ["03", "Build a practical project"],
                ["04", "Review your progress"],
              ].map(([number, label]) => (
                <div key={number} className="flex items-center gap-4">
                  <span className="font-technical text-xs text-[#A95850]">
                    {number}
                  </span>
                  <span className="text-sm">{label}</span>
                  <span className="ml-auto text-[#A95850]">—</span>
                </div>
              ))}
            </div>

            <div className="mt-7 border-t border-[#D8CCBA] pt-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-technical text-[9px] text-[#756B61]">
                  YOUR DEVELOPMENT
                </span>
                <span className="font-technical text-[9px] text-[#756B61]">
                  PERSONALIZED
                </span>
              </div>
              <div className="progress-track mt-3">
                <span />
              </div>
              <p className="mt-3 text-[10px] leading-5 text-[#756B61]">
                Illustrative interface preview. Actual progress will come from
                your account data once the backend is connected.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="access" className="border-y border-[#D8CCBA] bg-[#FFF9EF]/75">
        <div className="site-shell py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">CHOOSE YOUR WORKSPACE</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">
              One club. Two workspaces.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#756B61]">
              Members focus on learning and development. Administrators manage
              the learning experience and monitor progress.
            </p>
          </div>

          <div className="mx-auto mt-9 grid max-w-3xl gap-4 sm:grid-cols-2">
            <article className="technical-frame p-6 sm:p-7">
              <p className="eyebrow">WORKSPACE / MEMBER</p>
              <h3 className="mt-4 text-2xl">Continue learning.</h3>
              <p className="mt-3 text-sm leading-7 text-[#756B61]">
                Access allocated courses, submit assignments, manage your
                portfolio, and review your development.
              </p>
              <Link
                className="button-primary mt-6 w-full"
                href="/login/member"
              >
                MEMBER LOGIN <span aria-hidden="true">↗</span>
              </Link>
            </article>

            <article className="technical-frame p-6 sm:p-7">
              <p className="eyebrow">WORKSPACE / ADMINISTRATOR</p>
              <h3 className="mt-4 text-2xl">Manage the club.</h3>
              <p className="mt-3 text-sm leading-7 text-[#756B61]">
                Organize courses, allocate assignments, evaluate submissions,
                and monitor member progress.
              </p>
              <Link
                className="button-secondary mt-6 w-full"
                href="/login/admin"
              >
                ADMINISTRATOR LOGIN <span aria-hidden="true">↗</span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-shell flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="font-technical text-xs text-[#A95850]">
              NF / 001
            </span>
            <span className="brand text-xl">NetForge</span>
          </div>

          <p className="text-xs text-[#756B61]">
            Build Skills. Forge Your Future.
          </p>

          <p className="font-technical text-[9px] tracking-[0.08em] text-[#756B61]">
            A PRACTICAL NETWORKING &amp; IT CLUB
          </p>
        </div>
      </footer>
    </main>
  );
}
