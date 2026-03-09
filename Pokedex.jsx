import { useState, useEffect, useCallback, useRef } from "react";

// Gen splitter  with range
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
