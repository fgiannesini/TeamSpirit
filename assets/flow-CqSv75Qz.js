import"./modulepreload-polyfill-B5Qt9EMX.js";var a=(e=>(e[e.TODO=0]="TODO",e[e.IN_PROGRESS=1]="IN_PROGRESS",e[e.TO_REVIEW=2]="TO_REVIEW",e[e.REVIEW=3]="REVIEW",e[e.DONE=4]="DONE",e))(a||{});const d=e=>{let t=document.querySelector(e);if(!t)throw new Error(`element avec sélecteur ${e} non trouvé`);return t},p=()=>d("#threads"),f=e=>d(`#thread${e}`),m=()=>d("#backlog"),N=()=>d("#done"),E=e=>d(`#${e}`),S=()=>d("#compute"),l=[],i=[],R=e=>{const t=document.createElement("div");return t.id=e,t.className="userStory",t.textContent=e,t},O=(e,t)=>{const o=e.getBoundingClientRect().top;Array.from(new Set(t.map(r=>r.userStoryName))).map(r=>R(r)).forEach(r=>{r.style.top=`${o}px`,r.addEventListener("transitionend",s=>{const c=l.findIndex(y=>y==s.target);i[c]=!1}),e.append(r),l.push(r),i.push(!1)})},g=(e,t)=>{const o=e.getBoundingClientRect(),n=`${o.top}px`,r=`${o.right+3}px`;return h(E(t),n,r)},u=(e,t,o)=>{const n=e.getBoundingClientRect(),r=`${n.top}px`,s=`${n.left+50*(o-1)+3*o}px`;return h(E(t),r,s)},h=(e,t,o)=>t==e.style.top&&o==e.style.left?!1:(e.style.top=t,e.style.left=o,i[l.indexOf(e)]=!0,!0),T=async()=>{for(;!i.every(e=>!e);)await I(100)},I=e=>new Promise(t=>setTimeout(t,e)),v=e=>{const t=document.createElement("div");return t.id=`thread${e}`,t.className="thread",t.textContent=`thread ${e}`,t},w=(e,t)=>{Array.from(new Set(t.map(o=>o.thread))).forEach(o=>{const n=v(o);e.append(n)})},x=e=>{w(p(),e),O(m(),e),setTimeout(()=>{document.querySelectorAll(".userStory").forEach((n,r)=>n.style.left=50*r+"px")});let t=0;S().addEventListener("click",async()=>{t++;let n=e.filter(s=>s.time==t),r=0;for(const s of n){let c=!1;s.state==a.IN_PROGRESS||s.state==a.REVIEW?c=g(f(s.thread),s.userStoryName):s.state==a.TO_REVIEW?c=u(m(),s.userStoryName,1):s.state==a.DONE&&(r++,c=u(N(),s.userStoryName,r)),c&&await T()}})};x([{time:1,userStoryName:"userStory1",thread:0,state:a.IN_PROGRESS},{time:1,userStoryName:"userStory1",thread:0,state:a.TO_REVIEW},{time:1,userStoryName:"idle",thread:1,state:a.DONE},{time:2,userStoryName:"idle",thread:0,state:a.DONE},{time:2,userStoryName:"userStory1",thread:1,state:a.REVIEW},{time:2,userStoryName:"userStory1",thread:1,state:a.DONE}]);