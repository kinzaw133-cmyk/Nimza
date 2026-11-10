"use client";
import { useEffect,useState } from "react";import { useRouter } from "next/navigation";import { supabase } from "@/lib/supabase";import { useAuth } from "@/lib/useAuth";import { toast } from "@/lib/notify";
const ST=["Pending","Preparing","Ready","Delivered"];
export default function AdminOrders(){const {role,loading}=useAuth();const r=useRouter();const [o,setO]=useState<any[]>([]);const [res,setRes]=useState<any[]>([]);
 const load=async()=>{setO((await supabase.from("orders").select("*,order_items(quantity,menu_items(name,price))").order("id",{ascending:false})).data||[]);setRes((await supabase.from("reservations").select("*").order("reserved_at")).data||[])};
 useEffect(()=>{if(loading)return;if(role!=="admin"){toast("Admins only","error");r.push("/");return}load();const ch=supabase.channel("all-orders").on("postgres_changes",{event:"*",schema:"public",table:"orders"},()=>load()).subscribe();return()=>{supabase.removeChannel(ch)}},[role,loading]);
 async function set(id:number,status:string){const {error}=await supabase.from("orders").update({status}).eq("id",id);error?toast(error.message,"error"):toast(`Order #${id} marked ${status}`)}
 return(<main className="mx-auto min-h-screen max-w-5xl px-6 pb-24 pt-32"><h1 className="font-serif text-5xl text-olive">Orders (live)</h1>{!o.length&&<p className="mt-6">No orders yet.</p>}
 {o.map(x=><div key={x.id} className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5"><div><b>#{x.id}</b> · ${Number(x.total).toFixed(2)} · {new Date(x.created_at).toLocaleString()}<p className="text-sm text-charcoal/70">{x.order_items?.map((i:any)=>`${i.quantity}× ${i.menu_items?.name||"Item"}`).join(", ")}</p></div>
 <select className="inp !w-auto" value={x.status} onChange={e=>set(x.id,e.target.value)} aria-label="Status">{ST.map(s=><option key={s}>{s}</option>)}</select></div>)}
 <h2 className="mt-12 font-serif text-3xl text-olive">Reservations</h2>{res.map(x=><p key={x.id} className="mt-2 rounded-2xl bg-white p-4">{new Date(x.reserved_at).toLocaleString()} · Table {x.table_no} · {x.name} · {x.guests} guests · {x.phone}</p>)}</main>)}
