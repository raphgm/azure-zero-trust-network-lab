import React, { useState } from "react";

export default function App() {
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "[SYSTEM] Zero Trust Network Lab Environment ready.",
    "[SYSTEM] Select a benchmark command below or type your own."
  ]);
  const [inputCmd, setInputCmd] = useState("");

  const modules = [
    {
      title: "Module 1: Hub-and-Spoke Architecture & Forced Tunneling",
      lessons: [
        {
          title: "VNet Peering & Topology Design",
          content: "Design a Central Hub VNet (10.0.0.0/16) peered to Workload Spokes. Configure forced egress tunneling (0.0.0.0/0) pointing to Azure Firewall private IP (10.0.1.4)."
        },
        {
          title: "User Defined Routes (UDR)",
          content: "Apply route tables to spoke subnets to ensure all east-west and north-south traffic is routed through Azure Firewall for packet inspection."
        }
      ]
    },
    {
      title: "Module 2: Private Link & PaaS Isolation",
      lessons: [
        {
          title: "Private Endpoints & DNS Zones",
          content: "Disable public network access on Azure SQL and Key Vault. Provision Private Endpoints with internal IPs (10.2.2.4) linked to Private DNS Zones."
        },
        {
          title: "Disabling Public Access",
          content: "Enforce Azure Policy to prevent any resource creation with PublicNetworkAccess enabled across subscriptions."
        }
      ]
    },
    {
      title: "Module 3: NSG Micro-segmentation & ASGs",
      lessons: [
        {
          title: "Application Security Groups (ASGs)",
          content: "Group workload VMs into ASGs (AppTier, DatabaseTier) and write declarative NSG rules to block lateral east-west movement."
        },
        {
          title: "Network Security Group Rules",
          content: "Enforce default Deny-All inbound rules with specific allow overrides for encrypted HTTPS (443) and SQL (1433) traffic."
        }
      ]
    }
  ];

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCmd.trim()) return;
    const cmd = inputCmd.trim();
    const newOutput = [...terminalOutput, "$ " + cmd];

    if (cmd.includes("az network route-table")) {
      newOutput.push("NAME                 NEXT_HOP_TYPE      NEXT_HOP_IP");
      newOutput.push("Force-Egress-FW      VirtualAppliance   10.0.1.4");
    } else if (cmd.includes("az sql server show")) {
      newOutput.push("PublicNetworkAccess: Disabled");
      newOutput.push("PrivateEndpointState: Connected (10.2.2.4)");
    } else if (cmd.includes("nslookup")) {
      newOutput.push("Server: 127.0.0.1");
      newOutput.push("Name: sql-zerotrust-prod.privatelink.database.windows.net");
      newOutput.push("Address: 10.2.2.4");
    } else {
      newOutput.push("[OK] Command executed: " + cmd);
    }

    setTerminalOutput(newOutput);
    setInputCmd("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase border border-indigo-500/30">
            Cloud Lab
          </span>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Zero Trust Network Architecture in Azure
          </h1>
        </div>
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Firewalls | Private Link | NSGs
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        <div className="lg:col-span-3 border-r border-slate-800 bg-slate-900/40 p-4 space-y-4 overflow-y-auto">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Syllabus & Modules</h2>
          {modules.map((m, mIdx) => (
            <div key={mIdx} className="space-y-1">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-tight py-1">
                {m.title}
              </div>
              {m.lessons.map((l, lIdx) => {
                const isActive = activeModule === mIdx && activeLesson === lIdx;
                return (
                  <button
                    key={lIdx}
                    onClick={() => { setActiveModule(mIdx); setActiveLesson(lIdx); }}
                    className={"w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all block " + (isActive ? "bg-indigo-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800")}
                  >
                    {l.title}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="lg:col-span-5 border-r border-slate-800 p-6 space-y-6 overflow-y-auto bg-slate-950">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {modules[activeModule].title}
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              {modules[activeModule].lessons[activeLesson].title}
            </h2>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-300 leading-relaxed space-y-3">
            <p>{modules[activeModule].lessons[activeLesson].content}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interactive Command Benchmarks</h3>
            <div className="space-y-2 text-xs">
              <button 
                onClick={() => setInputCmd("az network route-table route list -g rg-zerotrust-lab --route-table-name rt-spoke-to-firewall -o table")}
                className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-mono transition-all"
              >
                1. Inspect Azure Firewall Route Table (UDR)
              </button>
              <button 
                onClick={() => setInputCmd("az sql server show --name sql-zerotrust-prod -g rg-zerotrust-lab --query publicNetworkAccess")}
                className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-mono transition-all"
              >
                2. Check Public Network Access Status (Azure SQL)
              </button>
              <button 
                onClick={() => setInputCmd("nslookup sql-zerotrust-prod.database.windows.net")}
                className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-mono transition-all"
              >
                3. Test Private Endpoint DNS Resolution
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 flex flex-col h-full font-mono text-xs">
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider flex justify-between items-center">
            <span>Cloud Terminal</span>
            <span className="text-emerald-400 font-normal">Connected</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2 text-slate-200">
            {terminalOutput.map((line, i) => (
              <div key={i} className={line.startsWith("$") ? "text-indigo-400 font-bold" : line.startsWith("[SYSTEM]") ? "text-slate-400" : "text-slate-300"}>
                {line}
              </div>
            ))}
          </div>

          <form onSubmit={handleRunCommand} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
            <span className="text-indigo-400 font-bold">$</span>
            <input
              type="text"
              value={inputCmd}
              onChange={(e) => setInputCmd(e.target.value)}
              placeholder="Type command..."
              className="flex-1 bg-transparent text-white outline-none font-mono text-xs"
            />
            <button type="submit" className="bg-indigo-600 text-white font-bold px-3 py-1 rounded hover:bg-indigo-500 transition-colors">
              Run
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
