/**
 * @typedef {{id:string,slug:string,name:string,categoryId:string,description:string,price:number,oldPrice:number|null,unit:string,image:string,images:string[],icon?:string,popular:boolean,popularity:number,labels:('hit'|'new'|'sale')[],inStock:boolean,specs:Record<string,string>}} Product
 * @typedef {{id:string,name:string,icon:string}} Category
 * @typedef {{id:string,qty:number}} CartItem
 * @typedef {{name:string,phone:string,city:string,street:string,apartment?:string,comment?:string}} Customer
 * @typedef {{number:string,createdAt:string,customer:Customer,method:'delivery'|'pickup',payment:'cash'|'card',items:{productId:string,name:string,price:number,qty:number}[],subtotal:number,delivery:number,total:number,demo:boolean}} Order
 */
// Единый формат ответов слоя данных
export const ok = (data) => ({ ok: true, data, error: null });
export const fail = (code, message, details) => ({ ok: false, data: null, error: { code, message, details } });
// Централизованная обработка ошибок: любой сбой превращается в fail()
export async function guard(fn) {
  try { return await fn(); }
  catch (e) { console.error(e); return fail('UNKNOWN', 'Что-то пошло не так. Попробуйте ещё раз.'); }
}
