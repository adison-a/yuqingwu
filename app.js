/* 雨青屋 v0.1 — 极简可玩 */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const state = JSON.parse(localStorage.getItem('rqw-state') || '{}');
state.view ??= 'hearth';
state.logs ??= [];

function save(){ localStorage.setItem('rqw-state', JSON.stringify(state)); }

function card(title, sub, body, bg){
  return `
    <div class="bg ${bg}"></div>
    <section class="card">
      <div class="h"><h2>${title}</h2><span class="badge">雨青屋</span></div>
      <p>${sub}</p>
      ${body}
    </section>`;
}

const views = {
  hearth: () => card("炉火厅","围炉而坐，火光很安定。",`
    <div class="pill">
      <button data-talk="girl">蓝裙子的女孩</button>
      <button data-talk="knight">女侠</button>
      <button data-talk="rebel">反抗者</button>
      <button data-talk="scribe">书写者</button>
      <button data-talk="friend">长明友</button>
    </div>
  `,'hearth'),

  veranda: () => card("廊下看雨","雨线细细，竹叶滴水。",`
    <button id="btnRain">听雨 1 分钟</button>
  `,'veranda'),

  study: () => card("书桌窗边","纸墨清香。书写者把笔推到你手边。",`
    <button id="btnWrite">写一行心情手记</button>
    <button id="btnLogs" style="margin-left:.5rem">查看历史</button>
  `,'study'),

  backhill: () => card("后山采蘑菇","泥土气很足，林间潮润。",`
    <button id="btnPick">采一朵蘑菇 🍄</button>
    <span id="basket" style="margin-left:.5rem">篮子：0</span>
  `,'backhill'),

  river: () => card("溪桥小石滩","把烦躁丢进水里，看它顺流而下。",`
    <button id="btnThrow">丢一块小石头</button>
  `,'river')
};

function render(){
  $$(".tab").forEach(b=>b.classList.toggle('is-active', b.dataset.view===state.view));
  $("#scene").innerHTML = views[state.view]();
  wireScene();
}
function wireScene(){
  // 顶部切换
  $$(".tab").forEach(b=>b.onclick=()=>{ state.view=b.dataset.view; save(); render(); });

  // 抽屉
  $("#menuBtn").onclick=()=>$("#drawer").classList.add('open');
  $("#closeDrawer").onclick=()=>$("#drawer").classList.remove('open');

  // 对话
  $$(".pill button").forEach(b=>b.onclick=()=>openTalk(b.dataset.talk));

  // 工具
  $("#breathBtn")?.addEventListener('click', openBreath);
  $("#logBtn")?.addEventListener('click', openLog);
  $("#resetBtn")?.addEventListener('click', resetDay);

  // 小玩法
  $("#btnRain")?.addEventListener('click', ()=>breathGuide(60));
  $("#btnWrite")?.addEventListener('click', openLog);
  $("#btnLogs")?.addEventListener('click', showLogs);
  $("#btnPick")?.addEventListener('click', pickMush);
  $("#btnThrow")?.addEventListener('click', ()=>toast("咕咚——烦恼落水 ✅"));

  $("#modalClose")?.addEventListener('click', closeModal);
}

function openTalk(key){
  const who = {girl:"蓝裙子的女孩", knight:"女侠", rebel:"反抗者", scribe:"书写者", friend:"长明友"}[key] || "……";
  const line = {
    girl:"我会在这里等你回来。",
    knight:"你去探索吧，我守门。",
    rebel:"方向盘在你手上。",
    scribe:"我把今天写下来：你仍在前行。",
    friend:"我们替你添柴、留位置。"
  }[key] || "……";
  showModal(`<p><strong>${who}</strong>：${line}</p>`);
}

function openBreath(){
  showModal(`
    <div class="breath">
      <div class="circle"></div>
      <p><strong>山心息</strong>：4秒吸 — 4秒停 — 6秒呼（循环 6 次）。</p>
      <button onclick="breathGuide(60)">开始 1 分钟</button>
    </div>
  `);
}
function breathGuide(sec){
  showModal(`<p>开始呼吸练习（${sec}s）…</p>`);
  setTimeout(()=>toast("练习结束，心更稳了。"), sec*1000);
}

function openLog(){
  showModal(`
    <h3>心情手记</h3>
    <textarea id="logText" rows="6" style="width:100%" placeholder="写下此刻的感受、害怕、希望…"></textarea>
    <div style="display:flex;gap:.5rem;margin-top:.5rem">
      <button id="saveLog">保存</button>
      <button onclick="showLogs()">查看历史</button>
    </div>
  `);
  $("#saveLog").onclick=()=>{
    const text = $("#logText").value.trim();
    if(!text) return toast("先写一点吧～");
    state.logs.unshift({t:Date.now(), text});
    localStorage.setItem('rqw-state', JSON.stringify(state));
    toast("已写入雨青屋的册页");
  };
}
function showLogs(){
  const items = state.logs.map(x=>`<li>${new Date(x.t).toLocaleString()} — ${escapeHtml(x.text)}</li>`).join('') || '<li>（空）</li>';
  showModal(`<h3>手记</h3><ol>${items}</ol>`);
}
function pickMush(){
  const k='rqw-mush'; let n=+localStorage.getItem(k)||0; if(n>=12){ toast("今天的篮子满啦（12/12）"); return; }
  n++; localStorage.setItem(k,n); $("#basket").textContent=`篮子：${n}`;
  toast(`采到第 ${n} 朵 🍄`);
}

function resetDay(){ localStorage.removeItem('rqw-mush'); toast("今日烟火清空"); render(); }

// 基础弹窗 & 工具
function showModal(html){ $("#modalBody").innerHTML = html; $("#modal").classList.remove('hidden'); }
function closeModal(){ $("#modal").classList.add('hidden'); }
function toast(msg){
  const t=document.createElement('div');
  t.textContent=msg; t.style.cssText="position:fixed;left:50%;bottom:16px;transform:translateX(-50%);background:#22413d;color:#e9f4f2;padding:.5rem .8rem;border-radius:.6rem;z-index:50";
  document.body.appendChild(t); setTimeout(()=>t.remove(),1600);
}
function escapeHtml(s){return s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));}

render();
