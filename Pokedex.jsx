import { useState, useEffect, useCallback, useRef } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const GEN_RANGES = {
  1:[1,151],2:[152,251],3:[252,386],4:[387,493],
  5:[494,649],6:[650,721],7:[722,809],8:[810,905],9:[906,1025],
};
const GENERATIONS = [1,2,3,4,5,6,7,8,9];
const TYPE_COLORS = {
  fire:"#FF4500",water:"#1E90FF",grass:"#3CB371",electric:"#EEC900",
  psychic:"#FF69B4",ice:"#00CED1",dragon:"#7B68EE",dark:"#4a3728",
  fairy:"#FF85C2",normal:"#888",fighting:"#C03028",flying:"#7090C0",
  poison:"#A040A0",ground:"#C8A040",rock:"#B8A038",bug:"#A8B820",
  ghost:"#705898",steel:"#9898B0",
};

// Sprites & cries — loaded as <img>/<audio> src tags, NOT via fetch()
// GitHub raw CDN is always reachable from the artifact iframe
const SP = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const getSprites = (id) => ({
  front:       `${SP}/${id}.png`,
  back:        `${SP}/back/${id}.png`,
  shiny:       `${SP}/shiny/${id}.png`,
  shinyBack:   `${SP}/back/shiny/${id}.png`,
  female:      `${SP}/female/${id}.png`,
  backFemale:  `${SP}/back/female/${id}.png`,
  shinyFemale: `${SP}/shiny/female/${id}.png`,
});
const getCry = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;

const pad = (n) => String(n).padStart(4, "0");

// ─── Anthropic-as-proxy fetch ─────────────────────────────────────────────────
// The artifact sandbox blocks direct fetch to pokeapi.co but CAN reach
// api.anthropic.com. We ask Claude (with web_search tool) to fetch the URL
// and return pure JSON.
const _cache = {};
async function pokeGet(path) {
  const url = `https://pokeapi.co/api/v2${path}`;
  if (_cache[url]) return _cache[url];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content:
          `Use web_search to fetch this URL: ${url}\n` +
          `Return ONLY the raw JSON from that page. No prose, no markdown fences, no explanation. Just the JSON object.`,
      }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const envelope = await res.json();

  const raw = envelope.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Strip accidental ```json fences
  const clean = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  // Find first JSON bracket in case there's leading text
  const start = clean.search(/[[{]/);
  if (start === -1) throw new Error("No JSON in response");
  const json = JSON.parse(clean.slice(start));
  _cache[url] = json;
  return json;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07070f;--surf:#0d0d1c;--surf2:#13132a;--bdr:#1f1f38;
  --red:#e63946;--orange:#f4a261;--text:#dde0f0;--dim:#55557a;
  --glow:rgba(230,57,70,.3);
}
body{background:var(--bg);color:var(--text);font-family:'Exo 2',sans-serif;min-height:100vh}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:3px}

/* LANDING */
.land{position:fixed;inset:0;z-index:1000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--bg);transition:opacity .7s,transform .7s}
.land.bye{opacity:0;transform:scale(1.07);pointer-events:none}
.ball{width:118px;height:118px;border-radius:50%;border:5px solid #ccc;background:linear-gradient(180deg,var(--red) 50%,#ccc 50%);position:relative;margin-bottom:2rem;box-shadow:0 0 50px var(--glow),0 0 100px var(--glow);animation:spin 5s linear infinite,gpulse 2.5s ease-in-out infinite}
.ball::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;background:var(--surf);border:5px solid #ccc;z-index:1}
.ball::after{content:'';position:absolute;top:50%;left:0;right:0;height:5px;background:#ccc;transform:translateY(-50%)}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes gpulse{0%,100%{box-shadow:0 0 50px var(--glow),0 0 100px var(--glow)}50%{box-shadow:0 0 80px var(--glow),0 0 160px var(--glow)}}
.land h1{font-size:clamp(3.5rem,9vw,6.5rem);font-weight:900;letter-spacing:-2px;background:linear-gradient(130deg,var(--red),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-transform:uppercase;line-height:1}
.land p{color:var(--dim);font-size:.9rem;margin:1rem 0 2.8rem;letter-spacing:5px;text-transform:uppercase}
.ebtn{padding:.85rem 3rem;background:transparent;border:2px solid var(--red);color:var(--red);font-family:'Exo 2',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:4px;text-transform:uppercase;cursor:pointer;position:relative;overflow:hidden;transition:color .3s}
.ebtn::before{content:'';position:absolute;inset:0;background:var(--red);transform:translateX(-101%);transition:transform .3s ease}
.ebtn:hover{color:var(--bg)}
.ebtn:hover::before{transform:translateX(0)}
.ebtn span{position:relative;z-index:1}

/* HEADER */
header{position:sticky;top:0;z-index:100;background:rgba(7,7,15,.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--bdr);padding:.85rem 1.5rem;display:flex;align-items:center;gap:.85rem;flex-wrap:wrap}
.logo{font-size:1.5rem;font-weight:900;letter-spacing:-1px;background:linear-gradient(130deg,var(--red),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-transform:uppercase;white-space:nowrap;cursor:pointer;user-select:none}
.sbar{flex:1;min-width:180px;max-width:440px;display:flex;align-items:center;background:var(--surf2);border:1px solid var(--bdr);border-radius:4px;padding:0 .85rem;transition:border-color .2s}
.sbar:focus-within{border-color:var(--red)}
.sbar input{flex:1;background:none;border:none;outline:none;color:var(--text);font-family:'Exo 2',sans-serif;font-size:.9rem;padding:.65rem 0}
.sbar input::placeholder{color:var(--dim)}
.sbar button{background:none;border:none;color:var(--dim);cursor:pointer;font-size:1rem}
.ftabs{display:flex;gap:.35rem;flex-wrap:wrap}
.ftab{padding:.3rem .75rem;border:1px solid var(--bdr);background:transparent;color:var(--dim);font-family:'Exo 2',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border-radius:3px;transition:all .2s}
.ftab.on{border-color:var(--red);color:var(--red);background:rgba(230,57,70,.1)}
.ftab:hover:not(.on){border-color:var(--dim);color:var(--text)}
.hcnt{color:var(--dim);font-size:.68rem;letter-spacing:1px;white-space:nowrap;margin-left:auto}

/* MAIN */
.main{padding:2rem 1.5rem;max-width:1600px;margin:0 auto}
.gsec{margin-bottom:3rem}
.ghd{font-size:.67rem;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:var(--dim);margin-bottom:1.1rem;padding-bottom:.5rem;border-bottom:1px solid var(--bdr);display:flex;align-items:center;gap:1rem}
.ghd em{color:var(--red);font-style:normal;font-size:.95rem}
.ghd span{margin-left:auto;color:var(--bdr)}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:.85rem}

/* CARD */
.pcard{background:var(--surf);border:1px solid var(--bdr);border-radius:8px;padding:.85rem;cursor:pointer;position:relative;overflow:hidden;transition:transform .2s,border-color .2s,box-shadow .2s;display:flex;flex-direction:column;align-items:center;gap:.38rem}
.pcard::after{content:'';position:absolute;inset:0;background:var(--cc,transparent);opacity:.06;transition:opacity .2s;pointer-events:none}
.pcard:hover{transform:translateY(-5px);border-color:var(--cc,var(--red));box-shadow:0 10px 28px rgba(0,0,0,.6)}
.pcard:hover::after{opacity:.15}
.pid{font-size:.62rem;color:var(--dim);letter-spacing:2px;align-self:flex-start;font-weight:600}
.pimg{width:88px;height:88px;image-rendering:pixelated}
.pname{font-size:.82rem;font-weight:700;text-transform:capitalize;text-align:center;letter-spacing:.3px}
.ptypes{display:flex;gap:.27rem;flex-wrap:wrap;justify-content:center}
.tb{font-size:.58rem;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:.15rem .4rem;border-radius:3px;color:#fff}

/* SHIMMER */
.shim{border-radius:8px;height:195px;background:linear-gradient(90deg,var(--surf) 25%,var(--surf2) 50%,var(--surf) 75%);background-size:200% 100%;animation:shim 1.6s infinite}
@keyframes shim{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* STATUS */
.sbar-status{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:var(--surf2);border:1px solid var(--bdr);border-radius:40px;padding:.52rem 1.4rem;font-size:.7rem;letter-spacing:2px;text-transform:uppercase;color:var(--dim);z-index:50;display:flex;align-items:center;gap:.75rem;box-shadow:0 4px 24px rgba(0,0,0,.5);animation:fup .4s ease}
@keyframes fup{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
.sdot{width:7px;height:7px;border-radius:50%;background:var(--red);animation:sdot 1s ease-in-out infinite}
@keyframes sdot{0%,100%{opacity:1}50%{opacity:.25}}

/* MODAL */
.overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:1rem;animation:fdin .2s ease}
@keyframes fdin{from{opacity:0}to{opacity:1}}
.modal{background:var(--surf);border:1px solid var(--bdr);border-radius:12px;width:100%;max-width:700px;max-height:92vh;overflow-y:auto;animation:sup .28s ease}
@keyframes sup{from{transform:translateY(28px);opacity:0}to{transform:translateY(0);opacity:1}}
.mhdr{position:sticky;top:0;z-index:10;background:var(--surf);border-bottom:1px solid var(--bdr);padding:1.1rem 1.4rem;display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
.mtitle{font-size:1.35rem;font-weight:900;text-transform:capitalize;letter-spacing:-.5px}
.mid{font-size:.7rem;color:var(--dim);letter-spacing:3px;margin-bottom:.3rem}
.mnav{display:flex;gap:.4rem;align-items:center;flex-shrink:0}
.nb{padding:.42rem .85rem;background:transparent;border:1px solid var(--bdr);color:var(--text);font-family:'Exo 2',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border-radius:4px;transition:all .2s}
.nb:hover:not(:disabled){border-color:var(--red);color:var(--red)}
.nb:disabled{opacity:.22;cursor:not-allowed}
.nb.clr{border-color:var(--red);color:var(--red)}
.nb.clr:hover{background:var(--red);color:var(--bg)}
.mbody{padding:1.4rem}
.slbl{font-size:.62rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--dim);margin-bottom:.65rem}
.sprrow{display:flex;flex-wrap:wrap;gap:.75rem;margin-bottom:1.4rem}
.sprbox{display:flex;flex-direction:column;align-items:center;gap:.25rem;background:var(--surf2);border:1px solid var(--bdr);border-radius:7px;padding:.7rem;min-width:94px}
.sprbox img{width:74px;height:74px;image-rendering:pixelated}
.sprbox span{font-size:.58rem;color:var(--dim);letter-spacing:.8px;text-transform:uppercase;text-align:center}
.crywrap{margin-bottom:1.4rem}
audio{width:100%;height:34px;filter:invert(1) hue-rotate(180deg);border-radius:4px}
.twocol{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.4rem}
.ibox{background:var(--surf2);border:1px solid var(--bdr);border-radius:7px;padding:1rem}
.irow{display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:.32rem}
.irow:last-child{margin-bottom:0}
.irow .k{color:var(--dim)}
.irow .v{font-weight:600;text-transform:capitalize}
.srow{display:flex;align-items:center;gap:.7rem;margin-bottom:.4rem}
.srow:last-child{margin-bottom:0}
.sn{font-size:.66rem;color:var(--dim);width:76px;flex-shrink:0;text-transform:capitalize}
.sbg{flex:1;height:4px;background:var(--bdr);border-radius:2px;overflow:hidden}
.sbar3{height:100%;border-radius:2px;transition:width .6s ease}
.sv{font-size:.7rem;font-weight:700;width:25px;text-align:right}
.pillsec{margin-bottom:1.4rem}
.pills{display:flex;flex-wrap:wrap;gap:.32rem;margin-top:.5rem}
.pill{padding:.24rem .62rem;border:1px solid var(--bdr);border-radius:20px;font-size:.66rem;font-weight:600;text-transform:capitalize;color:var(--dim)}
.pill.ha{border-color:var(--red);color:var(--red)}
.loading-msg{color:var(--dim);font-size:.78rem;letter-spacing:2px;text-align:center;padding:2rem 0}
.empty{text-align:center;padding:4rem 2rem;color:var(--dim)}
.empty h3{font-size:1.4rem;color:var(--text);margin-bottom:.5rem}
@media(max-width:600px){.twocol{grid-template-columns:1fr}header{padding:.75rem 1rem}.main{padding:1rem}}
`;

// ─── Small components ─────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  return <span className="tb" style={{ background: TYPE_COLORS[type] || "#555" }}>{type}</span>;
}

function SpriteBox({ src, label }) {
  const [ok, setOk] = useState(true);
  if (!src || !ok) return null;
  return (
    <div className="sprbox">
      <img src={src} alt={label} onError={() => setOk(false)} />
      <span>{label}</span>
    </div>
  );
}

function StatRow({ name, value }) {
  const pct = Math.min(100, Math.round((value / 255) * 100));
  const col = value >= 100 ? "#3CB371" : value >= 60 ? "#EEC900" : "#e63946";
  return (
    <div className="srow">
      <span className="sn">{name.replace("special-", "sp.")}</span>
      <div className="sbg"><div className="sbar3" style={{ width: pct + "%", background: col }} /></div>
      <span className="sv">{value}</span>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ idx, list, onNav, onClose }) {
  const pk = list[idx];
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    setDetail(null);
    setLoading(true);
    pokeGet(`/pokemon/${pk.id}`)
      .then((d) => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [pk.id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.load();
  }, [pk.id]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft")  onNav(-1);
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onNav, onClose]);

  const sp = getSprites(pk.id);
  const genNum = GENERATIONS.find(g => pk.id >= GEN_RANGES[g][0] && pk.id <= GEN_RANGES[g][1]) || "?";

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mhdr">
          <div>
            <div className="mid">#{pad(pk.id)}</div>
            <div className="mtitle">{pk.name}</div>
            <div className="ptypes" style={{ display:"flex", gap:".3rem", marginTop:".35rem" }}>
              {pk.types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
          <div className="mnav">
            <button className="nb" disabled={idx <= 0} onClick={() => onNav(-1)}>← Prev</button>
            <button className="nb" disabled={idx >= list.length - 1} onClick={() => onNav(1)}>Next →</button>
            <button className="nb clr" onClick={onClose}>Clear</button>
          </div>
        </div>

        <div className="mbody">
          {/* Sprites — loaded directly as <img> tags, bypasses sandbox restriction */}
          <div className="slbl">Sprites</div>
          <div className="sprrow">
            <SpriteBox src={sp.front}       label="Front" />
            <SpriteBox src={sp.back}        label="Back" />
            <SpriteBox src={sp.shiny}       label="Shiny" />
            <SpriteBox src={sp.shinyBack}   label="Shiny Back" />
            <SpriteBox src={sp.female}      label="♀ Female" />
            <SpriteBox src={sp.backFemale}  label="♀ Back" />
            <SpriteBox src={sp.shinyFemale} label="♀ Shiny" />
          </div>

          {/* Cry — loaded as <audio> src, also bypasses restriction */}
          <div className="crywrap">
            <div className="slbl">Pokémon Cry</div>
            <audio ref={audioRef} controls key={pk.id}>
              <source src={getCry(pk.id)} type="audio/ogg" />
            </audio>
          </div>

          {loading && <div className="loading-msg">FETCHING DATA VIA CLAUDE PROXY…</div>}

          {detail && (
            <>
              <div className="twocol">
                <div className="ibox">
                  <div className="slbl">Base Stats · BST {detail.stats.reduce((a,s)=>a+s.base_stat,0)}</div>
                  {detail.stats.map(s => (
                    <StatRow key={s.stat.name} name={s.stat.name} value={s.base_stat} />
                  ))}
                </div>
                <div className="ibox">
                  <div className="slbl">Info</div>
                  <div className="irow"><span className="k">Generation</span><span className="v">{genNum}</span></div>
                  <div className="irow"><span className="k">Height</span><span className="v">{(detail.height/10).toFixed(1)} m</span></div>
                  <div className="irow"><span className="k">Weight</span><span className="v">{(detail.weight/10).toFixed(1)} kg</span></div>
                  <div className="irow"><span className="k">Base Exp</span><span className="v">{detail.base_experience ?? "—"}</span></div>
                  <div className="irow"><span className="k">Species</span><span className="v">{detail.species?.name ?? "—"}</span></div>
                </div>
              </div>

              <div className="pillsec">
                <div className="slbl">Abilities</div>
                <div className="pills">
                  {detail.abilities.map(a => (
                    <span key={a.ability.name} className={`pill${a.is_hidden?" ha":""}`}>
                      {a.ability.name}{a.is_hidden ? " ★" : ""}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pillsec">
                <div className="slbl">Moves (first 30)</div>
                <div className="pills">
                  {detail.moves.slice(0,30).map(m => (
                    <span key={m.move.name} className="pill">{m.move.name}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function PCard({ p, onClick }) {
  const cc = TYPE_COLORS[p.types[0]] || "#e63946";
  return (
    <div className="pcard" style={{ "--cc": cc }} onClick={() => onClick(p)}>
      <span className="pid">#{pad(p.id)}</span>
      <img className="pimg" src={getSprites(p.id).front} alt={p.name} loading="lazy" />
      <span className="pname">{p.name}</span>
      <div className="ptypes">{p.types.map(t => <TypeBadge key={t} type={t} />)}</div>
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────
function Landing({ onEnter }) {
  const [bye, setBye] = useState(false);
  const go = () => { setBye(true); setTimeout(onEnter, 720); };
  return (
    <div className={`land${bye?" bye":""}`}>
      <div className="ball" />
      <h1>Pokédex</h1>
      <p>All Generations · All Data</p>
      <button className="ebtn" onClick={go}><span>Enter</span></button>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase]     = useState("land");
  const [pokemon, setPokemon] = useState([]);
  const [genDone, setGenDone] = useState({});
  const [query, setQuery]     = useState("");
  const [filter, setFilter]   = useState("name");
  const [modalIdx, setModalIdx] = useState(null);
  const [status, setStatus]   = useState("");

  // Load all gens progressively — each pokemon entry fetched through Anthropic proxy
  const loadAll = useCallback(async () => {
    for (const gen of GENERATIONS) {
      const [min, max] = GEN_RANGES[gen];
      setStatus(`Loading Generation ${gen}…`);
      const BATCH = 10;
      const ids = Array.from({ length: max - min + 1 }, (_, i) => min + i);

      for (let i = 0; i < ids.length; i += BATCH) {
        const slice = ids.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          slice.map(id => pokeGet(`/pokemon/${id}`))
        );
        const entries = results.map((r, j) => {
          if (r.status === "fulfilled") {
            const d = r.value;
            return {
              id: d.id,
              name: d.name,
              types: d.types.map(t => t.type.name),
              abilities: d.abilities.map(a => a.ability.name),
              moves: d.moves.slice(0, 20).map(m => m.move.name),
              gen,
            };
          }
          return { id: slice[j], name: `pokemon-${slice[j]}`, types: [], abilities: [], moves: [], gen };
        });

        setPokemon(prev => {
          const have = new Set(prev.map(p => p.id));
          return [...prev, ...entries.filter(e => !have.has(e.id))].sort((a,b)=>a.id-b.id);
        });
      }
      setGenDone(prev => ({ ...prev, [gen]: true }));
    }
    setStatus("");
  }, []);

  const handleEnter = () => { setPhase("app"); loadAll(); };

  // Filtered list
  const filtered = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return pokemon;
    if (filter === "name")    return pokemon.filter(p => p.name.includes(q));
    if (filter === "id")      return pokemon.filter(p => String(p.id).includes(q));
    if (filter === "ability") return pokemon.filter(p => p.abilities.some(a => a.includes(q)));
    if (filter === "move")    return pokemon.filter(p => p.moves.some(m => m.includes(q)));
    return pokemon;
  })();

  const byGen = GENERATIONS.map(g => ({
    gen: g,
    list: filtered.filter(p => p.gen === g),
    done: !!genDone[g],
  }));

  const navModal = useCallback((dir) => {
    setModalIdx(prev => {
      const next = prev + dir;
      return next < 0 || next >= filtered.length ? prev : next;
    });
  }, [filtered.length]);

  return (
    <>
      <style>{css}</style>
      {phase === "land" && <Landing onEnter={handleEnter} />}

      {phase === "app" && (
        <>
          <header>
            <div className="logo" onClick={() => setQuery("")}>PkDx</div>
            <div className="sbar">
              <span style={{ color:"var(--dim)", marginRight:".4rem", fontSize:"1.1rem" }}>⌕</span>
              <input
                type="text"
                placeholder={`Search by ${filter}…`}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && <button onClick={() => setQuery("")}>✕</button>}
            </div>
            <div className="ftabs">
              {["name","id","ability","move"].map(f => (
                <button key={f} className={`ftab${filter===f?" on":""}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <span className="hcnt">{pokemon.length} / 1025</span>
          </header>

          <div className="main">
            {filtered.length === 0 && query && (
              <div className="empty"><h3>No results</h3><p>Try a different {filter}</p></div>
            )}
            {byGen.map(({ gen, list, done }) => {
              if (list.length === 0 && done) return null;
              return (
                <div key={gen} className="gsec">
                  <div className="ghd">
                    <em>G{gen}</em>
                    Generation {gen}
                    <span>{list.length} shown</span>
                  </div>
                  <div className="pgrid">
                    {list.map(p => (
                      <PCard key={p.id} p={p} onClick={(pk) => {
                        setModalIdx(filtered.findIndex(x => x.id === pk.id));
                      }} />
                    ))}
                    {!done && Array.from({ length: 6 }).map((_,i) => <div key={i} className="shim" />)}
                  </div>
                </div>
              );
            })}
          </div>

          {status && (
            <div className="sbar-status">
              <div className="sdot" />
              {status}
            </div>
          )}

          {modalIdx !== null && (
            <Modal
              idx={modalIdx}
              list={filtered}
              onNav={navModal}
              onClose={() => setModalIdx(null)}
            />
          )}
        </>
      )}
    </>
  );
}
