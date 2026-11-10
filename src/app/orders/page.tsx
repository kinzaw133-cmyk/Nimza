"use client";
import { useEffect,useState } from "react";import { useRouter } from "next/navigation";import { supabase } from "@/lib/supabase";import { useAuth } from "@/lib/useAuth";import { toast } from "@/lib/notify";
const ST=["Pending","Preparing","Ready","Delivered"];
export default function Orders(){const {user,loading}=useAuth();const r=useRouter();const [o,setO]=useState<any[]>([]);
 useEffect(()=>{if(loading)return;if(!user){r.push("/login");return}
  const load=async()=>{const {data}=await supabase.from("orders").select("*,order_items(quantity,menu_items(name,price))").eq("user_id",user.id).order("created_at",{ascending:false});setO(data||[])};load();
  const ch=supabase.channel("my-orders").on("postgres_changes",{event:"UPDATE",schema:"public",table:"orders",filter:`user_id=eq.${user.id}`},(p:any)=>{toast(`Order #${p.new.id} is now ${p.new.status}`,"info");load()}).subscribe();return()=>{supabase.removeChannel(ch)}},[user,loading]);
 return(<main className="mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-32"><h1 className="font-serif text-5xl text-olive">My orders</h1><p className="mt-2 text-sm text-charcoal/60">Status updates live.</p>{!o.length&&<p className="mt-8">No orders yet.</p>}
 {o.map(x=><div key={x.id} className="mt-5 rounded-3xl bg-white p-6 shadow-sm"><div className="flex justify-between"><b>Order #{x.id}</b><b>${Number(x.total).toFixed(2)}</b></div><p className="mt-1 text-sm text-charcoal/70">{x.order_items?.map((i:any)=>`${i.quantity}× ${i.menu_items?.name||"Item"}`).join(", ")}</p>
 <div className="mt-4 grid grid-cols-4 gap-2">{ST.map((s,k)=><div key={s} className={`rounded-lg py-2 text-center text-xs font-bold ${k<=ST.indexOf(x.status)?"bg-gold text-olive":"bg-ivory text-charcoal/50"}`}>{s}</div>)}</div></div>)}</main>)}
