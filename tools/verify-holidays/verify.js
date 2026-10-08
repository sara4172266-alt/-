// Compares the dashboard's holiday calendar (index.html) with Hebcal's
// official engine (@hebcal/core, Israel schedule) for every day in range.
// Usage: cd tools/verify-holidays && npm install && node verify.js
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "../../index.html"), "utf8");
const cut = (a, b) => src.slice(src.indexOf(a), src.indexOf(b));
const code = `const pad=(n)=>String(n).padStart(2,"0");
const isoDate=(d)=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const addDays=(iso,n)=>{const [y,m,d]=iso.split("-").map(Number);return isoDate(new Date(y,m-1,d+n));};
const dow=(iso)=>{const [y,m,d]=iso.split("-").map(Number);return new Date(y,m-1,d).getDay();};
${cut("  const GEM = ", "  let hebFmt = null;")}${cut("  // ---------- Jewish holidays ----------", "  const isRest =")}
return holidays;`;
const holidays = new Function(code)();
const { HebrewCalendar } = require('@hebcal/core');
const pad=(n)=>String(n).padStart(2,"0");
const iso=(d)=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const OURS={"ראש השנה":"RH","ערב ראש השנה":"EREV_RH","צום גדליה":"GEDALIAH","ערב יום כיפור":"EREV_YK","יום כיפור":"YK","ערב סוכות":"EREV_SUKKOT","סוכות":"SUKKOT1","חול המועד סוכות":"SUKKOT_CHM","הושענא רבה":"HOSHANA","שמחת תורה":"SHMINI","עשרה בטבת":"TEVET10","ט״ו בשבט":"TUBISHVAT","תענית אסתר":"ESTHER","פורים":"PURIM","שושן פורים":"SHUSHAN","ערב פסח":"EREV_PESACH","פסח":"PESACH1","חול המועד פסח":"PESACH_CHM","שביעי של פסח":"PESACH7","ל״ג בעומר":"LAG","ערב שבועות":"EREV_SHAVUOT","שבועות":"SHAVUOT","י״ז בתמוז":"TAMUZ17","תשעה באב":"AV9","ראש חודש":"RC","ערב חנוכה":"EREV_CHANUKAH","פורים קטן":"PURIM_KATAN","שושן פורים קטן":"SHUSHAN_KATAN","ערב פורים":"EREV_PURIM","תענית בכורות":"BECHOROT","פסח שני":"PESACH2","ערב תשעה באב":"EREV_AV9","ט״ו באב":"TUBAV"};
function hebKey(desc){
  let m;
  if(/^Rosh Hashana( \d+| II)$/.test(desc)) return "RH";
  const M={"Erev Rosh Hashana":"EREV_RH","Tzom Gedaliah":"GEDALIAH","Erev Yom Kippur":"EREV_YK","Yom Kippur":"YK","Erev Sukkot":"EREV_SUKKOT","Sukkot I":"SUKKOT1","Sukkot VII (Hoshana Raba)":"HOSHANA","Shmini Atzeret":"SHMINI","Asara B'Tevet":"TEVET10","Tu BiShvat":"TUBISHVAT","Ta'anit Esther":"ESTHER","Purim":"PURIM","Shushan Purim":"SHUSHAN","Erev Pesach":"EREV_PESACH","Pesach I":"PESACH1","Pesach VII":"PESACH7","Lag BaOmer":"LAG","Erev Shavuot":"EREV_SHAVUOT","Shavuot":"SHAVUOT","Tzom Tammuz":"TAMUZ17","Tish'a B'Av":"AV9","Tish'a B'Av (observed)":"AV9","Erev Purim":"EREV_PURIM","Ta'anit Bechorot":"BECHOROT","Pesach Sheni":"PESACH2","Erev Tish'a B'Av":"EREV_AV9","Tu B'Av":"TUBAV","Purim Katan":"PURIM_KATAN","Shushan Purim Katan":"SHUSHAN_KATAN","Chanukah: 1 Candle":"EREV_CHANUKAH","Chanukah: 8th Day":"CHANUKAH_DAY8"};
  if(M[desc]) return M[desc];
  if(/^Sukkot (II|III|IV|V|VI) \(CH''M\)$/.test(desc)) return "SUKKOT_CHM";
  if(/^Pesach (II|III|IV|V|VI) \(CH''M\)$/.test(desc)) return "PESACH_CHM";
  if(/^Rosh Chodesh /.test(desc)) return "RC";
  if((m=desc.match(/^Chanukah: (\d) Candles$/))) return "CHANUKAH_DAY"+(Number(m[1])-1);
  return null;
}
const start=new Date(2025,8,1), end=new Date(2040,11,31);
const ev=HebrewCalendar.calendar({start,end,il:true,noModern:true,noSpecialShabbat:true,shabbatMevarchim:false,candlelighting:false,sedrot:false,omer:false,dailyLearning:{}});
const theirs=new Map(), extras=new Map();
for(const e of ev){ const d=iso(e.getDate().greg()); const desc=e.getDesc(); const k=hebKey(desc);
  if(k){ if(!theirs.has(d)) theirs.set(d,new Set()); theirs.get(d).add(k); }
  else { extras.set(desc.replace(/ \d{4}$/,""), (extras.get(desc.replace(/ \d{4}$/,""))||0)+1); } }
let mism=0, checked=0, counts={};
for(let d=new Date(start); d<=end; d.setDate(d.getDate()+1)){
  const s=iso(d); checked++;
  const ours=new Set(holidays(s).map(h=>{ const m=h.name.match(/^חנוכה · יום (\d)$/); return m ? "CHANUKAH_DAY"+m[1] : OURS[h.name]||("??"+h.name); }));
  const th=theirs.get(s)||new Set();
  ours.forEach(k=>counts[k]=(counts[k]||0)+1);
  const a=[...ours].filter(k=>!th.has(k)), b=[...th].filter(k=>!ours.has(k));
  if(a.length||b.length){ mism++; if(mism<=40) console.log("MISMATCH",s,"ours-only:",a.join(","),"| hebcal-only:",b.join(",")); }
}
console.log("days checked:",checked,"mismatches:",mism);
console.log("our holiday-day counts:",JSON.stringify(counts));
console.log("hebcal events we do not show:",JSON.stringify([...extras].sort((x,y)=>y[1]-x[1])));
process.exitCode = mism ? 1 : 0;
