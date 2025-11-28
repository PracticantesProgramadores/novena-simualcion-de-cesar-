const PARTS=[
  {key:"head",label:"head",file:"cabeza.webp"},
  {key:"ear",label:"ear",file:"oidos.jpg"},
  {key:"eye",label:"eye",file:"ojos.png"},
  {key:"shoulder",label:"shoulder",file:"HOMBRO.jpg"},
  {key:"arm",label:"arm",file:"brazo.png"},
  {key:"hand",label:"hand",file:"manos.jpg"},
  {key:"knee",label:"knee",file:"rodilla.jpg"},
  {key:"leg",label:"leg",file:"pierna.png"},
  {key:"foot",label:"foot",file:"pie.jpg"},
  {key:"face",label:"face",file:"cara.png"},
  {key:"hair",label:"hair",file:"cabello.jpg"},
  {key:"nose",label:"nose",file:"nariz.webp"},
  {key:"mouth",label:"mouth",file:"boca.webp"},
  {key:"chest",label:"chest",file:"pecho.avif"}
]
const livesEl=document.getElementById("lives")
const roundEl=document.getElementById("round")
const instructionEl=document.getElementById("instruction")
const instructionStage=document.getElementById("instructionStage")
const timerBar=document.getElementById("timerBar")
const startBtn=document.getElementById("startBtn")
const modeClassic=document.getElementById("modeClassic")
const modeTrick=document.getElementById("modeTrick")
const modeFast=document.getElementById("modeFast")
const modeAudio=document.getElementById("modeAudio")
const overlay=document.getElementById("overlay")
const overlayContent=document.getElementById("overlayContent")
const overlayBtn=document.getElementById("overlayBtn")
const gallery=document.getElementById("gallery")
const resetBtn=document.getElementById("resetBtn")
const resultsEl=document.getElementById("results")
const aboutPanel=document.getElementById("aboutPanel")
let state=null
let timer=null
let timerStart=0
let timerLimit=0
let rafId=0
function initLives(n){livesEl.innerHTML="";for(let i=0;i<n;i++){const dot=document.createElement("div");dot.className="life";livesEl.appendChild(dot)}}
function setRound(cur,total){roundEl.textContent=`Ronda ${cur}/${total}`}
function speak(text){if(!modeAudio.checked)return;const u=new SpeechSynthesisUtterance(text);u.lang="en-US";window.speechSynthesis.cancel();window.speechSynthesis.speak(u)}
function pickPart(){const idx=Math.floor(Math.random()*PARTS.length);return PARTS[idx]}
function makeInstruction(part){let requiresAction=true;let prefix="";if(modeClassic.checked){prefix="Simon says: ";requiresAction=true}else if(modeTrick.checked){const trick=Math.random()<0.35;requiresAction=!trick;prefix=requiresAction?"Simon says: ":""}else{prefix="";requiresAction=true}return{text:`${prefix}Touch your ${part.label}`,requiresAction,part}}
function resetTimer(limit){cancelAnimationFrame(rafId);clearTimeout(timer);timerLimit=limit;timerStart=performance.now();timerBar.style.width="100%";const tick=()=>{const now=performance.now();const elapsed=now-timerStart;const p=Math.max(0,1-elapsed/limit);timerBar.style.width=`${p*100}%`;if(p>0){rafId=requestAnimationFrame(tick)}};rafId=requestAnimationFrame(tick);timer=setTimeout(()=>onTimeUp(),limit)}
function onTimeUp(){if(!state||!state.awaitInput)return;state.awaitInput=false;if(state.currentInstruction.requiresAction){state.wrong=(state.wrong||0)+1;state.wrongTimeout=(state.wrongTimeout||0)+1;loseLife();updateResults();nextOrEnd()}else{state.correct=(state.correct||0)+1;updateResults();nextRound()}}
function loseLife(){const idx=state.lives-1;if(idx>=0){const dots=livesEl.querySelectorAll('.life');dots[idx].classList.add('lost')}state.lives-=1}
function nextOrEnd(){if(state.lives<=0){endGame(false)}else{nextRound()}}
function updateInstruction(text){instructionEl.textContent=text;instructionStage.textContent=text;speak(text)}
function updateResults(){if(!state)return;const correct=state.correct||0;const total=state.totalRounds||0;const pct=total?Math.round((correct/total)*100):0;const grade=pct>=90?"A (Excelente)":pct>=80?"B (Muy bien)":pct>=70?"C (Bien)":pct>=60?"D (Regular)":"E (Reforzar)";resultsEl.textContent=`Aciertos: ${correct}/${total} • ${pct}% • ${grade}`}
function startGame(){overlay.classList.remove("show");const total=10;state={lives:3,totalRounds:total,round:0,awaitInput:false,currentInstruction:null,fast:modeFast.checked,correct:0,wrong:0,wrongTimeout:0,wrongWrongPart:0,wrongTrickClick:0,usedKeys:new Set()};if(aboutPanel) aboutPanel.classList.add('hidden');initLives(state.lives);setRound(0,total);updateInstruction("Preparado");updateResults();nextRound()}
function nextRound(){state.round+=1;setRound(state.round,state.totalRounds);let pool=PARTS.filter(p=>!state.usedKeys.has(p.key));if(pool.length===0){state.usedKeys=new Set();pool=PARTS.slice()}const part=pool[Math.floor(Math.random()*pool.length)];state.usedKeys.add(part.key);const ins=makeInstruction(part);state.currentInstruction=ins;state.awaitInput=true;updateInstruction(ins.text);const base=state.fast?3500:6000;const accel=Math.max(0,state.round-1)*250;const limit=Math.max(1500,base-accel);resetTimer(limit)}
function endGame(win){state.awaitInput=false;const correct=state.correct||0;const total=state.totalRounds||0;const pct=total?Math.round((correct/total)*100):0;const grade=pct>=90?"A (Excelente)":pct>=80?"B (Muy bien)":pct>=70?"C (Bien)":pct>=60?"D (Regular)":"E (Reforzar)";const livesLeft=state.lives;const reasons=`<ul class="reasons"><li>Precisión: ${pct}% (${correct}/${total})</li><li>Parte incorrecta: ${state.wrongWrongPart||0}</li><li>Hiciste clic sin “Simon says”: ${state.wrongTrickClick||0}</li><li>Tiempo agotado: ${state.wrongTimeout||0}</li><li>Vidas restantes: ${livesLeft}/3</li><li>Modo rápido: ${state.fast?"Sí":"No"}</li></ul>`;updateInstruction(win?"¡Ganaste!":"Game Over");overlayContent.innerHTML=`<div>${win?"Has completado todas las rondas":"Te quedaste sin vidas"}</div><div style="margin-top:8px">Aciertos: <b>${correct}</b> / ${total} • <b>${pct}%</b> • ${grade}</div>${reasons}`;overlay.classList.add("show")}
function handleClick(e){const card=e.target.closest('.card');if(!card)return;if(!state||!state.awaitInput)return;const key=card.getAttribute('data-part');const expected=state.currentInstruction.part.key;if(!state.currentInstruction.requiresAction){card.classList.add('wrong');setTimeout(()=>card.classList.remove('wrong'),450);state.wrong+=1;state.wrongTrickClick=(state.wrongTrickClick||0)+1;loseLife();state.awaitInput=false;updateResults();nextOrEnd();return}if(key===expected){card.classList.add('correct');gallery.style.pointerEvents='none';setTimeout(()=>{card.classList.remove('correct');gallery.style.pointerEvents='';},600);state.correct+=1;state.awaitInput=false;updateResults();if(state.round>=state.totalRounds){endGame(true)}else{nextRound()}}else{card.classList.add('wrong');setTimeout(()=>card.classList.remove('wrong'),450);state.wrong+=1;state.wrongWrongPart=(state.wrongWrongPart||0)+1;state.awaitInput=false;loseLife();updateResults();nextOrEnd()}}
gallery.addEventListener("click",handleClick)
startBtn.addEventListener("click",startGame)
overlayBtn.addEventListener("click",startGame)
resetBtn.addEventListener("click",startGame)
function renderGallery(){gallery.innerHTML='';PARTS.forEach(p=>{const div=document.createElement('div');div.className='card';div.setAttribute('data-part',p.key);const img=document.createElement('img');img.src=p.file;img.alt=p.label;const label=document.createElement('div');label.className='label';label.textContent=p.label;div.appendChild(img);div.appendChild(label);gallery.appendChild(div)})}
renderGallery()
initLives(3)
setRound(0,10)
updateResults()
