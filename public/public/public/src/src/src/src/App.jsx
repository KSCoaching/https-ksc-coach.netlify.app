
import React, { useMemo, useState, useEffect } from "react";

/**
 * KSC Coach PWA – MVP
 * Screens:
 *  - Landing (team, age, squad)
 *  - Menu (Season Overview, Game Data Entry, Training Tracker, Training Plan Builder)
 *  - Game Setup (total time + interval incl. custom)
 *  - Choose Stats & Players (stats 3-per-column, horizontal scroll; players vertical list)
 *  - Intervals Grid (X toggles; Goals/Assists numeric; POTM single-select)
 */

const KscLogo = () => (
  <div className="w-10 h-10 bg-white text-black font-bold grid place-items-center rounded-md select-none">
    KSC
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-white/90 text-lg font-semibold tracking-wide mb-2">
    {children}
  </h2>
);

const Button = ({ children, onClick, type = "button", variant = "primary", disabled }) => {
  const base = "px-4 py-3 rounded-2xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition";
  const styles =
    variant === "primary"
      ? "bg-white text-black hover:opacity-90"
      : variant === "ghost"
      ? "bg-transparent text-white/90 hover:text-white border border-white/20"
      : "bg-zinc-800 text-white hover:bg-zinc-700";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
};

const TextInput = ({ label, value, onChange, placeholder }) => (
  <label className="block mb-4">
    <span className="block text-white/80 text-sm mb-1">{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white text-black rounded-2xl px-4 py-3 outline-none"
    />
  </label>
);

const NumberInput = ({ label, value, onChange, placeholder, min = 0 }) => (
  <label className="block mb-4">
    <span className="block text-white/80 text-sm mb-1">{label}</span>
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={min}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
      placeholder={placeholder}
      className="w-full bg-white text-black rounded-2xl px-4 py-3 outline-none"
    />
  </label>
);

const Toggle = ({ checked, onChange, label, left }) => (
  <label className={`flex items-center gap-3 ${left ? "flex-row" : "flex-row-reverse"} cursor-pointer select-none`}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer hidden" />
    <span className="w-6 h-6 rounded-md border border-white/50 grid place-items-center text-xs font-bold text-white/40 peer-checked:text-black peer-checked:bg-white">
      {checked ? "X" : "x"}
    </span>
    {label && <span className="text-white/90 text-sm">{label}</span>}
  </label>
);

const Divider = () => <div className="h-px bg-white/10 my-4" />;

const Header = ({ subtitle }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <KscLogo />
      <div className="text-white">
        <div className="text-base font-semibold">Game Entry Tab</div>
        {subtitle && <div className="text-xs text-white/60">{subtitle}</div>}
      </div>
    </div>
  </div>
);

const useLocalState = (key, initial) => {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
};

/** ---------------- Landing Page ---------------- */
function Landing({ onContinue, team, setTeam, age, setAge, squad, setSquad }) {
  const [newPlayer, setNewPlayer] = useState("");
  const addPlayer = () => {
    const name = newPlayer.trim();
    if (!name) return;
    if (!squad.includes(name)) setSquad([...squad, name]);
    setNewPlayer("");
  };
  const removePlayer = (idx) => setSquad(squad.filter((_, i) => i !== idx));

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <KscLogo />
        <div className="text-white/90 font-semibold">KSC</div>
      </div>
      <h1 className="text-white text-2xl font-bold mb-4">Welcome</h1>
      <TextInput label="Team Name" value={team} onChange={setTeam} placeholder="e.g. KSC" />
      <TextInput label="Age Group" value={age} onChange={setAge} placeholder="e.g. U12 Lionesses" />

      <div className="mb-3 text-white/80 text-sm">Player Name</div>
      <div className="flex gap-2 mb-4">
        <input
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value)}
          className="flex-1 bg-white text-black rounded-2xl px-4 py-3 outline-none"
          placeholder="Add player name"
        />
        <Button onClick={addPlayer}>Add Player</Button>
      </div>

      <div className="bg-black/30 border border-white/10 rounded-2xl max-h-48 overflow-auto">
        {squad.length === 0 ? (
          <div className="p-4 text-white/50 text-sm">No players yet.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {squad.map((p, i) => (
              <li key={p + i} className="flex items-center justify-between p-3">
                <span className="text-white font-semibold">{p}</span>
                <button onClick={() => removePlayer(i)} className="text-white/60 hover:text-white text-xs">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onContinue} disabled={!team || !age}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}

/** ---------------- Menu ---------------- */
function Menu({ onPick, team, age }) {
  const Item = ({ title, onClick }) => (
    <button onClick={onClick} className="w-full md:w-[48%] h-28 bg-white rounded-2xl grid place-items-center text-black font-semibold">
      {title}
    </button>
  );
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <KscLogo />
        <div className="text-white text-sm">
          {age} · {team}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Item title="Season Overview" onClick={() => onPick("overview")} />
        <Item title="Game Data Entry" onClick={() => onPick("game")} />
        <Item title="Training Tracker" onClick={() => onPick("training")} />
        <Item title="Training Plan Builder" onClick={() => onPick("plan")} />
      </div>
    </div>
  );
}

/** ---------------- Placeholder Screens ---------------- */
function SeasonOverview() {
  return <div className="max-w-3xl mx-auto text-white p-4">Season Overview (coming soon)</div>;
}
function TrainingTracker() {
  return <div className="max-w-3xl mx-auto text-white p-4">Training Tracker (coming soon)</div>;
}
function TrainingPlanBuilder() {
  return <div className="max-w-3xl mx-auto text-white p-4">Training Plan Builder (coming soon)</div>;
}

/** ---------------- Game Setup ---------------- */
function GameSetup({ onNext, total, setTotal, interval, setInterval, custom, setCustom, team, age }) {
  const pick = (v) => setInterval(v);
  const showCustom = interval === "custom";
  return (
    <div className="max-w-xl mx-auto">
      <Header subtitle={`${age} · ${team}`} />
      <h1 className="text-white text-xl font-bold mb-4">Game Setup</h1>
      <NumberInput label="Total Game Time (mins)" value={total} onChange={setTotal} placeholder="e.g. 60" min={1} />
      <SectionTitle>Time intervals required</SectionTitle>
      <div className="flex flex-wrap gap-2 mb-3">
        {[10, 15, 30].map((n) => (
          <button
            key={n}
            onClick={() => pick(n)}
            className={`px-4 py-2 rounded-2xl border ${
              interval === n ? "bg-white text-black border-white" : "text-white border-white/30"
            }`}
          >
            {n} mins
          </button>
        ))}
        <button
          onClick={() => pick("custom")}
          className={`px-4 py-2 rounded-2xl border ${
            interval === "custom" ? "bg-white text-black border-white" : "text-white border-white/30"
          }`}
        >
          Custom
        </button>
      </div>
      {showCustom && (
        <NumberInput label="Custom interval (mins)" value={custom} onChange={setCustom} placeholder="e.g. 12" min={1} />
      )}
      <div className="mt-6 flex justify-end">
        <Button onClick={onNext} disabled={!total || (interval === "custom" && !custom)}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}

/** ---------------- Choose Stats & Players ---------------- */
const DEFAULT_STATS = [
  "Goals",
  "Assists",
  "POTM",
  "Yellow Cards",
  "Red Cards",
  "Tackles",
  "Saves",
  "Passes Completed",
  "Clean Sheets",
  "Shots on Target",
  "Key Passes",
  "Dribbles",
];

function ChooseStatsAndPlayers({ team, age, squad, onNext, selectedPlayers, setSelectedPlayers, stats, setStats }) {
  const columns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < stats.all.length; i += 3) cols.push(stats.all.slice(i, i + 3));
    return cols;
  }, [stats.all]);

  const toggleStat = (name) => {
    setStats((s) => ({ ...s, enabled: { ...s.enabled, [name]: !s.enabled[name] } }));
  };

  const togglePlayer = (p) => {
    const next = new Set(selectedPlayers);
    next.has(p) ? next.delete(p) : next.add(p);
    setSelectedPlayers(next);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Header subtitle={`${age} · ${team}`} />
      <div className="text-white/80 text-base leading-tight mb-3">
        <div>Choose stats</div>
        <div>to track</div>
      </div>

      <div className="overflow-auto whitespace-nowrap pb-2 -mx-1 px-1">
        <div className="inline-flex gap-6">
          {columns.map((col, idx) => (
            <div key={idx} className="min-w-[180px]">
              <div className="grid grid-rows-3 gap-3">
                {col.map((name) => (
                  <Toggle key={name} left checked={!!stats.enabled[name]} onChange={() => toggleStat(name)} label={name} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      <SectionTitle>Select players for this game</SectionTitle>
      <div className="max-h-56 overflow-auto rounded-2xl border border-white/10">
        {squad.length === 0 ? (
          <div className="p-4 text-white/50 text-sm">No players in squad.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {squad.map((p) => (
              <li key={p} className="flex items-center justify-between p-3">
                <span className="text-white font-semibold">{p}</span>
                <Toggle checked={selectedPlayers.has(p)} onChange={() => togglePlayer(p)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onNext} disabled={selectedPlayers.size === 0}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}

/** ---------------- Intervals Grid ---------------- */
function IntervalsGrid({ team, age, selectedPlayers, total, intervalLen }) {
  const players = Array.from(selectedPlayers);
  const intLen = Number(intervalLen);
  const totalMins = Number(total);
  const intervals = useMemo(() => {
    if (!intLen || !totalMins) return [];
    const arr = [];
    for (let s = 0; s < totalMins; s += intLen) {
      const e = Math.min(s + intLen, totalMins);
      arr.push([s, e]);
    }
    return arr;
  }, [intLen, totalMins]);

  const [presence, setPresence] = useState(() => {
    const obj = {};
    players.forEach((p) => {
      obj[p] = intervals.map(() => false);
    });
    return obj;
  });
  const [goals, setGoals] = useState(Object.fromEntries(players.map((p) => [p, 0])));
  const [assists, setAssists] = useState(Object.fromEntries(players.map((p) => [p, 0])));
  const [potm, setPotm] = useState("");

  useEffect(() => {
    const obj = {};
    players.forEach((p) => {
      obj[p] = intervals.map(() => false);
    });
    setPresence(obj);
    setGoals(Object.fromEntries(players.map((p) => [p, 0])));
    setAssists(Object.fromEntries(players.map((p) => [p, 0])));
    setPotm("");
  }, [players.length, intervals.length]);

  const togglePresence = (p, i) => {
    setPresence((prev) => ({ ...prev, [p]: prev[p].map((v, idx) => (idx === i ? !v : v)) }));
  };

  return (
    <div className="max-w-full">
      <Header subtitle={`${age} · ${team}`} />
      <h1 className="text-white text-xl font-bold mb-4">Intervals</h1>

      <div className="space-y-2">
        {players.map((p) => (
          <div key={p} className="grid grid-cols-[1fr_auto] items-center gap-4">
            <div className="overflow-auto">
              <div className="min-w-max inline-grid gap-2" style={{ gridTemplateColumns: `repeat(${intervals.length}, minmax(80px,1fr))` }}>
                {intervals.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => togglePresence(p, i)}
                    className="h-10 w-20 rounded-md border border-white/20 grid place-items-center text-sm font-bold text-white/40 hover:text-white/70"
                  >
                    {presence[p]?.[i] ? "X" : "x"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 min-w-[220px]">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="h-10 rounded-md px-3 bg-white text-black"
                value={goals[p] ?? 0}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setGoals({ ...goals, [p]: Number(v || 0) });
                }}
              />
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="h-10 rounded-md px-3 bg-white text-black"
                value={assists[p] ?? 0}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setAssists({ ...assists, [p]: Number(v || 0) });
                }}
              />
              <button
                onClick={() => setPotm(p)}
                className={`h-10 rounded-md border grid place-items-center text-sm font-bold ${
                  potm === p ? "bg-white text-black border-white" : "text-white/40 border-white/20"
                }`}
                title="Player of the Match"
              >
                {potm === p ? "X" : "x"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** ---------------- Root App ---------------- */
export default function App() {
  const [screen, setScreen] = useLocal
