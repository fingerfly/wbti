/**
 * Purpose: Emit 6×4×20 OPTION_QUIPS rows (patterns 10–15) for quizOptionQuips.js.
 * Run: node scripts/gen-quips-p10-p15.mjs
 */
const hooks = [
  '内心OS：',
  '弹幕：',
  '旁白：',
  '剧本：',
  '小声：',
  '字幕：',
  '风险：',
  '体面版：',
  '热血：',
  '摆烂：',
  '阴阳：',
  'KPI脑：',
  'N+1脑：',
  '团建后：',
  '电梯：',
  '食堂：',
  '摄像头：',
  '年假后：',
  '节前：',
  '考核：',
];

const mids = [
  '把跨时区',
  '把复盘会',
  '把团建局',
  '把工位风水',
  '把系统挂了',
  '把站会拖堂',
  '把已读',
  '把边界',
  '把锅',
  '把DDL',
  '把飞书',
  '把周报',
  '把老板视线',
  '把救火',
  '把假笑',
  '把静音',
  '把优先级',
  '把班味',
  '把CPU',
  '把离职信',
];

const ends = [
  '…婉拒了哈。',
  '…截图了。',
  '…在演我。',
  '…班味确诊。',
  '…建议申遗。',
  '…懂的都懂。',
  '…下次还选。',
  '…精神状态很美。',
  '…离谱但合理。',
  '…拿捏了。',
  '…记入小本本。',
  '…这波不亏。',
  '…给我整乐了。',
  '…6。',
  '…鲸了。',
  '…告辞。',
  '…天外一口锅。',
  '…又学到了。',
  '…裂开。',
  '…稳了。',
];

function cellQuips(p, oi) {
  const seen = new Set();
  const out = [];
  let t = 0;
  while (out.length < 20) {
    const h = hooks[(p * 3 + oi + t) % hooks.length];
    const m = mids[(p * 7 + oi * 5 + t * 11) % mids.length];
    const e = ends[(t + p * 13 + oi) % ends.length];
    const s = `${h}${m}${e}`;
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
    t += 1;
    if (t > 5000) throw new Error(`gen fail p=${p} oi=${oi}`);
  }
  return out;
}

function esc(s) {
  return JSON.stringify(s);
}

let buf = '';
for (let p = 10; p < 16; p += 1) {
  buf += '  Object.freeze([\n';
  for (let oi = 0; oi < 4; oi += 1) {
    const lines = cellQuips(p, oi).map((q) => `      ${esc(q)}`).join(',\n');
    buf += '    Object.freeze([\n';
    buf += `${lines},\n`;
    buf += '    ]),\n';
  }
  buf += '  ]),\n';
}
if (process.argv.includes('--verify')) {
  for (let p = 10; p < 16; p += 1) {
    for (let oi = 0; oi < 4; oi += 1) {
      const c = cellQuips(p, oi);
      if (new Set(c).size !== 20) {
        throw new Error(`dup p=${p} oi=${oi}`);
      }
    }
  }
  process.stderr.write('gen-quips-p10-p15: matrix ok\n');
  process.exit(0);
}

process.stdout.write(buf);
