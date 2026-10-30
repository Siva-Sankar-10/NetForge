
"use client";

import { useEffect, useState } from "react";

type Device = {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "router" | "switch" | "pc" | "server";
};

type Topology = {
  name: string;
  description: string;
  devices: Device[];
  connections: [string, string][];
};

const topologies: Topology[] = [
  {
    name: "STAR",
    description: "Central switch connects all endpoint devices.",
    devices: [
      { id: "R1", x: 220, y: 45, label: "ROUTER", type: "router" },
      { id: "SW1", x: 220, y: 150, label: "SWITCH", type: "switch" },
      { id: "PC1", x: 75, y: 260, label: "PC-01", type: "pc" },
      { id: "PC2", x: 220, y: 260, label: "PC-02", type: "pc" },
      { id: "PC3", x: 365, y: 260, label: "PC-03", type: "pc" },
    ],
    connections: [
      ["R1", "SW1"],
      ["SW1", "PC1"],
      ["SW1", "PC2"],
      ["SW1", "PC3"],
    ],
  },
  {
    name: "MESH",
    description: "Multiple interconnected devices provide alternate paths.",
    devices: [
      { id: "R1", x: 220, y: 45, label: "ROUTER-01", type: "router" },
      { id: "R2", x: 75, y: 145, label: "ROUTER-02", type: "router" },
      { id: "R3", x: 365, y: 145, label: "ROUTER-03", type: "router" },
      { id: "R4", x: 145, y: 265, label: "ROUTER-04", type: "router" },
      { id: "R5", x: 295, y: 265, label: "ROUTER-05", type: "router" },
    ],
    connections: [
      ["R1", "R2"], ["R1", "R3"], ["R2", "R3"],
      ["R2", "R4"], ["R3", "R5"], ["R4", "R5"],
      ["R1", "R4"], ["R1", "R5"],
    ],
  },
  {
    name: "BUS",
    description: "Devices share a common network backbone.",
    devices: [
      { id: "SW1", x: 220, y: 130, label: "BACKBONE", type: "switch" },
      { id: "PC1", x: 65, y: 245, label: "PC-01", type: "pc" },
      { id: "PC2", x: 155, y: 245, label: "PC-02", type: "pc" },
      { id: "PC3", x: 285, y: 245, label: "PC-03", type: "pc" },
      { id: "PC4", x: 375, y: 245, label: "PC-04", type: "pc" },
      { id: "SR1", x: 220, y: 45, label: "SERVER", type: "server" },
    ],
    connections: [
      ["SR1", "SW1"], ["SW1", "PC1"], ["SW1", "PC2"],
      ["SW1", "PC3"], ["SW1", "PC4"],
    ],
  },
  {
    name: "RING",
    description: "Each device connects to two neighbouring devices.",
    devices: [
      { id: "R1", x: 220, y: 45, label: "NODE-01", type: "router" },
      { id: "R2", x: 365, y: 130, label: "NODE-02", type: "switch" },
      { id: "R3", x: 310, y: 260, label: "NODE-03", type: "pc" },
      { id: "R4", x: 130, y: 260, label: "NODE-04", type: "pc" },
      { id: "R5", x: 75, y: 130, label: "NODE-05", type: "switch" },
    ],
    connections: [
      ["R1", "R2"], ["R2", "R3"], ["R3", "R4"],
      ["R4", "R5"], ["R5", "R1"],
    ],
  },
  {
    name: "TREE",
    description: "Hierarchical distribution from core to access devices.",
    devices: [
      { id: "R1", x: 220, y: 40, label: "CORE ROUTER", type: "router" },
      { id: "SW1", x: 115, y: 140, label: "SWITCH-01", type: "switch" },
      { id: "SW2", x: 325, y: 140, label: "SWITCH-02", type: "switch" },
      { id: "PC1", x: 55, y: 265, label: "PC-01", type: "pc" },
      { id: "PC2", x: 165, y: 265, label: "PC-02", type: "pc" },
      { id: "PC3", x: 275, y: 265, label: "PC-03", type: "pc" },
      { id: "PC4", x: 385, y: 265, label: "PC-04", type: "pc" },
    ],
    connections: [
      ["R1", "SW1"], ["R1", "SW2"],
      ["SW1", "PC1"], ["SW1", "PC2"],
      ["SW2", "PC3"], ["SW2", "PC4"],
    ],
  },
  {
    name: "HYBRID",
    description: "A combination of different network structures.",
    devices: [
      { id: "R1", x: 220, y: 40, label: "ROUTER", type: "router" },
      { id: "SW1", x: 115, y: 140, label: "SWITCH-01", type: "switch" },
      { id: "SW2", x: 325, y: 140, label: "SWITCH-02", type: "switch" },
      { id: "PC1", x: 55, y: 260, label: "PC-01", type: "pc" },
      { id: "PC2", x: 165, y: 260, label: "PC-02", type: "pc" },
      { id: "PC3", x: 275, y: 260, label: "PC-03", type: "pc" },
      { id: "SR1", x: 385, y: 260, label: "SERVER", type: "server" },
    ],
    connections: [
      ["R1", "SW1"], ["R1", "SW2"],
      ["SW1", "PC1"], ["SW1", "PC2"],
      ["SW2", "PC3"], ["SW2", "SR1"],
      ["PC2", "PC3"],
    ],
  },
  {
    name: "EXTENDED STAR",
    description: "Multiple star networks connected through a central device.",
    devices: [
      { id: "R1", x: 220, y: 35, label: "ROUTER", type: "router" },
      { id: "SW1", x: 110, y: 130, label: "SWITCH-01", type: "switch" },
      { id: "SW2", x: 330, y: 130, label: "SWITCH-02", type: "switch" },
      { id: "PC1", x: 45, y: 260, label: "PC-01", type: "pc" },
      { id: "PC2", x: 115, y: 260, label: "PC-02", type: "pc" },
      { id: "PC3", x: 325, y: 260, label: "PC-03", type: "pc" },
      { id: "PC4", x: 395, y: 260, label: "PC-04", type: "pc" },
    ],
    connections: [
      ["R1", "SW1"], ["R1", "SW2"],
      ["SW1", "PC1"], ["SW1", "PC2"],
      ["SW2", "PC3"], ["SW2", "PC4"],
    ],
  },
];

const colors = {
  body: "#F3EBDD",
  screen: "#252321",
  stroke: "#E7D6C1",
  detail: "#A95850",
  muted: "#B9AA98",
  packet: "#E9A66B",
};

function DeviceIcon({ device }: { device: Device }) {
  const common = {
    fill: colors.body,
    stroke: colors.stroke,
    strokeWidth: 1.7,
    strokeLinejoin: "round" as const,
  };

  if (device.type === "router") {
    return (
      <g>
        <path d="M-15 -16 L-19 -27 M15 -16 L19 -27" fill="none" stroke={colors.stroke} strokeWidth="2" strokeLinecap="round" />
        <path d="M-23 -27 Q-19 -34 -15 -27 M15 -27 Q19 -34 23 -27" fill="none" stroke={colors.detail} strokeWidth="1.5" />
        <rect x="-27" y="-16" width="54" height="33" rx="6" {...common} />
        <path d="M-15 0 H15 M-8 -6 L-15 0 L-8 6 M8 -6 L15 0 L8 6" fill="none" stroke={colors.detail} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="-19" cy="11" r="2" fill={colors.detail} stroke="none" />
        <circle cx="-11" cy="11" r="2" fill="#78977B" stroke="none" />
      </g>
    );
  }

  if (device.type === "switch") {
    return (
      <g>
        <rect x="-29" y="-18" width="58" height="36" rx="5" {...common} />
        {[-19, -9, 1, 11].map((x) => (
          <g key={x}>
            <rect x={x} y="-7" width="7" height="11" rx="1" fill={colors.screen} stroke={colors.detail} strokeWidth="1" />
            <circle cx={x + 3.5} cy="10" r="1.7" fill="#78977B" stroke="none" />
          </g>
        ))}
        <path d="M-20 -12 H20" stroke={colors.detail} strokeWidth="1.4" />
      </g>
    );
  }

  if (device.type === "pc") {
    return (
      <g>
        <rect x="-20" y="-18" width="40" height="28" rx="3" fill={colors.body} stroke={colors.stroke} strokeWidth="1.7" />
        <rect x="-15" y="-13" width="30" height="18" rx="1.5" fill={colors.screen} stroke={colors.detail} strokeWidth="1.2" />
        <path d="M-7 15 H7 M0 10 V15" fill="none" stroke={colors.stroke} strokeWidth="2" strokeLinecap="round" />
        <path d="M-11 -4 L-5 -9 L1 -4 L7 -9" fill="none" stroke={colors.detail} strokeWidth="1.4" />
        <rect x="-12" y="17" width="24" height="3" rx="1.5" fill={colors.body} stroke={colors.stroke} strokeWidth="1" />
      </g>
    );
  }

  return (
    <g>
      <rect x="-21" y="-25" width="42" height="50" rx="4" {...common} />
      {[-16, -3, 10].map((y) => (
        <g key={y}>
          <rect x="-15" y={y} width="30" height="10" rx="1.5" fill={colors.screen} stroke={colors.detail} strokeWidth="1" />
          <circle cx="10" cy={y + 5} r="1.7" fill="#78977B" stroke="none" />
        </g>
      ))}
      <path d="M-10 -20 H10" stroke={colors.detail} strokeWidth="1.5" />
    </g>
  );
}

export default function NetworkDiagram() {
  const [topologyIndex, setTopologyIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storageKey = "netforge-last-topology";
    const stored = window.localStorage.getItem(storageKey);
    const previous = stored === null ? -1 : Number(stored);

    const choices = topologies
      .map((_, index) => index)
      .filter((index) => index !== previous);

    const next = choices[Math.floor(Math.random() * choices.length)];

    window.localStorage.setItem(storageKey, String(next));
    setTopologyIndex(next);
    setReady(true);
  }, []);

  const topology = topologies[topologyIndex];
  const deviceMap = new Map(topology.devices.map((device) => [device.id, device]));

  return (
    <div className="network-panel technical-corner min-w-0 overflow-hidden">
      <div className="relative z-10 flex items-center justify-between border-b border-white/15 px-4 py-3 sm:px-5">
        <span className="font-technical text-[9px] tracking-[0.14em] text-[#E7D6C1] sm:text-[10px]">
          NETWORK TOPOLOGY / {String(topologyIndex + 1).padStart(3, "0")}
        </span>
        <span className="flex items-center gap-2 font-technical text-[9px] text-[#E7D6C1]">
          <span className="status-light" />
          SIMULATION
        </span>
      </div>

      <div className="relative z-10 px-2 py-3 sm:px-4">
        <svg
          viewBox="0 0 440 330"
          role="img"
          aria-label={`${topology.name} network topology with routers, switches, computers and servers`}
          className={`block h-auto w-full transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
        >
          <defs>
            <pattern id="netforge-grid" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#FFF9EF" opacity="0.18" />
            </pattern>
          </defs>

          <rect width="440" height="330" fill="url(#netforge-grid)" />

          {/* Network cables and moving data packets */}
          {topology.connections.map(([from, to], index) => {
            const a = deviceMap.get(from)!;
            const b = deviceMap.get(to)!;
            const path = `M ${a.x} ${a.y} L ${b.x} ${b.y}`;

            return (
              <g key={`${from}-${to}`}>
                <path
                  d={path}
                  fill="none"
                  stroke="#E7D6C1"
                  strokeWidth="2.4"
                  strokeOpacity="0.55"
                  strokeLinecap="round"
                />
                <path
                  d={path}
                  fill="none"
                  stroke="#A95850"
                  strokeWidth="1"
                  strokeOpacity="0.9"
                  strokeDasharray="5 7"
                />
                <circle r="4.5" fill={colors.packet} stroke="#252321" strokeWidth="1">
                  <animateMotion
                    dur={`${2.4 + (index % 4) * 0.5}s`}
                    begin={`${index * 0.3}s`}
                    repeatCount="indefinite"
                    path={path}
                  />
                </circle>
              </g>
            );
          })}

          {/* Network devices */}
          {topology.devices.map((device, index) => (
            <g key={device.id} transform={`translate(${device.x} ${device.y})`}>
              <circle
                r="37"
                fill="none"
                stroke="#A95850"
                strokeWidth="1.5"
                opacity="0.55"
              >
                <animate
                  attributeName="r"
                  values="31;38;31"
                  dur="3s"
                  begin={`${index * 0.25}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.55;0.08;0.55"
                  dur="3s"
                  begin={`${index * 0.25}s`}
                  repeatCount="indefinite"
                />
              </circle>

              <DeviceIcon device={device} />

              <text
                x="0"
                y="48"
                textAnchor="middle"
                fill="#F3EBDD"
                fontSize="9"
                fontWeight="600"
                letterSpacing="0.7"
                paintOrder="stroke"
                stroke="#252321"
                strokeWidth="3"
                strokeLinejoin="round"
              >
                {device.label}
              </text>
            </g>
          ))}

          <text
            x="220"
            y="320"
            textAnchor="middle"
            fill="#B9AA98"
            fontSize="9"
            letterSpacing="1.3"
          >
            NETFORGE / LIVE PACKET SIMULATION
          </text>
        </svg>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 px-4 py-3 sm:px-5">
        <span className="font-technical text-[9px] text-[#B9AA98]">
          TOPOLOGY: {topology.name}
        </span>
        <span className="font-technical text-[9px] text-[#B9AA98]">
          {topology.devices.length} DEVICES / {topology.connections.length} LINKS
        </span>
      </div>
    </div>
  );
}
