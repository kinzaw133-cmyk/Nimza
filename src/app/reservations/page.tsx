"use client";
import { useEffect,useState } from "react";import { useRouter } from "next/navigation";import { CalendarCheck } from "lucide-react";import { supabase } from "@/lib/supabase";import { useAuth } from "@/lib/useAuth";import { toast } from "@/lib/notify";
export default function Res(){const {user}=useAuth();const r=useRouter();const [f,setF]=useState({name:"",phone:"",date:"",time:"19:00",guests:2,table_no:1});const [l,setL]=useState<any[]>([]);
 const load=async(u:any)=>{const {data}=await supabase.from("reservations").select("*").eq("user_id",u.id).order("reserved_at");setL(data||[])};useEffect(()=>{if(user)load(user)},[user]);
 async function go(e:any){e.preventDefault();if(!user){toast("Please log in to reserve","info");r.push("/login");return}
  if(!/^[0-9+ ]{7,15}$/.test(f.phone)){toast("Enter a valid phone number","error");return}
  const {error}=await supabase.from("reservations").insert({user_id:user.id,name:f.name,phone:f.phone,table_no:f.table_no,guests:f.guests,reserved_at:`${f.date}T${f.time}:00`});
  if(error)toast(error.message,"error");else{toast(`Table ${f.table_no} booked for ${f.date} at ${f.time}`);load(user)}}
 const s=(k:string,n=false)=>(e:any)=>setF({...f,[k]:n?Number(e.target.value):e.target.value});
 return(<main className="mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-32"><h1 className="font-serif text-5xl text-olive">Reserve a table</h1>
 <form onSubmit={go} className="mt-8 grid gap-4 rounded-3xl bg-white p-8 shadow-sm sm:grid-cols-2"><input required minLength={2} className="inp" placeholder="Full name" onChange={s("name")}/><input required className="inp" placeholder="Phone" onChange={s("phone")}/>
 <input required type="date" min={new Date().toISOString().slice(0,10)} className="inp" onChange={s("date")}/><select className="inp" value={f.time} onChange={s("time")}>{["18:00","19:00","20:00","21:00"].map(t=><option key={t}>{t}</option>)}</select>
 <input type="number" min={1} max={12} className="inp" value={f.guests} onChange={s("guests",true)} aria-label="Guests"/><select className="inp" value={f.table_no} onChange={s("table_no",true)}>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>Table {i+1}</option>)}</select>
 <button className="btn-d justify-center sm:col-span-2"><CalendarCheck/>Confirm booking</button></form>
 {!!l.length&&<><h2 className="mt-10 font-serif text-3xl text-olive">Your bookings</h2>{l.map(x=><p key={x.id} className="mt-2 rounded-2xl bg-white p-4">{new Date(x.reserved_at).toLocaleString()} · Table {x.table_no} · {x.guests} guests</p>)}</>}</main>)}
