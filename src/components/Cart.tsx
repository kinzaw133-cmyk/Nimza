"use client";
import { createContext,useContext,useEffect,useState } from "react";import { toast } from "@/lib/notify";
const Ctx=createContext<any>(null);export const useCart=()=>useContext(Ctx);
export function CartProvider({children}:any){const [items,setItems]=useState<any[]>([]);
 useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem("nimza-cart")||"[]"))}catch{}},[]);useEffect(()=>{localStorage.setItem("aurel-cart",JSON.stringify(items))},[items]);
 const add=(i:any)=>{setItems(p=>p.find(x=>x.id===i.id)?p.map(x=>x.id===i.id?{...x,qty:x.qty+1}:x):[...p,{id:i.id,name:i.name,price:Number(i.price),qty:1}]);toast(`${i.name} added to cart`)};
 const chg=(id:number,d:number)=>setItems(p=>p.map(x=>x.id===id?{...x,qty:x.qty+d}:x).filter(x=>x.qty>0));
 return<Ctx.Provider value={{items,add,chg,clear:()=>setItems([]),count:items.reduce((s,x)=>s+x.qty,0),total:items.reduce((s,x)=>s+x.price*x.qty,0)}}>{children}</Ctx.Provider>}
