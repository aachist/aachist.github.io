// ИСПРАВЛЕННЫЙ и ДОПОЛНЕННЫЙ app.jsx

const rawText = `ЛЕГЕНДЫ ДОСАННЫ — КНИГА ПЕРВАЯ...`; // Ваш огромный текст остается здесь без изменений. Не копируйте его снова, оставьте как есть.

// Функции-помощники остаются без изменений
function splitIntoSections(text){
  const lines = text.split("\n");
  const sections = [];
  let current = { title: "Введение", content: "" };
  for(let i=0;i<lines.length;i++){
    const line = (lines[i]||"").trim();
    if(!line){ current.content += "\n"; continue; }
    if(/^(ЛЕГЕНДЫ ДОСАННЫ|ДЕТАЛЬНОЕ РУКОВОДСТВО|Обзор|Ключевые темы|Вопросы для самопроверки|Викторина|Глоссарий)/i.test(line)
       || /^(Глава\s*\d+|ГЛАВА\s*\d+|Вопрос:|Часть\s*\d+)/i.test(line)
       || (line === line.toUpperCase() && line.length < 70)){
      if(current.content.trim() || current.title) sections.push(current);
      current = { title: line, content: "" };
    } else {
      current.content += (current.content ? "\n" : "") + (lines[i]||"");
    }
  }
  if(current.content.trim() || current.title) sections.push(current);
  return sections.map((s,i)=> Object.assign({id:i}, s));
}
function splitByQuery(text,q){
  if(!q) return [{text, match:false}];
  const lower = text.toLowerCase(), ql = q.toLowerCase(), res = []; let idx=0;
  while(true){
    const f = lower.indexOf(ql, idx);
    if(f === -1){ res.push({text: text.slice(idx), match:false}); break; }
    if(f > idx) res.push({text: text.slice(idx,f), match:false});
    res.push({text: text.slice(f, f+ql.length), match:true});
    idx = f + ql.length;
  }
  return res;
}
function renderHighlighted(text,q){
  const parts = splitByQuery(text,q);
  return (<div style={{whiteSpace:"pre-wrap"}}>{parts.map((p,i)=> p.match ? <mark key={i} className="px-0">{p.text}</mark> : <span key={i}>{p.text}</span>)}</div>);
}
function extractGlossary(text){
  const res = []; const idx = text.indexOf("Глоссарий");
  if(idx !== -1){
    const tail = text.slice(idx).split("\n");
    for(let i=1;i<tail.length;i++){ const line=(tail[i]||"").trim(); if(!line) continue; const parts=line.split(":"); if(parts.length>=2) res.push({term:parts[0].trim(), def:parts.slice(1).join(":").trim()}); if(res.length>40) break; }
  }
  if(res.length) return res;
  const words = Array.from(new Set(text.match(/\b[А-ЯЁ][а-яёA-ЯЁ]+\b/g) || [])).slice(0,30);
  return words.map(w=>({term:w, def:"(определение уточните)"}));
}

// НОВЫЙ КОМПОНЕНТ ГАЛЕРЕИ С ЗУМОМ
function ImageGalleryWithZoom() {
  const images = [
    { src: "img/engraving_1.png", cap: "Гравюра I", subHtml: "<h4>Гравюра I</h4>" },
    { src: "img/engraving_2.png", cap: "Гравюра II", subHtml: "<h4>Гравюра II</h4>" },
    { src: "img/engraving_3.png", cap: "Гравюра III", subHtml: "<h4>Гравюра III</h4>" },
    { src: "img/engraving_4.png", cap: "Гравюра IV", subHtml: "<h4>Гравюра IV</h4>" },
    { src: "img/engraving_5.png", cap: "Гравюра V", subHtml: "<h4>Гравюра V</h4>" },
    { src: "img/user_photo.jpg", cap: "Фото", subHtml: "<h4>Фото пользователя</h4>" }
  ];

  React.useEffect(() => {
    const galleryContainer = document.getElementById('lightgallery');
    if (galleryContainer) {
      const lg = lightGallery(galleryContainer, {
        plugins: [lgZoom],
        speed: 500,
        licenseKey: '0000-0000-000-0000',
        mousewheel: true,
        download: false
      });
      return () => {
        lg.destroy();
      };
    }
  }, []);

  return (
    <section className="page-card">
        <h2 className="text-lg font-semibold mb-2">Галерея иллюстраций</h2>
        <div id="lightgallery" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((image, index) => (
              <a 
                href={image.src} 
                key={index} 
                className="img-card block cursor-zoom-in"
                data-sub-html={image.subHtml}
              >
                <img 
                  alt={image.cap} 
                  src={image.src} 
                  className="w-full h-auto block" 
                />
                <figcaption className="p-2 text-sm opacity-80">{image.cap}</figcaption>
              </a>
            ))}
        </div>
    </section>
  );
}


// Основной компонент вашего сайта
function LegendsOfDosanna(){
  const [query, setQuery] = React.useState("");
  const [dark, setDark] = React.useState(false);
  const [paperStyle, setPaperStyle] = React.useState(()=> localStorage.getItem('dosanna_paper') || 'light');
  React.useEffect(()=> localStorage.setItem('dosanna_paper', paperStyle), [paperStyle]);

  const sections = React.useMemo(()=> splitIntoSections(rawText), []);
  const [activeId, setActiveId] = React.useState(0);
  const [animateId, setAnimateId] = React.useState(null);
  const [notes, setNotes] = React.useState(()=>{ try{ return JSON.parse(localStorage.getItem("dosanna_notes_final")||"{}"); } catch(e){ return {}; } });
  const [bookmarks, setBookmarks] = React.useState(()=>{ try{ return JSON.parse(localStorage.getItem("dosanna_bmarks_final")||"[]"); } catch(e){ return []; } });
  React.useEffect(()=> localStorage.setItem("dosanna_notes_final", JSON.stringify(notes)), [notes]);
  React.useEffect(()=> localStorage.setItem("dosanna_bmarks_final", JSON.stringify(bookmarks)), [bookmarks]);

  const filtered = React.useMemo(()=>{ if(!query.trim()) return sections; const q = query.toLowerCase(); return sections.filter(s=> s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)); }, [query, sections]);

  function saveNote(id, text){ setNotes(n=> Object.assign({}, n, {[id]: text })); }
  function toggleBookmark(id){ setBookmarks(b => b.includes(id) ? b.filter(x=>x!==id) : [...b, id]); }

  function exportJSON(){ const blob = new Blob([JSON.stringify(notes, null, 2)], {type:"application/json"}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "dosanna_notes.json"; a.click(); }
  function exportCSV(){ let csv = "Section,Note\n"; Object.keys(notes).forEach(id=>{ const title = (sections[id] && sections[id].title) ? sections[id].title.replace(/"/g,'""') : ("Раздел " + id); const body = (notes[id]||"").replace(/"/g,'""').replace(/\n/g,"\\n"); csv += `"${title}","${body}"\n`; }); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8;"})); a.download = "dosanna_notes.csv"; a.click(); }
  function exportMD(){ let md = "# Заметки по «Легендам Досанны»\n\n"; Object.keys(notes).forEach(id=>{ const title = (sections[id] && sections[id].title) ? sections[id].title : ("Раздел " + id); md += `## ${title}\n\n${notes[id]||}\n\n---\n\n`; }); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([md], {type:"text/markdown"})); a.download = "dosanna_notes.md"; a.click(); }

  function speak(text){ if(!window.speechSynthesis){ alert("TTS не поддерживается браузером"); return; } window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text || ""); u.lang = "ru-RU"; window.speechSynthesis.speak(u); }
  function stopSpeak(){ if(window.speechSynthesis) window.speechSynthesis.cancel(); }

  function goTo(id){ setActiveId(id); setAnimateId(id); setTimeout(()=> setAnimateId(null), 700); const el = document.getElementById(`sec-${id}`); if(el) el.scrollIntoView({behavior:"smooth", block:"start"}); }

  return (
    <div className={(paperStyle==="dark"?"paper-dark ":"paper-light ")+(dark ? "bg-neutral-900 text-neutral-100" : "text-neutral-900")}>
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4">
        <header className="col-span-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3">
          <h1 className="text-2xl font-bold drop-shadow">Легенды Досанны — Учебный сайт</h1>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border" onClick={()=> setPaperStyle(paperStyle==="light"?"dark":"light")}>{paperStyle==="light"?"Тёмная бумага":"Светлая бумага"}</button>
            <button className="px-3 py-1 rounded border" onClick={()=> setDark(d=>!d)}>{dark ? "Светлая тема UI" : "Тёмная тема UI"}</button>
            <button className="px-3 py-1 rounded border" onClick={exportJSON}>JSON</button>
            <button className="px-3 py-1 rounded border" onClick={exportCSV}>CSV</button>
            <button className="px-3 py-1 rounded border" onClick={exportMD}>MD</button>
          </div>
        </header>

        <aside className="sidepanel col-span-12 lg:col-span-3 glass rounded p-3 border h-max lg:sticky lg:top-4">
          <div className="mb-3 flex gap-2">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск…" className="w-full px-2 py-1 rounded border" />
          </div>
          <h3 className="font-semibold mb-2">Оглавление</h3>
          <ul className="space-y-1 text-sm max-h-[45vh] overflow-auto pr-1">
            {sections.map((s) => (
              <li key={s.id}>
                <button className={"toc-btn w-full text-left " + (activeId===s.id ? "font-bold" : "")} onClick={() => goTo(s.id)}>
                  {s.title}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <h4 className="font-semibold">Закладки</h4>
            <ul className="text-sm space-y-1 max-h-[25vh] overflow-auto pr-1">
              {bookmarks.length === 0 && <li className="text-xs opacity-60">Нет закладок</li>}
              {bookmarks.map((id) => (
                <li key={id}>
                  <button className="underline" onClick={() => goTo(id)}>
                    {sections[id]?.title || `Раздел ${id}`}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-6 space-y-4">
          {filtered.map((s) => (
            <article key={s.id} id={`sec-${s.id}`}
              className={"page-card " + (animateId===s.id ? "page-enter-active" : "")}>
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold">{s.title}</h2>
                <div className="flex gap-2">
                  <button onClick={() => toggleBookmark(s.id)} className="px-2 py-1 border rounded text-sm">
                    {bookmarks.includes(s.id) ? "Удалить закладку" : "Закладка"}
                  </button>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">{renderHighlighted(s.content, query)}</div>
              <div className="mt-2 border-t pt-2">
                <label className="block text-sm font-medium">Заметки</label>
                <textarea
                  value={notes[s.id] || ""}
                  onChange={(e) => saveNote(s.id, e.target.value)}
                  className="w-full mt-1 p-2 rounded border min-h-[80px] text-sm"
                  placeholder="Ваши заметки по этому разделу…"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => speak(notes[s.id] || "")} className="px-2 py-1 border rounded text-sm">🎙 Читать вслух</button>
                  <button onClick={stopSpeak} className="px-2 py-1 border rounded text-sm">■ Стоп</button>
                </div>
              </div>
            </article>
          ))}
          
          <ImageGalleryWithZoom />

        </main>

        <aside className="col-span-12 lg:col-span-3 glass rounded p-3 border h-max lg:sticky lg:top-4 space-y-4">
          <section>
            <h3 className="font-semibold">Мини‑викторина</h3>
            <Quiz />
          </section>
          <section>
            <h3 className="font-semibold">Глоссарий (быстрый)</h3>
            <Glossary />
          </section>
        </aside>

        <footer className="col-span-12 text-xs opacity-70 py-2">Сайт сгенерирован на основе загруженных файлов. Данные заметок хранятся локально.</footer>
      </div>
    </div>);
}


function Quiz(){
  const [quiz] = React.useState(() => {
    const q = []; const lines = rawText.split("\n");
    for(let i=0;i<lines.length;i++){
      const line = (lines[i]||"").trim();
      if(line.startsWith("Вопрос:")){
        const rest = line.replace(/^Вопрос:\s*/i, "");
        let answer = "";
        if(/Ответ:/i.test(line)) answer = line.split(/Ответ:\s*/i)[1] || "";
        else for(let j=i+1;j<Math.min(i+5, lines.length); j++){ if((lines[j]||"").trim().startsWith("Ответ:")){ answer = (lines[j]||"").trim().replace(/^Ответ:\s*/i, ""); break; } }
        q.push({question: rest, answer});
      }
    }
    return q;
  });
  const [idx, setIdx] = React.useState(0); const [show, setShow] = React.useState(false);
  if(quiz.length === 0) return <p className="text-sm opacity-60">Вопросы не найдены.</p>;
  return (<div className="mt-2"><div className="text-sm font-medium">{quiz[idx].question}</div>{show && <div className="mt-2 p-2 border rounded text-sm bg-white/60">{quiz[idx].answer || "(ответ не найден)"}</div>}<div className="flex gap-2 mt-2"><button onClick={()=>setShow(s=>!s)} className="px-2 py-1 border rounded text-sm">{show?"Скрыть":"Показать ответ"}</button><button onClick={()=>{ setShow(false); setIdx(i => (i+1) % Math.max(quiz.length,1)); }} className="px-2 py-1 border rounded text-sm">Следующий</button></div></div>);
}

function Glossary(){
  const items = React.useMemo(() => extractGlossary(rawText).slice(0,15), []);
  return (<div className="text-sm mt-2 space-y-1">{items.map((g, idx) => (<div key={idx}><div className="font-medium">{g.term}</div><div className="text-xs opacity-80">{g.def}</div></div>))}</div>);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(LegendsOfDosanna));
