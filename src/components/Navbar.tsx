"use client";
import Link from "next/link";import { usePathname } from "next/navigation";import { useEffect,useState } from "react";
import { ShoppingBag,Menu,X,User,LogOut } from "lucide-react";import { supabase } from "@/lib/supabase";import { useAuth } from "@/lib/useAuth";import { useCart } from "./Cart";import { toast } from "@/lib/notify";
export default function Navbar(){const p=usePathname();const {user,role}=useAuth();const {count}=useCart();const [sc,setSc]=useState(false);const [o,setO]=useState(false);
 useEffect(()=>{const f=()=>setSc(scrollY>60);f();addEventListener("scroll",f,{passive:true});return()=>removeEventListener("scroll",f)},[]);
 const solid=sc||p!=="/";const L=[["Home","/"],["Menu","/menu"],["About","/about"],["Gallery","/gallery"],["Reservations","/reservations"],["Contact","/contact"],...(user?[["My Orders","/orders"]]:[]),...(role==="admin"?[["Admin Menu","/admin/menu"],["Admin Orders","/admin/orders"]]:[])];
 return(<header className={`fixed inset-x-0 top-0 z-50 text-charcoal transition-all duration-500 bg-ivory/90 backdrop-blur-md border-b border-gold/30 ${sc?"py-1 shadow-lg":"py-2"}`}><nav className="mx-auto flex max-w-7xl items-center justify-between px-5">
 <Link href="/"><img src="/logo-header.jpg" alt="Nimza Restaurant" className="h-14 w-auto mix-blend-multiply"/></Link>
 <ul className="hidden gap-6 text-sm lg:flex">{L.map(([a,b])=><li key={b}><Link href={b} className={`hover:text-gold ${p===b?"text-gold":""}`}>{a}</Link></li>)}</ul>
 <div className="flex items-center gap-4"><Link href="/cart" aria-label="Cart" className="relative hover:text-gold"><ShoppingBag size={22}/>{count>0&&<span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-gold text-[11px] font-bold text-olive">{count}</span>}</Link>
 {user?<button aria-label="Log out" className="hover:text-gold" onClick={async()=>{await supabase.auth.signOut();toast("Logged out","info");location.href="/"}}><LogOut size={22}/></button>:<Link href="/login" aria-label="Login" className="hover:text-gold"><User size={22}/></Link>}
 <button className="lg:hidden" aria-label="Menu" onClick={()=>setO(!o)}>{o?<X size={26}/>:<Menu size={26}/>}</button></div></nav>
 {o&&<div className="bg-ivory px-5 pb-4 lg:hidden">{L.map(([a,b])=><Link key={b} href={b} onClick={()=>setO(false)} className="block py-2">{a}</Link>)}</div>}</header>)}
