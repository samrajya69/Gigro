import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DATA ─────────────────────────────────────────────────────── */
const jobs = [
  { id:1, title:"Senior Product Designer", company:"Notion", logo:"N", logoColor:"#000", logoBg:"#fff", location:"San Francisco, CA", type:"Full-time", salary:"$140k – $180k", tags:["Figma","Design Systems","UX Research"], posted:"2h ago", featured:true, category:"Design" },
  { id:2, title:"Staff Frontend Engineer", company:"Vercel", logo:"▲", logoColor:"#fff", logoBg:"#000", location:"Remote", type:"Full-time", salary:"$180k – $220k", tags:["React","Next.js","TypeScript"], posted:"5h ago", featured:true, category:"Engineering" },
  { id:3, title:"Growth Marketing Lead", company:"Linear", logo:"L", logoColor:"#fff", logoBg:"#5E6AD2", location:"New York, NY", type:"Full-time", salary:"$120k – $150k", tags:["SEO","Analytics","Content"], posted:"1d ago", featured:false, category:"Marketing" },
  { id:4, title:"AI Research Scientist", company:"Mistral", logo:"M", logoColor:"#fff", logoBg:"#FF6B35", location:"Paris / Remote", type:"Full-time", salary:"$200k – $280k", tags:["PyTorch","LLMs","Python"], posted:"2d ago", featured:false, category:"Engineering" },
  { id:5, title:"Head of Brand Design", company:"Arc", logo:"A", logoColor:"#fff", logoBg:"#CC3F0C", location:"San Francisco, CA", type:"Full-time", salary:"$160k – $200k", tags:["Branding","Motion","Illustration"], posted:"3d ago", featured:false, category:"Design" },
  { id:6, title:"DevOps Platform Engineer", company:"Planetscale", logo:"P", logoColor:"#fff", logoBg:"#7C3AED", location:"Remote", type:"Contract", salary:"$130k – $160k", tags:["Kubernetes","AWS","Terraform"], posted:"4d ago", featured:false, category:"Engineering" },
  { id:7, title:"iOS Engineer", company:"Figma", logo:"F", logoColor:"#fff", logoBg:"#F24E1E", location:"San Francisco, CA", type:"Full-time", salary:"$170k – $210k", tags:["Swift","SwiftUI","Xcode"], posted:"5d ago", featured:false, category:"Engineering" },
  { id:8, title:"Product Manager, Platform", company:"Stripe", logo:"S", logoColor:"#fff", logoBg:"#635BFF", location:"Dublin / Remote", type:"Full-time", salary:"$150k – $190k", tags:["APIs","B2B","Roadmapping"], posted:"1w ago", featured:false, category:"Product" },
];
const categories = ["All","Engineering","Design","Marketing","Product"];
const tagColors = { "Figma":"#E8F4FD","Design Systems":"#FDF0F5","UX Research":"#F0FDF4","React":"#EFF6FF","Next.js":"#F5F3FF","TypeScript":"#EFF6FF","SEO":"#FFFBEB","Analytics":"#FFF7ED","Content":"#F0FDF4","PyTorch":"#FEF2F2","LLMs":"#FDF4FF","Python":"#FFFBEB","Branding":"#FDF0F5","Motion":"#F5F3FF","Illustration":"#FFFBEB","Kubernetes":"#EFF6FF","AWS":"#FFF7ED","Terraform":"#F0FDF4","Swift":"#FEF2F2","SwiftUI":"#FFF7ED","Xcode":"#EFF6FF","APIs":"#F5F3FF","B2B":"#FFFBEB","Roadmapping":"#F0FDF4" };
const STEPS = [{ id:1,label:"Company",icon:"🏢" },{ id:2,label:"Role",icon:"💼" },{ id:3,label:"Details",icon:"📋" },{ id:4,label:"Preview",icon:"✨" }];
const bgPalette = [{ bg:"#111",color:"#fff" },{ bg:"#FF6B35",color:"#fff" },{ bg:"#5E6AD2",color:"#fff" },{ bg:"#7C3AED",color:"#fff" },{ bg:"#CC3F0C",color:"#fff" },{ bg:"#0EA5E9",color:"#fff" },{ bg:"#10B981",color:"#fff" },{ bg:"#F59E0B",color:"#fff" },{ bg:"#EC4899",color:"#fff" },{ bg:"#fff",color:"#111" }];

/* ─── HOOKS ─────────────────────────────────────────────────────── */
function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const handler = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}

function useIntersectionObserver(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); }
    }, { threshold: 0.08, ...options });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, isVisible];
}

/* ─── GLOBAL STYLES injected once ───────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      body{overflow-x:hidden;}
      ::-webkit-scrollbar{width:4px;height:4px;}
      ::-webkit-scrollbar-track{background:transparent;}
      ::-webkit-scrollbar-thumb{background:#ddd;border-radius:99px;}
      @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
      @keyframes pulse-dot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.7}}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes slide-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes tag-pop{0%{transform:scale(0.7);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
      @keyframes confetti-fall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(60px) rotate(360deg);opacity:0}}
      .tag-enter{animation:tag-pop 0.25s cubic-bezier(0.34,1.5,0.64,1) forwards;}
      .card-hover{transition:all 0.32s cubic-bezier(0.34,1.4,0.64,1);}
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

/* ─── SKELETON LOADER ────────────────────────────────────────────── */
function SkeletonCard() {
  const shimmer = {
    background: "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
    backgroundSize: "800px 100%",
    animation: "shimmer 1.4s infinite linear",
    borderRadius: 8,
  };
  return (
    <div style={{ background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:16, padding:"24px 26px" }}>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
        <div style={{ ...shimmer, width:48, height:48, borderRadius:12, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ ...shimmer, width:"40%", height:12, marginBottom:8 }} />
          <div style={{ ...shimmer, width:"70%", height:18, marginBottom:10 }} />
          <div style={{ ...shimmer, width:"55%", height:11 }} />
        </div>
      </div>
      <div style={{ display:"flex", gap:8, marginTop:16 }}>
        {[60,80,70].map((w,i) => <div key={i} style={{ ...shimmer, width:w, height:24, borderRadius:20 }} />)}
      </div>
    </div>
  );
}

/* ─── JOB CARD ───────────────────────────────────────────────────── */
function JobCard({ job, index, onClick, saved, onSave, isMobile }) {
  const [ref, visible] = useIntersectionObserver();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <div
      ref={ref}
      onClick={() => onClick(job)}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: "#fff",
        border: job.featured ? "1.5px solid #111" : "1.5px solid #e8e8e8",
        borderRadius: isMobile ? 14 : 18,
        padding: isMobile ? "16px 18px" : "24px 26px",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.34, 1.5, 0.64, 1)",
        transform: !visible
          ? "translateY(36px) scale(0.97)"
          : hovered ? "translateY(-5px) scale(1.015)"
          : pressed ? "scale(0.97)"
          : "translateY(0) scale(1)",
        opacity: visible ? 1 : 0,
        transitionDelay: visible ? `${Math.min(index * 55, 400)}ms` : "0ms",
        boxShadow: hovered
          ? "0 24px 64px rgba(0,0,0,0.12)"
          : job.featured ? "0 4px 20px rgba(0,0,0,0.07)" : "0 2px 8px rgba(0,0,0,0.04)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Hover shimmer bar */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:2,
        background:"linear-gradient(90deg,#FF6B35,#635BFF,#FF6B35)",
        backgroundSize:"200% 100%",
        transform: hovered ? "scaleX(1)" : "scaleX(0)",
        transformOrigin:"left",
        transition:"transform 0.4s cubic-bezier(0.34,1.3,0.64,1)",
        borderRadius:"2px 2px 0 0",
      }} />

      {job.featured && (
        <div style={{
          position:"absolute", top:0, right:0,
          background:"#111", color:"#fff",
          fontSize:9, fontWeight:700, letterSpacing:1.4,
          padding:"4px 12px", borderRadius:"0 16px 0 10px",
          fontFamily:"'DM Mono',monospace",
        }}>FEATURED</div>
      )}

      <div style={{ display:"flex", alignItems:"flex-start", gap: isMobile ? 12 : 16 }}>
        <div style={{
          width: isMobile ? 42 : 50, height: isMobile ? 42 : 50, borderRadius:12,
          background:job.logoBg, color:job.logoColor,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: isMobile ? 18 : 22, fontWeight:800, flexShrink:0,
          fontFamily:"serif", boxShadow:"0 2px 10px rgba(0,0,0,0.14)",
          transition:"transform 0.35s cubic-bezier(0.34,1.5,0.64,1)",
          transform: hovered ? "rotate(-6deg) scale(1.12)" : "rotate(0deg) scale(1)",
        }}>{job.logo}</div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
            <p style={{ margin:0, fontSize:11, color:"#888", fontWeight:600, fontFamily:"'DM Mono',monospace", letterSpacing:0.3 }}>
              {job.company}
            </p>
            <button
              onClick={e => { e.stopPropagation(); onSave(job.id); }}
              style={{
                background:"none", border:"none", cursor:"pointer",
                fontSize:isMobile ? 16 : 18, padding:"2px 4px", lineHeight:1,
                transition:"transform 0.3s cubic-bezier(0.34,1.6,0.64,1)",
                transform: saved ? "scale(1.3)" : "scale(1)",
              }}
            >{saved ? "🔖" : "🤍"}</button>
          </div>
          <h3 style={{
            margin:"3px 0 7px", fontSize: isMobile ? 15 : 17, fontWeight:800, color:"#111",
            fontFamily:"'Playfair Display',serif", letterSpacing:-0.3,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>{job.title}</h3>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
            <span style={{ fontSize:11, color:"#666" }}>📍 {job.location}</span>
            <span style={{ color:"#ddd" }}>·</span>
            <span style={{ fontSize:11, color:"#666" }}>{job.type}</span>
            {!isMobile && <><span style={{ color:"#ddd" }}>·</span><span style={{ fontSize:11, color:"#111", fontWeight:700 }}>{job.salary}</span></>}
          </div>
          {isMobile && <p style={{ margin:"4px 0 0", fontSize:11, fontWeight:700, color:"#111" }}>{job.salary}</p>}
        </div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:14, alignItems:"center" }}>
        {job.tags.slice(0, isMobile ? 2 : 3).map(tag => (
          <span key={tag} style={{
            background:tagColors[tag] || "#f5f5f5", color:"#444",
            fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:20,
            fontFamily:"'DM Mono',monospace", letterSpacing:0.3,
            transition:"transform 0.2s",
          }}>{tag}</span>
        ))}
        {isMobile && job.tags.length > 2 && (
          <span style={{ fontSize:10, color:"#bbb", fontFamily:"'DM Mono',monospace" }}>+{job.tags.length - 2}</span>
        )}
        <span style={{ marginLeft:"auto", fontSize:10, color:"#ccc", fontFamily:"'DM Mono',monospace" }}>{job.posted}</span>
      </div>
    </div>
  );
}

/* ─── JOB DETAIL MODAL ───────────────────────────────────────────── */
function Modal({ job, onClose, saved, onSave, isMobile }) {
  const [visible, setVisible] = useState(false);
  const [applied, setApplied] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);
  const handleClose = () => { setVisible(false); setTimeout(onClose, 320); };

  return (
    <div
      onClick={handleClose}
      style={{
        position:"fixed", inset:0, zIndex:100,
        background: visible ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(6px)" : "blur(0px)",
        transition:"all 0.35s",
        display:"flex", alignItems: isMobile ? "flex-end" : "center", justifyContent:"center",
        padding: isMobile ? 0 : 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:"#fff",
          borderRadius: isMobile ? "22px 22px 0 0" : 22,
          padding: isMobile ? "24px 20px 32px" : "32px 32px 28px",
          width:"100%", maxWidth:560,
          maxHeight: isMobile ? "88vh" : "85vh",
          overflowY:"auto",
          transform: visible
            ? "translateY(0) scale(1)"
            : isMobile ? "translateY(100%)" : "translateY(30px) scale(0.95)",
          opacity: visible ? 1 : 0,
          transition:"all 0.4s cubic-bezier(0.34,1.15,0.64,1)",
          boxShadow: isMobile ? "0 -20px 80px rgba(0,0,0,0.2)" : "0 40px 120px rgba(0,0,0,0.25)",
        }}
      >
        {isMobile && <div style={{ width:36,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 20px",cursor:"pointer" }} onClick={handleClose} />}

        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:22 }}>
          <div style={{
            width:60, height:60, borderRadius:16,
            background:job.logoBg, color:job.logoColor,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:26, fontWeight:800, fontFamily:"serif",
            boxShadow:"0 6px 20px rgba(0,0,0,0.15)",
            animation:"float 3s ease-in-out infinite",
          }}>{job.logo}</div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:12, color:"#888", fontFamily:"'DM Mono',monospace", fontWeight:600 }}>{job.company}</p>
            <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:"#111", fontFamily:"'Playfair Display',serif", letterSpacing:-0.5 }}>{job.title}</h2>
          </div>
          {!isMobile && <button onClick={handleClose} style={{ background:"#f5f5f5",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",fontSize:18,color:"#888" }}>×</button>}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:22 }}>
          {[["📍","Location",job.location],["💼","Type",job.type],["💰","Salary",job.salary],["🕒","Posted",job.posted]].map(([icon,label,val]) => (
            <div key={label} style={{
              background:"#f8f8f8", borderRadius:12, padding:"12px 14px",
              transition:"transform 0.2s",
            }}>
              <p style={{ fontSize:10, color:"#bbb", fontFamily:"'DM Mono',monospace", marginBottom:3 }}>{icon} {label}</p>
              <p style={{ fontSize:13, fontWeight:700, color:"#111" }}>{val}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:10, fontWeight:700, color:"#bbb", letterSpacing:1.4, textTransform:"uppercase", marginBottom:10, fontFamily:"'DM Mono',monospace" }}>Skills Required</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {job.tags.map((tag,i) => (
              <span key={tag} style={{
                background:tagColors[tag]||"#f5f5f5", color:"#444",
                fontSize:12, fontWeight:600, padding:"6px 14px", borderRadius:20,
                fontFamily:"'DM Mono',monospace",
                animation:`slide-up 0.3s ease both`,
                animationDelay:`${i*60}ms`,
              }}>{tag}</span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:10, fontWeight:700, color:"#bbb", letterSpacing:1.4, textTransform:"uppercase", marginBottom:10, fontFamily:"'DM Mono',monospace" }}>About the Role</p>
          <p style={{ fontSize:14, color:"#555", lineHeight:1.75 }}>
            Join a world-class team at <strong>{job.company}</strong> and help shape the future. You'll work closely with cross-functional teams, tackle ambitious problems, and ship work that reaches millions of users every day. We value craft, curiosity, and a bias for action.
          </p>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button
            onClick={() => setApplied(true)}
            style={{
              flex:1, background: applied ? "#10B981" : "#111", color:"#fff",
              border:"none", borderRadius:14, padding:"15px 0",
              fontSize:14, fontWeight:700, cursor:"pointer",
              fontFamily:"'DM Mono',monospace", letterSpacing:0.5,
              transition:"all 0.4s cubic-bezier(0.34,1.3,0.64,1)",
              transform: applied ? "scale(1.03)" : "scale(1)",
            }}
          >{applied ? "✓ Applied!" : "Apply Now →"}</button>
          <button
            onClick={() => onSave(job.id)}
            style={{
              background: saved ? "#111" : "#f5f5f5", color: saved ? "#fff" : "#111",
              border:"none", borderRadius:14, padding:"15px 20px",
              fontSize:18, cursor:"pointer",
              transition:"all 0.3s cubic-bezier(0.34,1.5,0.64,1)",
              transform: saved ? "scale(1.1)" : "scale(1)",
            }}
          >{saved ? "🔖" : "🤍"}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── POST JOB FORM COMPONENTS ───────────────────────────────────── */
function StepIndicator({ current }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:28 }}>
      {STEPS.map((step, i) => (
        <div key={step.id} style={{ display:"flex", alignItems:"center" }}>
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background: current > step.id ? "#111" : current === step.id ? "#FF6B35" : "#f0f0f0",
            color: current >= step.id ? "#fff" : "#bbb",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize: current > step.id ? 14 : 12, fontWeight:700,
            transition:"all 0.4s cubic-bezier(0.34,1.3,0.64,1)",
            transform: current === step.id ? "scale(1.18)" : "scale(1)",
            boxShadow: current === step.id ? "0 4px 16px rgba(255,107,53,0.45)" : "none",
            fontFamily:"'DM Mono',monospace",
          }}>
            {current > step.id ? "✓" : step.id}
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              width:40, height:2, borderRadius:1,
              background: current > step.id + 1 ? "#111" : current > step.id ? "#FF6B35" : "#f0f0f0",
              transition:"background 0.4s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type="text", required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:10, fontWeight:700, color:"#888", letterSpacing:1.2, textTransform:"uppercase", marginBottom:6, fontFamily:"'DM Mono',monospace" }}>
        {label}{required && <span style={{ color:"#FF6B35" }}> *</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width:"100%", border: focused ? "1.5px solid #111" : "1.5px solid #e8e8e8",
          borderRadius:12, padding:"12px 14px", fontSize:14, color:"#111",
          background: focused ? "#fafafa" : "#fff", outline:"none",
          fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s", boxSizing:"border-box",
          boxShadow: focused ? "0 0 0 4px rgba(0,0,0,0.05)" : "none",
        }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:10, fontWeight:700, color:"#888", letterSpacing:1.2, textTransform:"uppercase", marginBottom:6, fontFamily:"'DM Mono',monospace" }}>
        {label}{required && <span style={{ color:"#FF6B35" }}> *</span>}
      </label>
      <select value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width:"100%", border: focused ? "1.5px solid #111" : "1.5px solid #e8e8e8",
          borderRadius:12, padding:"12px 14px", fontSize:14, color: value ? "#111" : "#aaa",
          background:"#fff", outline:"none", fontFamily:"'DM Sans',sans-serif",
          transition:"all 0.2s", boxSizing:"border-box", cursor:"pointer", appearance:"none",
          boxShadow: focused ? "0 0 0 4px rgba(0,0,0,0.05)" : "none",
        }}
      >
        <option value="" disabled>Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:10, fontWeight:700, color:"#888", letterSpacing:1.2, textTransform:"uppercase", marginBottom:6, fontFamily:"'DM Mono',monospace" }}>
        {label}{required && <span style={{ color:"#FF6B35" }}> *</span>}
      </label>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={4}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width:"100%", border: focused ? "1.5px solid #111" : "1.5px solid #e8e8e8",
          borderRadius:12, padding:"12px 14px", fontSize:14, color:"#111",
          background: focused ? "#fafafa" : "#fff", outline:"none",
          fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
          boxSizing:"border-box", resize:"vertical",
          boxShadow: focused ? "0 0 0 4px rgba(0,0,0,0.05)" : "none",
        }}
      />
    </div>
  );
}

/* ─── POST JOB MODAL ─────────────────────────────────────────────── */
function PostJobModal({ onClose, onPost, isMobile }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [confetti, setConfetti] = useState([]);

  const [form, setForm] = useState({
    company:"", title:"", category:"", type:"", location:"",
    salaryMin:"", salaryMax:"", description:"",
    tags:[], applyEmail:"", featured:false,
    logoColor:"#fff", logoBg:"#111",
  });

  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);
  const set = (key, val) => setForm(f => ({ ...f, [key]:val }));

  const goTo = (nextStep) => {
    if (animating) return;
    setDirection(nextStep > step ? 1 : -1);
    setAnimating(true);
    setTimeout(() => { setStep(nextStep); setAnimating(false); }, 230);
  };

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().replace(/,$/, "");
      if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
      setTagInput("");
    }
  };
  const removeTag = t => set("tags", form.tags.filter(x => x !== t));

  const handleClose = () => { setVisible(false); setTimeout(onClose, 320); };

  const handleSubmit = () => {
    const pieces = Array.from({ length: 14 }, (_, i) => ({
      id:i, color:["#FF6B35","#111","#5E6AD2","#10B981","#F59E0B","#EC4899"][i%6],
      x: Math.random()*280 - 20, delay: Math.random()*0.4,
    }));
    setConfetti(pieces);
    setSubmitted(true);
    const newJob = {
      id: Date.now(), title:form.title, company:form.company,
      logo: form.company[0]?.toUpperCase() || "?",
      logoColor:form.logoColor, logoBg:form.logoBg,
      location:form.location, type:form.type,
      salary: form.salaryMin && form.salaryMax ? `$${form.salaryMin}k – $${form.salaryMax}k` : "Competitive",
      tags:form.tags, posted:"Just now", featured:form.featured, category:form.category,
    };
    setTimeout(() => { onPost(newJob); handleClose(); }, 2000);
  };

  const canNext = () => {
    if (step===1) return form.company.trim().length > 0;
    if (step===2) return form.title.trim().length > 0 && form.category && form.type;
    if (step===3) return form.location.trim().length > 0;
    return true;
  };

  const stepContent = () => {
    switch(step) {
      case 1: return (
        <div>
          <h3 style={{ margin:"0 0 4px", fontSize:isMobile?18:20, fontWeight:800, fontFamily:"'Playfair Display',serif" }}>Company Info</h3>
          <p style={{ margin:"0 0 20px", fontSize:13, color:"#888" }}>Tell us about the hiring company</p>
          <InputField label="Company Name" value={form.company} onChange={e=>set("company",e.target.value)} placeholder="e.g. Acme Corp" required />
          <InputField label="Apply Email" value={form.applyEmail} onChange={e=>set("applyEmail",e.target.value)} placeholder="hiring@company.com" type="email" />
        </div>
      );
      case 2: return (
        <div>
          <h3 style={{ margin:"0 0 4px", fontSize:isMobile?18:20, fontWeight:800, fontFamily:"'Playfair Display',serif" }}>Role Details</h3>
          <p style={{ margin:"0 0 20px", fontSize:13, color:"#888" }}>Describe the position</p>
          <InputField label="Job Title" value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Senior Frontend Engineer" required />
          <SelectField label="Category" value={form.category} onChange={e=>set("category",e.target.value)} options={["Engineering","Design","Marketing","Product","Operations","Sales","Finance","HR"]} required />
          <SelectField label="Employment Type" value={form.type} onChange={e=>set("type",e.target.value)} options={["Full-time","Part-time","Contract","Internship","Freelance"]} required />
          <TextAreaField label="Job Description" value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Describe the role, responsibilities, and what success looks like..." required />
        </div>
      );
      case 3: return (
        <div>
          <h3 style={{ margin:"0 0 4px", fontSize:isMobile?18:20, fontWeight:800, fontFamily:"'Playfair Display',serif" }}>Compensation & Skills</h3>
          <p style={{ margin:"0 0 20px", fontSize:13, color:"#888" }}>Help candidates know what to expect</p>
          <InputField label="Location" value={form.location} onChange={e=>set("location",e.target.value)} placeholder="e.g. New York, NY or Remote" required />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <InputField label="Min Salary (k)" value={form.salaryMin} onChange={e=>set("salaryMin",e.target.value)} placeholder="120" type="number" />
            <InputField label="Max Salary (k)" value={form.salaryMax} onChange={e=>set("salaryMax",e.target.value)} placeholder="160" type="number" />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:10, fontWeight:700, color:"#888", letterSpacing:1.2, textTransform:"uppercase", marginBottom:6, fontFamily:"'DM Mono',monospace" }}>Skills / Tags</label>
            <div style={{ border:"1.5px solid #e8e8e8", borderRadius:12, padding:"10px 12px", background:"#fff", display:"flex", flexWrap:"wrap", gap:6, alignItems:"center", minHeight:48 }}>
              {form.tags.map(t => (
                <span key={t} className="tag-enter" style={{ background:"#f0f0f0", color:"#444", fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20, display:"flex", alignItems:"center", gap:5, fontFamily:"'DM Mono',monospace" }}>
                  {t}<span onClick={()=>removeTag(t)} style={{ cursor:"pointer", color:"#999", fontSize:14, lineHeight:1 }}>×</span>
                </span>
              ))}
              <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={addTag}
                placeholder={form.tags.length===0 ? "Type skill + Enter" : "Add more…"}
                style={{ border:"none", outline:"none", fontSize:13, color:"#111", minWidth:120, fontFamily:"'DM Sans',sans-serif", flex:1, background:"transparent" }}
              />
            </div>
            <p style={{ margin:"4px 0 0", fontSize:10, color:"#ccc", fontFamily:"'DM Mono',monospace" }}>Press Enter to add a skill tag</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#f8f8f8", borderRadius:12, padding:"14px 16px" }}>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#111" }}>⭐ Featured Listing</p>
              <p style={{ margin:0, fontSize:11, color:"#aaa" }}>Appear at the top with a badge</p>
            </div>
            <div onClick={()=>set("featured",!form.featured)} style={{
              width:46, height:26, borderRadius:13, cursor:"pointer",
              background: form.featured ? "#111" : "#ddd",
              position:"relative", transition:"background 0.3s", flexShrink:0,
            }}>
              <div style={{
                width:20, height:20, borderRadius:"50%", background:"#fff",
                position:"absolute", top:3,
                left: form.featured ? 23 : 3,
                transition:"left 0.3s cubic-bezier(0.34,1.5,0.64,1)",
                boxShadow:"0 1px 4px rgba(0,0,0,0.2)",
              }} />
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div>
          <h3 style={{ margin:"0 0 4px", fontSize:isMobile?18:20, fontWeight:800, fontFamily:"'Playfair Display',serif" }}>Preview & Publish</h3>
          <p style={{ margin:"0 0 20px", fontSize:13, color:"#888" }}>Here's how your listing will look</p>
          <div style={{ border:"1.5px solid #e8e8e8", borderRadius:16, padding:"20px", background:"#fff", marginBottom:16, boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
            {form.featured && <div style={{ fontSize:9,fontWeight:700,letterSpacing:1.4,color:"#fff",background:"#111",display:"inline-block",padding:"3px 10px",borderRadius:20,marginBottom:10,fontFamily:"'DM Mono',monospace" }}>FEATURED</div>}
            <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
              <div style={{ width:46,height:46,borderRadius:12,background:form.logoBg,color:form.logoColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,fontFamily:"serif",boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }}>
                {form.company[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p style={{ margin:0,fontSize:11,color:"#888",fontFamily:"'DM Mono',monospace" }}>{form.company}</p>
                <h4 style={{ margin:"2px 0 5px",fontSize:16,fontWeight:800,color:"#111",fontFamily:"'Playfair Display',serif" }}>{form.title}</h4>
                <p style={{ margin:0,fontSize:11,color:"#666" }}>📍 {form.location} · {form.type}{form.salaryMin && form.salaryMax ? ` · $${form.salaryMin}k–$${form.salaryMax}k`:""}</p>
              </div>
            </div>
            {form.tags.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {form.tags.map(t => <span key={t} style={{ background:"#f0f0f0",color:"#444",fontSize:10,fontWeight:600,padding:"4px 10px",borderRadius:20,fontFamily:"'DM Mono',monospace" }}>{t}</span>)}
              </div>
            )}
          </div>
          {form.description && (
            <div style={{ background:"#f8f8f8", borderRadius:12, padding:"14px 16px" }}>
              <p style={{ margin:"0 0 4px",fontSize:10,fontWeight:700,color:"#bbb",letterSpacing:1.2,textTransform:"uppercase",fontFamily:"'DM Mono',monospace" }}>Description</p>
              <p style={{ margin:0,fontSize:13,color:"#555",lineHeight:1.65 }}>{form.description}</p>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div onClick={handleClose} style={{
      position:"fixed", inset:0, zIndex:200,
      background: visible ? "rgba(0,0,0,0.58)" : "rgba(0,0,0,0)",
      backdropFilter: visible ? "blur(8px)" : "blur(0px)",
      transition:"all 0.35s",
      display:"flex", alignItems: isMobile ? "flex-end" : "center", justifyContent:"center",
      padding: isMobile ? 0 : 20,
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#fff",
        borderRadius: isMobile ? "24px 24px 0 0" : 22,
        padding: isMobile ? "24px 20px 32px" : "32px",
        width:"100%", maxWidth:520,
        maxHeight: isMobile ? "92vh" : "88vh",
        overflowY:"auto",
        transform: visible
          ? "translateY(0) scale(1)"
          : isMobile ? "translateY(100%)" : "translateY(40px) scale(0.94)",
        opacity: visible ? 1 : 0,
        transition:"all 0.42s cubic-bezier(0.34,1.1,0.64,1)",
        boxShadow: isMobile ? "0 -24px 80px rgba(0,0,0,0.22)" : "0 40px 120px rgba(0,0,0,0.28)",
        position:"relative", overflow:"hidden",
      }}>
        {/* Confetti */}
        {confetti.map(c => (
          <div key={c.id} style={{
            position:"absolute", top:20, left:c.x, width:8, height:8,
            background:c.color, borderRadius:2,
            animation:`confetti-fall 1.2s ease-in ${c.delay}s both`,
            pointerEvents:"none",
          }} />
        ))}

        {isMobile && <div style={{ width:36,height:4,background:"#e0e0e0",borderRadius:2,margin:"0 auto 20px",cursor:"pointer" }} onClick={handleClose} />}

        {submitted ? (
          <div style={{ textAlign:"center", padding:"40px 20px" }}>
            <div style={{ fontSize:56, marginBottom:16, animation:"float 2s ease-in-out infinite" }}>🎉</div>
            <h3 style={{ margin:"0 0 8px", fontSize:24, fontWeight:800, fontFamily:"'Playfair Display',serif" }}>Job Posted!</h3>
            <p style={{ fontSize:14, color:"#888" }}>Your listing is live on the board.</p>
          </div>
        ) : (
          <>
            <StepIndicator current={step} />
            <div style={{
              opacity: animating ? 0 : 1,
              transform: animating ? `translateX(${direction * 28}px)` : "translateX(0)",
              transition:"opacity 0.2s, transform 0.2s",
            }}>
              {stepContent()}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:24 }}>
              {step > 1 && (
                <button onClick={()=>goTo(step-1)} style={{
                  flex:1, background:"#f5f5f5", color:"#111", border:"none",
                  borderRadius:14, padding:"15px 0", fontSize:14, fontWeight:700,
                  cursor:"pointer", fontFamily:"'DM Mono',monospace", transition:"transform 0.15s",
                }}
                  onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
                  onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
                >← Back</button>
              )}
              {step < 4 ? (
                <button onClick={()=>canNext()&&goTo(step+1)} style={{
                  flex:2, background: canNext() ? "#111" : "#e8e8e8",
                  color: canNext() ? "#fff" : "#aaa", border:"none",
                  borderRadius:14, padding:"15px 0", fontSize:14, fontWeight:700,
                  cursor: canNext() ? "pointer" : "not-allowed",
                  fontFamily:"'DM Mono',monospace", letterSpacing:0.5,
                  transition:"all 0.25s cubic-bezier(0.34,1.3,0.64,1)",
                  transform: canNext() ? "scale(1)" : "scale(0.98)",
                }}
                  onMouseDown={e=>canNext()&&(e.currentTarget.style.transform="scale(0.97)")}
                  onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
                >Continue →</button>
              ) : (
                <button onClick={handleSubmit} style={{
                  flex:2, background:"#FF6B35", color:"#fff", border:"none",
                  borderRadius:14, padding:"15px 0", fontSize:15, fontWeight:700,
                  cursor:"pointer", fontFamily:"'DM Mono',monospace", letterSpacing:0.5,
                  boxShadow:"0 8px 24px rgba(255,107,53,0.4)",
                  transition:"transform 0.15s, box-shadow 0.15s",
                }}
                  onMouseDown={e=>{ e.currentTarget.style.transform="scale(0.96)"; e.currentTarget.style.boxShadow="0 3px 10px rgba(255,107,53,0.3)"; }}
                  onMouseUp={e=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(255,107,53,0.4)"; }}
                >🚀 Publish Job</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────────── */
export default function App() {
  const { w } = useWindowSize();
  const isMobile = w < 600;
  const isTablet = w >= 600 && w < 900;

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [postingJob, setPostingJob] = useState(false);
  const [allJobs, setAllJobs] = useState(jobs);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    setTimeout(() => setLoading(false), 900);
  }, []);

  const filtered = allJobs.filter(j => {
    const matchCat = activeCategory === "All" || j.category === activeCategory;
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const toggleSave = id => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const maxWidth = isTablet ? 720 : isMobile ? "100%" : 760;

  return (
    <div style={{ minHeight:"100vh", background:"#F5F2EE", fontFamily:"'DM Sans',sans-serif" }}>
      <GlobalStyles />

      {/* ── HEADER ── */}
      <div style={{
        background:"rgba(255,255,255,0.92)", backdropFilter:"blur(12px)",
        borderBottom:"1.5px solid #ebebeb",
        position:"sticky", top:0, zIndex:50,
      }}>
        <div style={{ maxWidth, margin:"0 auto", padding: isMobile ? "14px 16px" : "16px 24px" }}>
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            transform: mounted ? "translateY(0)" : "translateY(-16px)",
            opacity: mounted ? 1 : 0,
            transition:"all 0.55s cubic-bezier(0.34,1.2,0.64,1)",
            pointerEvents:"all",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ animation: mounted ? "float 4s ease-in-out infinite" : "none" }}>
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <rect width="34" height="34" rx="10" fill="#111"/>
                  <path d="M17 8C12.03 8 8 12.03 8 17C8 21.97 12.03 26 17 26C20.4 26 23.36 24.1 24.9 21.3H19.5V18.5H28C28 18.5 28 17.75 28 17C28 12.03 23.97 8 17 8Z" fill="white"/>
                  <circle cx="17" cy="17" r="3" fill="#FF6B35" style={{ animation:"pulse-dot 2s ease-in-out infinite" }}/>
                </svg>
              </div>
              <div>
                <h1 style={{ margin:0, fontSize: isMobile ? 20 : 22, fontWeight:800, color:"#111", fontFamily:"'Playfair Display',serif", letterSpacing:-0.5 }}>
                  Gig<span style={{ color:"#FF6B35" }}>ro</span>
                </h1>
                <p style={{ margin:0, fontSize:10, color:"#aaa", fontFamily:"'DM Mono',monospace" }}>
                  {filtered.length} positions open
                </p>
              </div>
            </div>
            <button onClick={() => setPostingJob(true)} style={{
              background:"#111", color:"#fff",
              borderRadius:20, padding: isMobile ? "8px 14px" : "8px 20px",
              fontSize: isMobile ? 11 : 12, fontWeight:700,
              fontFamily:"'DM Mono',monospace", cursor:"pointer", border:"none",
              transition:"all 0.25s cubic-bezier(0.34,1.4,0.64,1)",
              boxShadow:"0 2px 12px rgba(0,0,0,0.18)",
              position:"relative", zIndex:60,
            }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.07) translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.25)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1) translateY(0)"; e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.18)"; }}
            >+ Post a Job</button>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth, margin:"0 auto", padding: isMobile ? "20px 14px 80px" : "28px 24px 80px" }}>

        {/* Search */}
        <div style={{
          transform: mounted ? "translateY(0)" : "translateY(18px)",
          opacity: mounted ? 1 : 0,
          transition:"all 0.5s cubic-bezier(0.34,1.2,0.64,1) 0.08s",
          marginBottom:16,
        }}>
          <div style={{
            background:"#fff", border:"1.5px solid #e8e8e8", borderRadius:16,
            display:"flex", alignItems:"center", padding:"0 16px",
            boxShadow:"0 2px 16px rgba(0,0,0,0.06)",
            transition:"box-shadow 0.2s, border-color 0.2s",
          }}
            onFocus={e=>e.currentTarget.style.borderColor="#111"}
            onBlur={e=>e.currentTarget.style.borderColor="#e8e8e8"}
          >
            <span style={{ fontSize:15, marginRight:10, opacity:0.5 }}>🔍</span>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Search roles, companies, skills…"
              style={{
                flex:1, border:"none", outline:"none", background:"transparent",
                fontSize: isMobile ? 13 : 14, color:"#111",
                padding:"14px 0", fontFamily:"'DM Sans',sans-serif",
              }}
            />
            {search && (
              <button onClick={()=>setSearch("")} style={{ background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:20,lineHeight:1,padding:"0 2px",transition:"color 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#111"}
                onMouseLeave={e=>e.currentTarget.style.color="#bbb"}
              >×</button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div style={{
          display:"flex", gap:8, marginBottom:24,
          overflowX:"auto", scrollbarWidth:"none", paddingBottom:2,
          transform: mounted ? "translateY(0)" : "translateY(18px)",
          opacity: mounted ? 1 : 0,
          transition:"all 0.5s cubic-bezier(0.34,1.2,0.64,1) 0.14s",
        }}>
          {categories.map((cat,i) => (
            <button key={cat} onClick={()=>setActiveCategory(cat)} style={{
              background: activeCategory===cat ? "#111" : "#fff",
              color: activeCategory===cat ? "#fff" : "#666",
              border: activeCategory===cat ? "1.5px solid #111" : "1.5px solid #e8e8e8",
              borderRadius:20, padding: isMobile ? "7px 14px" : "8px 18px",
              fontSize: isMobile ? 12 : 13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
              fontFamily:"'DM Sans',sans-serif",
              transition:"all 0.28s cubic-bezier(0.34,1.5,0.64,1)",
              transform: activeCategory===cat ? "scale(1.06)" : "scale(1)",
              boxShadow: activeCategory===cat ? "0 3px 12px rgba(0,0,0,0.15)" : "none",
              animationDelay:`${i*40}ms`,
            }}>{cat}</button>
          ))}
        </div>



        {/* Cards grid */}
        <div style={{
          display:"grid",
          gridTemplateColumns: !isMobile && !isTablet ? "1fr 1fr" : "1fr",
          gap: isMobile ? 12 : 16,
        }}>
          {loading ? (
            Array.from({length:4}).map((_,i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"70px 0", color:"#ccc", animation:"slide-up 0.4s ease both" }}>
              <div style={{ fontSize:52, marginBottom:14 }}>🕵️</div>
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:13 }}>No matching jobs found</p>
            </div>
          ) : (
            filtered.map((job,i) => (
              <JobCard key={job.id} job={job} index={i} onClick={setSelectedJob}
                saved={savedJobs.has(job.id)} onSave={toggleSave} isMobile={isMobile} />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {postingJob && (
        <PostJobModal
          onClose={()=>setPostingJob(false)}
          onPost={newJob=>{ setAllJobs(prev=>[newJob,...prev]); setPostingJob(false); }}
          isMobile={isMobile}
        />
      )}
      {selectedJob && (
        <Modal job={selectedJob} onClose={()=>setSelectedJob(null)}
          saved={savedJobs.has(selectedJob.id)} onSave={toggleSave} isMobile={isMobile} />
      )}
    </div>
  );
}
