import Swal from "sweetalert2";
const T=Swal.mixin({toast:true,position:"top-end",showConfirmButton:false,timer:2500,timerProgressBar:true,background:"#343D27",color:"#F7F4EC",iconColor:"#B99A5B"});
export const toast=(title:string,icon:"success"|"error"|"info"="success")=>T.fire({icon,title});
export const confirmDel=(text:string)=>Swal.fire({title:"Are you sure?",text,icon:"warning",showCancelButton:true,confirmButtonColor:"#343D27",cancelButtonColor:"#8C8F7A",confirmButtonText:"Yes, delete",background:"#F7F4EC"}).then(r=>r.isConfirmed);
export const ask=(title:string,value="")=>Swal.fire({title,input:"text",inputValue:value,showCancelButton:true,confirmButtonColor:"#343D27",background:"#F7F4EC"}).then(r=>r.isConfirmed?String(r.value||""):null);
