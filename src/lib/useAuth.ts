"use client";
import { useEffect,useState } from "react";import { supabase } from "./supabase";
export function useAuth(){const [s,setS]=useState({user:null as any,role:"",loading:true});
 useEffect(()=>{const load=async()=>{const {data:{user}}=await supabase.auth.getUser();let role="";if(user){const {data}=await supabase.from("profiles").select("role").eq("id",user.id).single();role=data?.role||"customer"}setS({user,role,loading:false})};load();
 const {data:l}=supabase.auth.onAuthStateChange(()=>{load()});return()=>l.subscription.unsubscribe()},[]);return s}
