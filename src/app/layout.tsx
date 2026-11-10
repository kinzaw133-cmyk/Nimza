import "./globals.css";import { Playfair_Display,DM_Sans } from "next/font/google";import { CartProvider } from "@/components/Cart";import Navbar from "@/components/Navbar";import Footer from "@/components/Footer";
const pf=Playfair_Display({subsets:["latin"],variable:"--font-pf"});const dm=DM_Sans({subsets:["latin"],variable:"--font-dm"});
export const metadata={title:"Nimza Restaurant"};
export default function R({children}:{children:React.ReactNode}){return(<html lang="en" className={`${pf.variable} ${dm.variable}`}><body><CartProvider><Navbar/>{children}<Footer/></CartProvider></body></html>)}
