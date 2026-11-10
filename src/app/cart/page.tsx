"use client";
import { useRouter } from "next/navigation";import Link from "next/link";import { Minus,Plus,ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";import { useCart } from "@/components/Cart";import { toast } from "@/lib/notify";
export default function Cart(){const {items,chg,clear,total}=useCart();const r=useRouter();
 async function place(){const {data:{user}}=await supabase.auth.getUser();if(!user){toast("Please log in to place your order","info");r.push("/login");return}
  const {data:o,error}=await supabase.from("orders").insert({user_id:user.id,total}).select().single();if(error){toast(error.message,"error");return}
  const e2=await supabase.from("order_items").insert(items.map((x:any)=>({order_id:o.id,menu_item_id:x.id,quantity:x.qty}))).then(r=>r.error);if(e2){toast(e2.message,"error");return}
  clear();toast("Order placed successfully");r.push("/orders")}
 return(<main className="mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-32"><h1 className="flex items-center gap-3 font-serif text-5xl text-olive"><ShoppingBag/>Your cart</h1>
 {!items.length&&<p className="mt-8">Your cart is empty. <Link href="/menu" className="font-bold underline">Browse the menu</Link></p>}
 <div className="mt-8 space-y-3">{items.map((x:any)=><div key={x.id} className="flex items-center justify-between rounded-2xl bg-white p-4"><div><p className="font-bold">{x.name}</p><p className="text-sm text-charcoal/60">${x.price.toFixed(2)}</p></div><div className="flex items-center gap-3"><button aria-label="Less" onClick={()=>chg(x.id,-1)}><Minus/></button>{x.qty}<button aria-label="More" onClick={()=>chg(x.id,1)}><Plus/></button><b className="w-20 text-right">${(x.price*x.qty).toFixed(2)}</b></div></div>)}</div>
 {!!items.length&&<div className="mt-8 flex items-center justify-between"><p className="font-serif text-3xl">Total ${total.toFixed(2)}</p><button onClick={place} className="btn-d">Place order</button></div>}</main>)}
