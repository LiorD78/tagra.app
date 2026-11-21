// Validace shop-schema.js v jsdom proti fixture (handoff/79-6). Použití: node validate.mjs <cesta k jsdom>
import fs from 'fs';import {createRequire} from 'module';
const require=createRequire(process.argv[2]+'/');const {JSDOM}=require('jsdom');
const js=fs.readFileSync(new URL('../../assets/js/shop-schema.js',import.meta.url),'utf8');
let P='/x/';function page(lang,cls,name,cat,pid,sku,price,ship,detail=true){
  const head='<head><title>x</title></head>';
  if(!detail)return `<html lang="${lang}">${head}<body class="type-index"></body></html>`;
  return `<html lang="${lang}">${head}<body class="type-product type-detail ${cls}"><div class="p-detail" itemscope itemtype="https://schema.org/Product">
<meta itemprop="name" content="${name}"><meta itemprop="category" content="${cat}"><div class="p-detail-inner"><meta itemprop="url" content="https://shop.tagra.app${P}"></div><meta itemprop="image" content="https://cdn.myshoptet.com/x.jpg"><meta itemprop="description" content="d"><meta itemprop="productID" content="${pid}"><div class="p-code"><meta itemprop="sku" content="${sku}"></div>
<span itemprop="offers" itemscope itemtype="https://schema.org/Offer"><link itemprop="availability" href="https://schema.org/InStock"><meta itemprop="url" content="https://shop.tagra.app${P}"><meta itemprop="price" content="${price}"><meta itemprop="priceCurrency" content="EUR"><link itemprop="itemCondition" href="https://schema.org/NewCondition">
<span id="microdata-shipping-details-0" itemprop="shippingDetails" itemscope itemtype="https://schema.org/OfferShippingDetails"><meta itemprop="shippingLabel" content="s"><span itemprop="shippingRate" itemscope itemtype="https://schema.org/MonetaryAmount"><meta itemprop="value" content="${ship}"><meta itemprop="currency" content="EUR"></span><span itemprop="shippingDestination" itemscope itemtype="https://schema.org/DefinedRegion"><meta itemprop="addressCountry" content="DE"></span></span></span></div></body></html>`;}
function parse(node){ // minimální microdata parser
  const o={};
  (function walk(n,o){for(const c of n.children){const p=c.getAttribute('itemprop');
    if(p){let v;if(c.hasAttribute('itemscope')){v={'@type':c.getAttribute('itemtype').split('/').pop()};walk(c,v);}
      else v=c.tagName==='META'?c.getAttribute('content'):c.tagName==='LINK'?c.getAttribute('href'):c.textContent;
      (o[p]=o[p]||[]).push(v);} else walk(c,o);}})(node,o);return o;}
const cases=[
 ['en','id-705 in-tagra-software','TAGRA TRUCKER','Úvodní stránka > TAGRA software > TAGRA TRUCKER',45,'TDT0020','59.29','10.07','/tagra-trucker/'],
 ['en','id-710 in-accessories','SMART CARD READER','Úvodní stránka > Accessories > SMART CARD READER',70,'TDT0030','19.00','10.07','/smart-card-reader/'],
 ['de','id-705 in-tagra-software','TAGRA 4','Úvodní stránka > TAGRA software > TAGRA 4',46,'TDT0004','59.29','0.00','/de/tagra-4/'],
 ['en','id-708 in-download-devices','DOWNLOAD BOX II S','Úvodní stránka > Download devices > DOWNLOAD BOX II S',63,'TDT0002','361.79','0.00','/download-box-ii-s/'],
 ['es','id-705 in-tagra-software','TAGRA 4','Úvodní stránka > TAGRA software > TAGRA 4',46,'TDT0004','59.29','0.00','/es/tagra-4/'],
 ['es',null,null,null,null,null,null,null,'/es/',false]];
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('  CHYBA:',m);}};
for(const [lang,cls,name,cat,pid,sku,price,ship,path,detail] of cases){
  P=path;const dom=new JSDOM(page(lang,cls,name,cat,pid,sku,price,ship,detail!==false),{runScripts:'outside-only',url:'https://shop.tagra.app'+path});
  await new Promise(r=>dom.window.addEventListener("load",r));dom.window.eval(js);dom.window.eval(js); // 2× = idempotence
  const d=dom.window.document;console.log('\n=== '+path+' (lang '+lang+')');
  const orgs=d.querySelectorAll('script#tgs-org-ld');ok(orgs.length===1,'Organization 1×');
  const org=JSON.parse(orgs[0].textContent);console.log('Organization:',JSON.stringify(org));
  ok(org['@id']==='https://tagra.app/#organization'&&org.address&&org.logo&&org.contactPoint.length===2,'Organization pole');
  const r=d.querySelector('.p-detail');if(!r){continue;}
  const m=parse(r);console.log('Product microdata:',JSON.stringify(m,null,1));
  ok(!/Úvodní/.test(m.category[0]),'kategorie bez CZ kořene');
  ok(m.brand&&m.brand.length===1&&m.mpn[0]===sku,'brand/mpn');
  const hw=/708/.test(cls)||/smart-card-reader/.test(path);ok(m.brand[0].name[0]===(hw?'Truck Data Technology':'TAGRA'),'brand hodnota');
  const of=m.offers[0];ok(of.price[0]===price&&of.priceCurrency[0]==='EUR'&&of.availability&&of.url&&of.itemCondition,'Offer povinná pole');
  ok(!!of.hasMerchantReturnPolicy===hw,'return policy jen HW');
  ok(of.shippingDetails[0].shippingRate[0].value[0]==='0.00'&&of.shippingDetails[0].shippingRate[0].currency[0]==='EUR','shippingRate 0.00, měna beze změny');
  ok(d.querySelectorAll('[itemprop=brand]').length===1&&d.querySelectorAll('[itemprop=mpn]').length===1,'idempotence');
}
console.log(fail?`\nSELHÁNÍ: ${fail}`:'\nVŠE OK');process.exit(fail?1:0);
