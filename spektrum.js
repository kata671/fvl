const I18N={
pl:{nav_gen:"Generator →",nav_kalk:"Kalkulator →",nav_home:"← Strona główna",title:"Live Spectrum Lab",sub:"Mikrofon → FFT na żywo → częstotliwość dominantna, harmoniczne i most do kalkulatora oraz generatora FAEM.",panel_spec:"Spektrum",panel_read:"Odczyt",panel_bridge:"Most FAEM",btn_start:"Start mikrofonu",btn_stop:"Stop",btn_freeze:"Zamroź",btn_unfreeze:"Odmroź",btn_tone:"Test 440 Hz",lbl_level:"Poziom wejścia",sec_fft:"Parametry FFT",lbl_fft:"Rozmiar FFT",lbl_smooth:"Wygładzanie",hint_f0:"Częstotliwość szczytowa",lbl_note:"Nota",hint_note:"Najbliższy ton",lbl_cent:"Odstrojenie",hint_cent:"Od nuty",hint_rms:"Poziom",sec_harm:"Harmoniczne / piki",bridge_p:"Użyj f0 w kalkulatorze albo generatorze z N z bogactwa spektrum.",link_calc:"Kalkulator",link_gen:"Generator FAEM",sec_est:"Szacunek złożoności",lbl_peaks:"Piki",note_t:"Uwaga.",note_p:"Nie certyfikowany analizator — f0 to punkt startowy do FAEM.",st_idle:"idle",st_live:"LIVE",st_frozen:"frozen",st_tone:"tone test",err_mic:"Brak dostępu do mikrofonu (HTTPS + uprawnienia).",err_secure:"Wymagany HTTPS lub localhost.",btn_log:"⬇ Log CSV",btn_log_clear:"Wyczyść log",log_samples:"próbek"},
en:{nav_gen:"Generator →",nav_kalk:"Calculator →",nav_home:"← Home",title:"Live Spectrum Lab",sub:"Microphone → live FFT → dominant frequency, harmonics, and a bridge to the calculator and FAEM generator.",panel_spec:"Spectrum",panel_read:"Readout",panel_bridge:"FAEM bridge",btn_start:"Start mic",btn_stop:"Stop",btn_freeze:"Freeze",btn_unfreeze:"Unfreeze",btn_tone:"Test 440 Hz",lbl_level:"Input level",sec_fft:"FFT settings",lbl_fft:"FFT size",lbl_smooth:"Smoothing",hint_f0:"Peak frequency",lbl_note:"Note",hint_note:"Nearest pitch",lbl_cent:"Detune",hint_cent:"From note",hint_rms:"Level",sec_harm:"Harmonics / peaks",bridge_p:"Use f0 in the calculator or generator with N from spectral richness.",link_calc:"Calculator",link_gen:"FAEM generator",sec_est:"Complexity estimate",lbl_peaks:"Peaks",note_t:"Note.",note_p:"Not a calibrated analyser — treat f0 as a starting point for FAEM.",st_idle:"idle",st_live:"LIVE",st_frozen:"frozen",st_tone:"tone test",err_mic:"Microphone access denied (HTTPS + permissions).",err_secure:"HTTPS or localhost required.",btn_log:"⬇ Log CSV",btn_log_clear:"Clear log",log_samples:"samples"}
};
let lang=localStorage.getItem('faem_lang')||'pl';
function t(k){return (I18N[lang]||I18N.pl)[k]||k}
function setLang(l){
  lang=l;localStorage.setItem('faem_lang',l);
  const pl=document.getElementById('btnPL'),en=document.getElementById('btnEN');
  if(pl)pl.classList.toggle('active',l==='pl');
  if(en)en.classList.toggle('active',l==='en');
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.getAttribute('data-i18n'))});
  updateStatusLabel();
  const sp=document.querySelector('#btnMic span');
  if(sp)sp.textContent=running?t('btn_stop'):t('btn_start');
  const fr=document.getElementById('btnFreeze');
  if(fr)fr.textContent=frozen?t('btn_unfreeze'):t('btn_freeze');
}
window.setLang=setLang;

const NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function freqToNote(f){
  if(f<=0||!isFinite(f))return{name:'—',cents:0};
  const n=69+12*Math.log2(f/440);
  const nr=Math.round(n);
  return{name:NOTES[(nr%12+12)%12]+Math.floor(nr/12-1),cents:Math.round((n-nr)*100)};
}

let audioCtx=null,analyser=null,source=null,stream=null,raf=null;
let running=false,frozen=false,toneOsc=null,toneGain=null,freqData=null,timeData=null,wfOff=null;

const cvs=document.getElementById('spectrum');
const ctx=cvs.getContext('2d');
const wf=document.getElementById('waterfall');
const wctx=wf.getContext('2d');

function fftSizeVal(){return 1<<(+document.getElementById('fftSize').value)}
function smoothVal(){return(+document.getElementById('smoothing').value)/100}

document.getElementById('fftSize').addEventListener('input',()=>{
  document.getElementById('fftLbl').textContent=String(fftSizeVal());
  if(analyser){analyser.fftSize=fftSizeVal();freqData=new Uint8Array(analyser.frequencyBinCount);timeData=new Uint8Array(analyser.fftSize)}
});
document.getElementById('smoothing').addEventListener('input',()=>{
  document.getElementById('smLbl').textContent=smoothVal().toFixed(2);
  if(analyser)analyser.smoothingTimeConstant=smoothVal();
});

function showErr(m){const e=document.getElementById('errBox');e.textContent=m||'';e.classList.toggle('show',!!m)}
function updateStatusLabel(){
  const d=document.getElementById('statusDot'),x=document.getElementById('statusTxt');
  if(toneOsc){d.className='status-dot live';x.textContent=t('st_tone')}
  else if(frozen){d.className='status-dot';x.textContent=t('st_frozen')}
  else if(running){d.className='status-dot live';x.textContent=t('st_live')}
  else{d.className='status-dot';x.textContent=t('st_idle')}
}

async function startMic(){
  showErr('');
  if(!window.isSecureContext){showErr(t('err_secure'));return}
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
    audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended')await audioCtx.resume();
    analyser=audioCtx.createAnalyser();
    analyser.fftSize=fftSizeVal();
    analyser.smoothingTimeConstant=smoothVal();
    analyser.minDecibels=-90;analyser.maxDecibels=-10;
    source=audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    freqData=new Uint8Array(analyser.frequencyBinCount);
    timeData=new Uint8Array(analyser.fftSize);
    running=true;frozen=false;
    document.getElementById('btnMic').classList.add('recording');
    document.querySelector('#btnMic span').textContent=t('btn_stop');
    document.getElementById('btnFreeze').disabled=false;
    updateStatusLabel();
    loop();
  }catch(e){console.warn(e);showErr(t('err_mic'))}
}
function stopMic(){
  running=false;frozen=false;
  if(raf)cancelAnimationFrame(raf);raf=null;
  if(source){try{source.disconnect()}catch(_){}}source=null;
  if(stream){stream.getTracks().forEach(tr=>tr.stop());stream=null}
  document.getElementById('btnMic').classList.remove('recording');
  document.querySelector('#btnMic span').textContent=t('btn_start');
  document.getElementById('btnFreeze').disabled=true;
  document.getElementById('btnFreeze').textContent=t('btn_freeze');
  updateStatusLabel();
}
document.getElementById('btnMic').addEventListener('click',()=>{if(running)stopMic();else startMic()});
document.getElementById('btnFreeze').addEventListener('click',()=>{
  if(!running)return;frozen=!frozen;
  document.getElementById('btnFreeze').textContent=frozen?t('btn_unfreeze'):t('btn_freeze');
  updateStatusLabel();if(!frozen)loop();
});
function stopTone(){if(toneOsc){try{toneOsc.stop()}catch(_){}}toneOsc=null;if(toneGain){try{toneGain.disconnect()}catch(_){}}toneGain=null}
document.getElementById('btnTone').addEventListener('click',async()=>{
  audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended')await audioCtx.resume();
  if(toneOsc){stopTone();updateStatusLabel();return}
  if(!analyser){
    analyser=audioCtx.createAnalyser();
    analyser.fftSize=fftSizeVal();analyser.smoothingTimeConstant=smoothVal();
    analyser.minDecibels=-90;analyser.maxDecibels=-10;
    freqData=new Uint8Array(analyser.frequencyBinCount);timeData=new Uint8Array(analyser.fftSize);
  }
  toneGain=audioCtx.createGain();toneGain.gain.value=0.08;
  toneOsc=audioCtx.createOscillator();toneOsc.type='sine';toneOsc.frequency.value=440;
  toneOsc.connect(toneGain);toneGain.connect(analyser);toneGain.connect(audioCtx.destination);
  toneOsc.start();running=true;frozen=false;
  document.getElementById('btnFreeze').disabled=false;updateStatusLabel();loop();
});

function parabolicPeak(arr,i){
  const a=arr[i-1]||arr[i],b=arr[i],c=arr[i+1]||arr[i];
  const d=a-2*b+c;return Math.abs(d)<1e-9?i:i+0.5*(a-c)/d;
}
function analyseFrame(){
  if(!analyser||!freqData)return null;
  analyser.getByteFrequencyData(freqData);
  analyser.getByteTimeDomainData(timeData);
  const sr=audioCtx.sampleRate,n=freqData.length;
  const minBin=Math.max(1,Math.floor(40/(sr/2)*n));
  let maxI=minBin,maxV=-1;
  for(let i=minBin;i<n;i++)if(freqData[i]>maxV){maxV=freqData[i];maxI=i}
  const f0=parabolicPeak(freqData,maxI)*(sr/2)/n;
  let sum=0;for(let i=0;i<timeData.length;i++){const v=(timeData[i]-128)/128;sum+=v*v}
  const rms=Math.sqrt(sum/timeData.length);
  const db=rms>1e-6?20*Math.log10(rms):-90;
  const thr=Math.max(20,maxV-40);
  const peaks=[];
  for(let i=minBin+1;i<n-1;i++){
    if(freqData[i]>thr&&freqData[i]>=freqData[i-1]&&freqData[i]>=freqData[i+1]){
      const f=parabolicPeak(freqData,i)*(sr/2)/n;
      if(f>40&&f<sr/2*0.95)peaks.push({f,v:freqData[i]});
    }
  }
  peaks.sort((a,b)=>b.v-a.v);
  const top=peaks.slice(0,6);
  const nest=Math.max(4,Math.min(32,Math.round(4+top.length*3.2+(maxV/255)*8)));
  return{f0,maxV,db,top,nest,sr,n};
}
function drawSpectrum(info){
  const W=cvs.width,H=cvs.height;
  ctx.fillStyle='#07061a';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(180,150,255,.08)';
  for(let g=1;g<5;g++){ctx.beginPath();ctx.moveTo(0,H*g/5);ctx.lineTo(W,H*g/5);ctx.stroke()}
  if(!freqData)return;
  const n=freqData.length;
  ctx.beginPath();
  for(let i=0;i<n;i++){
    const x=i/(n-1)*W,y=H-(freqData[i]/255)*(H-8)-4;
    if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
  }
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,'#5eead4');grad.addColorStop(.45,'#9d7bff');grad.addColorStop(1,'rgba(107,63,255,.15)');
  ctx.strokeStyle=grad;ctx.lineWidth=2;ctx.stroke();
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
  const fill=ctx.createLinearGradient(0,0,0,H);
  fill.addColorStop(0,'rgba(94,234,212,.25)');fill.addColorStop(1,'rgba(94,234,212,0)');
  ctx.fillStyle=fill;ctx.fill();
  if(info&&info.f0>0){
    const x=info.f0/(info.sr/2)*W;
    ctx.strokeStyle='rgba(240,212,154,.85)';ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#f0d49a';ctx.font='600 11px JetBrains Mono,monospace';
    ctx.fillText(info.f0.toFixed(1)+' Hz',Math.min(W-72,Math.max(4,x+6)),16);
  }
  if(info){
    ctx.fillStyle='rgba(122,111,168,.9)';ctx.font='10px JetBrains Mono,monospace';
    [200,500,1000,2000,4000,8000].forEach(f=>{
      if(f>info.sr/2)return;
      ctx.fillText(f>=1000?(f/1000)+'k':String(f),f/(info.sr/2)*W+2,H-6);
    });
  }
}
function drawWaterfall(){
  if(!freqData)return;
  const W=wf.width,H=wf.height;
  if(!wfOff){wfOff=document.createElement('canvas');wfOff.width=W;wfOff.height=H}
  const octx=wfOff.getContext('2d');
  octx.drawImage(wfOff,0,1);
  const row=octx.createImageData(W,1);
  const n=freqData.length;
  for(let x=0;x<W;x++){
    const i=Math.min(n-1,Math.floor(x/W*n));
    const v=freqData[i]/255;
    row.data[x*4]=(40+v*180)|0;row.data[x*4+1]=(20+v*100)|0;row.data[x*4+2]=(80+v*175)|0;row.data[x*4+3]=255;
  }
  octx.putImageData(row,0,0);wctx.drawImage(wfOff,0,0);
}

/* session log — sample every 0.5s while running */
const sessionLog=[];
let lastLogT=0;
function pushLogSample(info){
  if(!info||!(info.f0>0))return;
  const now=performance.now();
  if(now-lastLogT<500)return;
  lastLogT=now;
  sessionLog.push({
    t: new Date().toISOString(),
    f0: +info.f0.toFixed(3),
    rms_db: +info.db.toFixed(2),
    peaks: info.top.length,
    nest: info.nest,
    note: freqToNote(info.f0).name
  });
  const el=document.getElementById('logCount');
  if(el)el.textContent=sessionLog.length+' '+(t('log_samples')||'samples');
}
function exportLogCSV(){
  if(!sessionLog.length){alert(lang==='pl'?'Brak próbek w logu — uruchom pomiar.':'No samples — start a measurement.');return}
  const header='timestamp,f0_Hz,rms_dB,peaks,N_est,note\n';
  const body=sessionLog.map(r=>[r.t,r.f0,r.rms_db,r.peaks,r.nest,r.note].join(',')).join('\n');
  const blob=new Blob([header+body],{type:'text/csv'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='faem_spectrum_log_'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
function clearLog(){
  sessionLog.length=0;lastLogT=0;
  const el=document.getElementById('logCount');
  if(el)el.textContent='0 '+(t('log_samples')||'samples');
}
const btnLog=document.getElementById('btnLogCsv');
const btnLogClr=document.getElementById('btnLogClear');
if(btnLog)btnLog.addEventListener('click',exportLogCSV);
if(btnLogClr)btnLogClr.addEventListener('click',clearLog);

function updateReadout(info){
  if(!info)return;
  pushLogSample(info);
  const note=freqToNote(info.f0);
  document.getElementById('vF0').innerHTML=(info.f0>0?info.f0.toFixed(1):'—')+' <small>Hz</small>';
  document.getElementById('vNote').textContent=note.name;
  document.getElementById('vCent').innerHTML=(info.f0>0?(note.cents>=0?'+':'')+note.cents:'—')+' <small>cent</small>';
  document.getElementById('vRms').innerHTML=info.db.toFixed(1)+' <small>dB</small>';
  document.getElementById('vPeaks').textContent=String(info.top.length);
  document.getElementById('vNest').textContent=String(info.nest);
  const lvl=Math.max(0,Math.min(100,(info.db+60)/60*100));
  document.getElementById('lvlFill').style.width=lvl+'%';
  document.getElementById('lvlTxt').textContent=info.db.toFixed(1)+' dB';
  const hr=document.getElementById('harmRow');
  hr.innerHTML=info.top.length?info.top.map((p,i)=>'<span class="harm-chip">'+(i===0?'f0':'p'+(i+1))+' <strong>'+p.f.toFixed(0)+'</strong> Hz</span>').join(''):'<span class="harm-chip">—</span>';
  const f=info.f0>0?info.f0.toFixed(1):'';
  document.getElementById('linkCalc').href=f?('kalkulator.html?f='+encodeURIComponent(f)):'kalkulator.html';
  document.getElementById('linkGen').href='faem_generator.html?n='+info.nest;
  document.getElementById('calcHint').textContent=f?('f≈'+f+' Hz'):'f → tryb (m,n)';
  document.getElementById('genHint').textContent='N≈'+info.nest;
}
function loop(){
  if(!running)return;
  if(!frozen){const info=analyseFrame();drawSpectrum(info);drawWaterfall();updateReadout(info)}
  raf=requestAnimationFrame(loop);
}
setLang(lang);
ctx.fillStyle='#07061a';ctx.fillRect(0,0,cvs.width,cvs.height);
wctx.fillStyle='#07061a';wctx.fillRect(0,0,wf.width,wf.height);
