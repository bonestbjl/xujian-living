import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { ClipboardCheck, FileText, Home, Images, Menu, MessageCircle, X } from "lucide-react";
import { brand } from "../config/brand";
import { contact } from "../config/contact";
import { LeadForm } from "./LeadForm";

const nav = [
  ["首页", "/"],
  ["案例", "/cases"],
  ["空间效果", "/inspiration"],
  ["预算规划", "/budget"],
  ["材料与工艺", "/materials"],
  ["关于我们", "/about"]
];

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  return (
    <>
      <header className="site-header">
        <Link className="brand-mark" to="/">
          <span>{brand.cnName}</span>
          <small>{brand.enName}</small>
        </Link>
        <nav className="desktop-nav">
          {nav.map(([label, path]) => (
            <NavLink key={path} to={path}>{label}</NavLink>
          ))}
        </nav>
        <NavLink className="button small dark nav-cta" to="/diagnosis">开始空间诊断</NavLink>
        <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="打开菜单">
          <Menu />
        </button>
      </header>
      {menuOpen && (
        <div className="mobile-menu">
          <button className="icon-button close" onClick={() => setMenuOpen(false)} aria-label="关闭菜单">
            <X />
          </button>
          {nav.map(([label, path]) => (
            <NavLink key={path} to={path} onClick={() => setMenuOpen(false)}>{label}</NavLink>
          ))}
          <NavLink to="/diagnosis" onClick={() => setMenuOpen(false)}>开始空间诊断</NavLink>
        </div>
      )}
      <main>
        <Outlet context={{ openLead: () => setLeadOpen(true) }} />
      </main>
      <footer className="site-footer">
        <div>
          <h2>{brand.cnName}</h2>
          <p>{brand.slogan}</p>
          <p className="muted">{brand.intro}</p>
        </div>
        <div>
          <strong>{contact.studioName}</strong>
          <p>{contact.demoAddress}</p>
          <p>服务城市：{contact.serviceCities.join(" / ")}</p>
        </div>
      </footer>
      <nav className="bottom-tabs">
        <NavLink to="/"><Home size={18} />首页</NavLink>
        <NavLink to="/diagnosis"><ClipboardCheck size={18} />诊断</NavLink>
        <NavLink to="/cases"><Images size={18} />案例</NavLink>
        <NavLink to="/diagnosis/result"><FileText size={18} />我的结果</NavLink>
        <button onClick={() => setLeadOpen(true)}><MessageCircle size={18} />咨询</button>
      </nav>
      <LeadForm open={leadOpen} onClose={() => setLeadOpen(false)} sourcePage="全站咨询入口" />
    </>
  );
}
