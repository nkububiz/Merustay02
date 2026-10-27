const listings = [
  {id:"willow",title:"The Willow House",area:"North Oakland, CA",city:"Oakland",price:2480,beds:2,baths:1,type:"Apartment",size:"865 sq ft",tag:"Good light",image:"https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=1000",alt:"Airy living room with warm wood flooring and a large window"},
  {id:"cedar",title:"Cedar & 14th",area:"Temescal, Oakland, CA",city:"Oakland",price:2150,beds:1,baths:1,type:"Condo",size:"710 sq ft",tag:"Just listed",image:"https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1000",alt:"Quiet bedroom with natural textures and soft daylight"},
  {id:"sunroom",title:"The Sunroom Flat",area:"Bernal Heights, San Francisco, CA",city:"San Francisco",price:3195,beds:2,baths:1,type:"Apartment",size:"940 sq ft",tag:"A little extra",image:"https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=1000",alt:"Light-filled living room with a thoughtful, relaxed interior"},
  {id:"maple",title:"Maple Court",area:"Alameda, CA",city:"Alameda",price:2790,beds:2,baths:2,type:"Townhouse",size:"1,120 sq ft",tag:"Room to grow",image:"https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=1000",alt:"Welcoming modern home interior with wide windows"},
  {id:"garden",title:"Garden Gate",area:"Rockridge, Oakland, CA",city:"Oakland",price:3550,beds:3,baths:2,type:"House",size:"1,340 sq ft",tag:"Private garden",image:"https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1000",alt:"Warm, comfortable home with natural wood and gentle daylight"},
  {id:"cypress",title:"Cypress Landing",area:"Emeryville, CA",city:"Emeryville",price:1895,beds:1,baths:1,type:"Apartment",size:"640 sq ft",tag:"Easy living",image:"https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=1000",alt:"Calm apartment interior with a simple, sunlit bedroom"}
];
const storage = {
  read(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } },
  write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { showToast("Your browser couldn't save this just now."); } }
};
const $ = (selector, root=document) => root.querySelector(selector);
const grid = $("#listing-grid");
const savedCount = $("#saved-count");
const favoritesFilter = $("#favorites-filter");
const state = {saved:new Set(storage.read("reome-favorites", [])), favoritesOnly:false, bedrooms:null, query:"", type:"", budget:"", showAll:false};
let toastTimer;
function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("visible");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}
function updateSavedCount() {
  savedCount.textContent = state.saved.size;
  savedCount.setAttribute("aria-label", `${state.saved.size} saved homes`);
}
function renderListings() {
  const filtered = listings.filter(home => {
    const matchesQuery = !state.query || `${home.title} ${home.area} ${home.city}`.toLowerCase().includes(state.query.toLowerCase());
    return matchesQuery && (!state.type || home.type === state.type) && (!state.budget || home.price <= Number(state.budget)) && (!state.bedrooms || home.beds >= Number(state.bedrooms)) && (!state.favoritesOnly || state.saved.has(home.id));
  });
  $("#results-count").textContent = `Showing ${filtered.length} ${filtered.length === 1 ? "home" : "homes"}${state.favoritesOnly ? " you saved" : ""}`;
  $("#empty-results").hidden = filtered.length !== 0;
  $("#load-more").hidden = filtered.length === 0 || state.favoritesOnly;
  grid.innerHTML = filtered.map((home,index) => `
    <article class="listing-card" style="animation-delay:${Math.min(index*55,220)}ms">
      <div class="listing-image-wrap">
        <img class="listing-image" src="${home.image}" alt="${home.alt}" loading="lazy">
        <span class="image-tag">${home.tag}</span>
        <button class="favorite-button ${state.saved.has(home.id)?"is-saved":""}" type="button" data-favorite="${home.id}" aria-label="${state.saved.has(home.id)?"Remove":"Save"} ${home.title}" aria-pressed="${state.saved.has(home.id)}">${state.saved.has(home.id)?"♥":"♡"}</button>
      </div>
      <div class="listing-info">
        <div class="listing-heading"><h3>${home.title}</h3><span class="price">$${home.price.toLocaleString()}<small> / mo</small></span></div>
        <p class="listing-location">${home.area}</p>
        <div class="listing-meta"><div class="meta-left"><span class="meta-item">${home.beds} bed${home.beds===1?"":"s"}</span><span class="meta-item">${home.baths} bath</span><span class="meta-item">${home.size}</span></div><button class="listing-detail" type="button" data-details="${home.id}" aria-label="View details for ${home.title}">Details ↗</button></div>
      </div>
    </article>`).join("");
}
grid.addEventListener("click", event => {
  const favorite = event.target.closest("[data-favorite]");
  if (favorite) {
    const id = favorite.dataset.favorite;
    state.saved.has(id) ? state.saved.delete(id) : state.saved.add(id);
    storage.write("reome-favorites", [...state.saved]); updateSavedCount(); renderListings();
    showToast(state.saved.has(id) ? "Home saved to your list." : "Removed from your saved homes.");
  }
  const details = event.target.closest("[data-details]");
  if (details) {
    const home = listings.find(item => item.id === details.dataset.details);
    showToast(`${home.title} · ${home.beds} bedrooms · $${home.price.toLocaleString()} per month`);
  }
});
$("#search-form").addEventListener("submit", event => {
  event.preventDefault();
  state.query = $("#location-search").value.trim();
  state.type = $("#type-search").value;
  state.budget = $("#budget-search").value;
  state.favoritesOnly = false; favoritesFilter.setAttribute("aria-pressed","false");$("#saved-nav").setAttribute("aria-pressed","false");
  renderListings(); $("#homes").scrollIntoView({behavior:"smooth",block:"start"});
});
$("#show-all").addEventListener("click", event => { event.preventDefault(); clearFilters(); });
$("#load-more").addEventListener("click", () => showToast("You're seeing all homes in this preview."));
$("#reset-search").addEventListener("click", clearFilters);
function clearFilters() {
  state.query="";state.type="";state.budget="";state.bedrooms=null;state.favoritesOnly=false;
  $("#location-search").value="";$("#type-search").value="";$("#budget-search").value="";
  favoritesFilter.setAttribute("aria-pressed","false");$("#saved-nav").setAttribute("aria-pressed","false"); updateBedroomChip(); renderListings();
}
favoritesFilter.addEventListener("click", () => {
  state.favoritesOnly=!state.favoritesOnly; favoritesFilter.setAttribute("aria-pressed",String(state.favoritesOnly));$("#saved-nav").setAttribute("aria-pressed",String(state.favoritesOnly)); renderListings();
});
$("#saved-nav").addEventListener("click", () => {
  state.favoritesOnly=!state.favoritesOnly;
  favoritesFilter.setAttribute("aria-pressed",String(state.favoritesOnly));
  $("#saved-nav").setAttribute("aria-pressed",String(state.favoritesOnly));
  renderListings(); $("#homes").scrollIntoView({behavior:"smooth",block:"start"});
});
const bedsFilter = $("#beds-filter");
function updateBedroomChip(){bedsFilter.innerHTML=`Bedrooms ${state.bedrooms?`· ${state.bedrooms}+`:""} <span aria-hidden="true">⌄</span>`;}
bedsFilter.addEventListener("click", () => {
  let picker=$("#bedroom-picker");
  if(picker){picker.remove();bedsFilter.setAttribute("aria-expanded","false");return;}
  picker=document.createElement("select");picker.id="bedroom-picker";picker.setAttribute("aria-label","Minimum bedrooms");
  picker.innerHTML='<option value="">Any bedrooms</option><option value="1">1+ bedrooms</option><option value="2">2+ bedrooms</option><option value="3">3+ bedrooms</option>';
  picker.value=state.bedrooms||"";
  bedsFilter.insertAdjacentElement("afterend",picker);bedsFilter.setAttribute("aria-expanded","true");
  picker.addEventListener("change",()=>{state.bedrooms=picker.value||null;picker.remove();bedsFilter.setAttribute("aria-expanded","false");updateBedroomChip();renderListings();});
  picker.focus();
});
updateBedroomChip(); updateSavedCount(); renderListings();

const guideDialog=$("#guide-dialog");
const questionSteps=[
  {key:"timing",label:"Move-in timing",title:"When are you hoping to make a move?",description:"A rough idea is perfect. Plans can shift.",options:[["As soon as I find the right place","Ready when it feels right"],["In the next month","Soon, but not rushed"],["In 1–3 months","A little room to plan"],["Just exploring","Getting a feel for things"]]},
  {key:"location",label:"Location",title:"Where would life feel good?",description:"A city, a few neighborhoods, or somewhere new. Start anywhere.",input:true,placeholder:"Try Oakland, Temescal, or near BART"},
  {key:"budget",label:"Monthly budget",title:"What monthly rent feels comfortable?",description:"Think about the number that leaves room for everything else.",range:true},
  {key:"type",label:"Home type",title:"What kind of place are you picturing?",description:"Choose the closest fit. You can stay open to other options.",options:[["Apartment","Easy, connected living"],["Condo","A little more individual"],["House","Room to spread out"],["Townhouse","A home with a few levels"],["Open to anything","Let the right one surprise me"]]},
  {key:"bedrooms",label:"Bedrooms",title:"How much room do you need?",description:"Count the people, the projects, and the occasional overnight guest.",options:[["Studio","One thoughtful room"],["1 bedroom","A little more separation"],["2 bedrooms","Space to share or work"],["3+ bedrooms","Room for everyone"]]},
  {key:"priorities",label:"What matters most",title:"What makes a place feel like yours?",description:"Pick up to three. We'll keep the details in view.",multi:true,options:[["Natural light","Bright mornings, soft afternoons"],["Outdoor space","A balcony, yard, or nearby green"],["Transit access","An easier way around town"],["Pet friendly","Room for a beloved sidekick"],["Quiet surroundings","A place to settle in"],["In-unit laundry","One less errand to plan"]]}
];
const savedGuide=storage.read("reome-home-brief",{answers:{},step:0,complete:false});
const guideState={answers:savedGuide.answers||{},step:savedGuide.complete?6:Math.min(Number(savedGuide.step)||0,5),complete:Boolean(savedGuide.complete)};
function persistGuide(){storage.write("reome-home-brief",{answers:guideState.answers,step:guideState.step,complete:guideState.complete});}
function openGuide(){guideDialog.showModal();renderGuide();}
document.querySelectorAll("[data-open-guide]").forEach(button=>button.addEventListener("click",openGuide));
$("#close-guide").addEventListener("click",()=>guideDialog.close());
guideDialog.addEventListener("click",event=>{if(event.target===guideDialog)guideDialog.close();});
function renderGuide(){
  const review=guideState.step>=6;
  const stepIndex=Math.min(guideState.step,5);
  const step=questionSteps[stepIndex];
  const progress=review?100:Math.round(((stepIndex+1)/6)*100);
  $("#step-caption").textContent=review?"YOUR HOME BRIEF":`QUESTION ${String(stepIndex+1).padStart(2,"0")} OF 06`;
  $("#progress-percent").textContent=review?"READY":`${progress}%`;
  $("#progress-bar").style.width=`${progress}%`;
  if(review){renderReview();return;}
  const selectedValues=Array.isArray(guideState.answers[step.key])?guideState.answers[step.key]:[guideState.answers[step.key]];
  let inputContent="";
  if(step.input) inputContent=`<label class="visually-hidden" for="guide-location">Location preferences</label><input class="question-input" id="guide-location" type="text" placeholder="${step.placeholder}" value="${escapeHTML(guideState.answers.location||"")}" autocomplete="off">`;
  else if(step.range){
    const value=Number(guideState.answers.budget)||2500;
    inputContent=`<div><output class="budget-value" id="budget-output">$${value.toLocaleString()}<span style="font:11px var(--body);color:#858b80"> / month</span></output><input class="budget-range" id="guide-budget" type="range" min="1000" max="6000" step="100" value="${value}" aria-label="Monthly rent budget"><div class="budget-labels"><span>$1,000</span><span>$6,000+</span></div></div>`;
  } else {
    inputContent=`${step.multi?'<p class="multi-note">Choose up to three</p>':''}<div class="option-grid">${step.options.map(([name,sub])=>{const active=selectedValues.includes(name);return `<button class="option-card ${active?"selected":""}" type="button" data-option="${escapeHTML(name)}" aria-pressed="${active}"><span>${escapeHTML(name)}${sub?`<span class="option-sub">${escapeHTML(sub)}</span>`:""}</span><span class="option-check" aria-hidden="true">✓</span></button>`;}).join("")}</div>`;
  }
  const questionTitle=step.key==="bedrooms"&&guideState.answers.type?`How much room do you need in your ${guideState.answers.type.toLowerCase()}?`:step.title;
  $("#wizard-view").innerHTML=`<div class="question-step"><span class="question-index">0${stepIndex+1} / 06</span><h2 class="question-title" id="guide-title">${escapeHTML(questionTitle)}</h2><p class="question-description">${step.description}</p>${inputContent}<div class="wizard-bottom"><button class="wizard-back" id="wizard-back" type="button" ${stepIndex===0?"disabled":""}>← Back</button><button class="button button-dark wizard-next" id="wizard-next" type="button">${stepIndex===5?"Review my brief":"Continue"} <span aria-hidden="true">→</span></button></div></div>`;
  if(step.input){$("#guide-location").addEventListener("input",event=>{guideState.answers.location=event.target.value;persistGuide();});}
  if(step.range){$("#guide-budget").addEventListener("input",event=>{const amount=Number(event.target.value);guideState.answers.budget=amount;$("#budget-output").innerHTML=`$${amount.toLocaleString()}<span style="font:11px var(--body);color:#858b80"> / month</span>`;persistGuide();});}
  $("#wizard-view").querySelectorAll("[data-option]").forEach(button=>button.addEventListener("click",()=>{
    const value=button.dataset.option;
    if(step.multi){
      const current=Array.isArray(guideState.answers[step.key])?[...guideState.answers[step.key]]:[];
      guideState.answers[step.key]=current.includes(value)?current.filter(item=>item!==value):current.length<3?[...current,value]:current;
    }else guideState.answers[step.key]=value;
    persistGuide();renderGuide();
  }));
  $("#wizard-back").addEventListener("click",()=>{if(guideState.step>0){guideState.step--;persistGuide();renderGuide();}});
  $("#wizard-next").addEventListener("click",()=>{
    if(step.key==="location"&&!String(guideState.answers.location||"").trim()){showToast("Add a city or neighborhood to continue.");$("#guide-location").focus();return;}
    if(step.key==="location")guideState.answers.location=String(guideState.answers.location).trim();
    if(step.key==="budget"&&!guideState.answers.budget)guideState.answers.budget=2500;
    if(step.key==="type"&&!guideState.answers.type)guideState.answers.type="Open to anything";
    if(step.key==="bedrooms"&&!guideState.answers.bedrooms)guideState.answers.bedrooms="1 bedroom";
    if(step.key==="priorities"&&!guideState.answers.priorities)guideState.answers.priorities=[];
    if(step.key==="timing"&&!guideState.answers.timing)guideState.answers.timing="In the next month";
    guideState.step++;if(guideState.step>=6)guideState.complete=true;persistGuide();renderGuide();
  });
}
function renderReview(){
  const answers=guideState.answers;
  const rows=[
    ["Move-in",answers.timing||"In the next month","timing"],
    ["Looking around",answers.location||"Not set","location"],
    ["Monthly budget",answers.budget?`Up to $${Number(answers.budget).toLocaleString()}`:"$2,500","budget"],
    ["Home type",answers.type||"Open to anything","type"],
    ["Bedrooms",answers.bedrooms||"1 bedroom","bedrooms"],
    ["Priorities",Array.isArray(answers.priorities)&&answers.priorities.length?answers.priorities.join(", "):"Open to ideas","priorities"]
  ];
  $("#wizard-view").innerHTML=`<div class="question-step"><div class="review-top"><span class="score-ring" aria-label="98 percent understanding">98%</span><div><p class="review-kicker">SIMULATED BRIEF COMPLETENESS</p><h3 id="guide-title">A clearer place to start.</h3></div></div><p class="review-note">This is a preview of how well your answers describe the home you want. It’s not a match guarantee — just a useful starting point.</p><dl class="answer-list">${rows.map(([label,value,key])=>`<div class="answer-row"><dt>${label}</dt><dd>${escapeHTML(value)}</dd><button class="edit-answer" type="button" data-edit="${key}">Edit</button></div>`).join("")}</dl><p class="review-fine">Your answers stay in this browser. You can change or clear them whenever you like.</p><div class="wizard-bottom"><button class="wizard-back" id="wizard-back" type="button">← Back</button><button class="button button-dark wizard-next" id="finish-guide" type="button">Done for now <span aria-hidden="true">✓</span></button></div></div>`;
  $("#wizard-view").querySelectorAll("[data-edit]").forEach(button=>button.addEventListener("click",()=>{guideState.complete=false;guideState.step=questionSteps.findIndex(item=>item.key===button.dataset.edit);persistGuide();renderGuide();}));
  $("#wizard-back").addEventListener("click",()=>{guideState.complete=false;guideState.step=5;persistGuide();renderGuide();});
  $("#finish-guide").addEventListener("click",()=>{
    guideDialog.close();
    state.query=String(answers.location||"").trim();
    state.type=answers.type==="Open to anything"?"":(answers.type||"");
    state.budget=String(Number(answers.budget)||2500);
    state.bedrooms=answers.bedrooms==="Studio"?"":answers.bedrooms==="1 bedroom"?"1":answers.bedrooms==="2 bedrooms"?"2":"3";
    $("#location-search").value=state.query;
    $("#type-search").value=["Apartment","Condo","House","Townhouse"].includes(state.type)?state.type:"";
    $("#budget-search").value=["2000","2500","3000","3500","4000"].includes(state.budget)?state.budget:"";
    state.favoritesOnly=false;favoritesFilter.setAttribute("aria-pressed","false");$("#saved-nav").setAttribute("aria-pressed","false");
    updateBedroomChip();renderListings();$("#homes").scrollIntoView({behavior:"smooth",block:"start"});
    showToast("Your brief is saved. Here are homes to start with.");
  });
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
const menuToggle=$("#menu-toggle");
menuToggle.addEventListener("click",()=>{const header=$(".site-header");const open=header.classList.toggle("menu-open");menuToggle.setAttribute("aria-expanded",String(open));menuToggle.setAttribute("aria-label",open?"Close navigation":"Open navigation");});
$(".desktop-nav").addEventListener("click",event=>{if(event.target.closest("a")){$(".site-header").classList.remove("menu-open");menuToggle.setAttribute("aria-expanded","false");}});
