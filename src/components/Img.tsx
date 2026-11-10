"use client";
import { useState } from "react";import { Utensils } from "lucide-react";
export default function Img({src,alt,className=""}:{src?:string;alt:string;className?:string}){const [bad,setBad]=useState(!src);
 return bad?<div className={`grid place-items-center bg-olive text-gold ${className}`}><Utensils size={34}/></div>:<img src={src} alt={alt} loading="lazy" onError={()=>setBad(true)} className={`object-cover ${className}`}/>}
