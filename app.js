const $ = (s) => document.querySelector(s);
const form = $("#builderForm"), urlEl=$("#url"), nameEl=$("#name"), packageEl=$("#packageId"), versionEl=$("#version");
const fileEl=$("#iconFile"), preview=$("#iconPreview"), previewImg=$("#previewImg"), iconSource=$("#iconSource");
const statusEl=$("#status"), buildBtn=$("#buildBtn"), btnText=$("#btnText"), spinner=$("#spinner");

let iconDataUrl = null;

function showStatus(msg, type="info"){ statusEl.textContent=msg; statusEl.className=`status show ${type}`; }
function normalizeUrl(v){ let u=v.trim(); if(!/^https?:\/\//i.test(u)) u="https://"+u; return u; }
function validPackage(v){ return /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(v); }
function updateSummary(){
  $("#sumUrl").textContent=urlEl.value||"—";
  $("#sumName").textContent=nameEl.value||"Otomatis";
  $("#sumPackage").textContent=packageEl.value||"—";
  $("#sumVersion").textContent=versionEl.value||"1.0.0";
}
[urlEl,nameEl,packageEl,versionEl].forEach(x=>x.addEventListener("input",updateSummary));
updateSummary();

fileEl.addEventListener("change",()=>{
  const f=fileEl.files[0];
  if(!f){ iconDataUrl=null; preview.classList.add("hidden"); return; }
  if(f.size>2*1024*1024){ showStatus("Logo terlalu besar. Maksimal 2 MB.", "error"); fileEl.value=""; return; }
  const r=new FileReader();
  r.onload=()=>{ iconDataUrl=r.result; previewImg.src=iconDataUrl; iconSource.textContent=f.name; preview.classList.remove("hidden"); };
  r.readAsDataURL(f);
});
$("#clearIcon").addEventListener("click",()=>{fileEl.value="";iconDataUrl=null;preview.classList.add("hidden");});

async function getMetadata(url){
  try{
    const r=await fetch(`/api/site-info?url=${encodeURIComponent(url)}`);
    if(!r.ok) return {};
    return await r.json();
  }catch{return {}}
}

function iconUrlFromMeta(url, meta){
  if(meta.favicon) return meta.favicon;
  try{return new URL("/favicon.ico",url).href}catch{return null}
}

function makePayload(cfg){
  const version=cfg.version || "1.0.0";
  const versionCode=Math.max(1, Number(version.split(".")[0].replace(/\D/g,""))||1);
  return {
    additionalTrustedOrigins: [],
    appVersion: version,
    appVersionCode: versionCode,
    backgroundColor:"#0b1020",
    display:"standalone",
    enableNotifications:false,
    enableSiteSettingsShortcut:true,
    fallbackType:"customtabs",
    features:{locationDelegation:{enabled:false},playBilling:{enabled:false}},
    host:cfg.url,
    iconUrl:cfg.iconUrl,
    includeSourceCode:false,
    isChromeOSOnly:false,
    launcherName:cfg.name,
    maskableIconUrl:null,
    monochromeIconUrl:null,
    name:cfg.name,
    navigationColor:"#0b1020",
    navigationColorDark:"#0b1020",
    navigationDividerColor:"#0b1020",
    navigationDividerColorDark:"#0b1020",
    orientation:"default",
    packageId:cfg.packageId,
    shareTarget:null,
    shortcuts:[],
    signingMode:"none",
    splashScreenFadeOutDuration:300,
    startUrl:"/",
    themeColor:"#0b1020",
    themeColorDark:"#0b1020",
    webManifestUrl:new URL("/manifest.json",cfg.url).href
  };
}

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  let url=normalizeUrl(urlEl.value);
  if(!urlEl.checkValidity()){showStatus("Masukkan URL website yang valid.","error");return}
  if(!validPackage(packageEl.value.trim())){showStatus("Package name tidak valid. Gunakan format seperti com.contoh.aplikasi.","error");return}

  buildBtn.disabled=true; spinner.classList.remove("hidden"); btnText.textContent="Menyiapkan…";
  showStatus("Membaca title dan favicon website…","info");

  try{
    const meta=await getMetadata(url);
    const name=(nameEl.value.trim()||meta.title||new URL(url).hostname).slice(0,50);
    const iconUrl=iconDataUrl || iconUrlFromMeta(url,meta);
    if(!iconUrl) throw new Error("Logo tidak ditemukan. Isi logo APK secara manual.");
    const payload=makePayload({url,name,packageId:packageEl.value.trim(),version:versionEl.value.trim(),iconUrl});

    showStatus("Mengirim permintaan ke CloudAPK. Proses build dapat memerlukan beberapa menit…","info");
    btnText.textContent="Membangun APK…";

    // Build through our Vercel serverless proxy instead of calling CloudAPK
    // directly from the browser. This avoids browser CORS failures.
    const res=await fetch("/api/build",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    if(!res.ok){
      const t=await res.text().catch(()=> "");
      throw new Error(t || `Server builder mengembalikan ${res.status}.`);
    }
    const blob=await res.blob();
    const cd=res.headers.get("content-disposition")||"";
    const match=cd.match(/filename="?([^"]+)"?/i);
    const filename=match?.[1] || `${name.replace(/[^a-z0-9]+/gi,"-").toLowerCase()}.zip`;
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),3000);
    showStatus("Berhasil. Paket hasil build sudah diunduh. Buka ZIP tersebut untuk mengambil APK.","ok");
    btnText.textContent="Buat APK Lagi";
  }catch(err){
    console.error(err);
    showStatus(err.message || "Build gagal. Coba lagi atau gunakan PWABuilder secara langsung.","error");
    btnText.textContent="Coba Lagi";
  }finally{
    buildBtn.disabled=false; spinner.classList.add("hidden");
  }
});
