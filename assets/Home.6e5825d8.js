import{d as e,u as a,m as t,c as s,n as l,e as o,f as i,j as n,q as c,t as r,_ as v,s as f,v as u,x as d,F as m,k as p,b as k,y as h}from"./app.321c63ee.js";const x=f("data-v-024e1674");u("data-v-024e1674");const y={key:0,class:"home-hero"},g={key:0,class:"figure"},b={key:1,id:"main-title",class:"title"},$={key:2,class:"description"};d();var _=e({expose:[],setup(e){const f=a(),u=t(),d=s((()=>u.value.heroImage||m.value||k.value||_.value)),m=s((()=>null!==u.value.heroText)),p=s((()=>u.value.heroText||f.value.title)),k=s((()=>null!==u.value.tagline)),h=s((()=>u.value.tagline||f.value.description)),_=s((()=>u.value.actionLink&&u.value.actionText)),I=s((()=>u.value.altActionLink&&u.value.altActionText));return x(((e,a)=>l(d)?(o(),i("header",y,[e.$frontmatter.heroImage?(o(),i("figure",g,[n("img",{class:"image",src:e.$withBase(e.$frontmatter.heroImage),alt:e.$frontmatter.heroAlt},null,8,["src","alt"])])):c("v-if",!0),l(m)?(o(),i("h1",b,r(l(p)),1)):c("v-if",!0),l(k)?(o(),i("p",$,r(l(h)),1)):c("v-if",!0),l(_)?(o(),i(v,{key:3,item:{link:l(u).actionLink,text:l(u).actionText},class:"action"},null,8,["item"])):c("v-if",!0),l(I)?(o(),i(v,{key:4,item:{link:l(u).altActionLink,text:l(u).altActionText},class:"action alt"},null,8,["item"])):c("v-if",!0)])):c("v-if",!0)))}});_.__scopeId="data-v-024e1674";const I=f("data-v-e5f225ce");u("data-v-e5f225ce");const T={key:0,class:"home-features"},A={class:"wrapper"},L={class:"container"},j={class:"features"},w={key:0,class:"title"},q={key:1,class:"details"};d();var B=e({expose:[],setup(e){const a=t(),v=s((()=>a.value.features&&a.value.features.length>0)),f=s((()=>a.value.features?a.value.features:[]));return I(((e,a)=>l(v)?(o(),i("div",T,[n("div",A,[n("div",L,[n("div",j,[(o(!0),i(m,null,p(l(f),((e,a)=>(o(),i("section",{key:a,class:"feature"},[e.title?(o(),i("h2",w,r(e.title),1)):c("v-if",!0),e.details?(o(),i("p",q,r(e.details),1)):c("v-if",!0)])))),128))])])])])):c("v-if",!0)))}});B.__scopeId="data-v-e5f225ce";const C={},F=f("data-v-df8b2502");u("data-v-df8b2502");const z={key:0,class:"footer"},D={class:"container"},E={class:"text"};d();const G=F(((e,a)=>e.$frontmatter.footer?(o(),i("footer",z,[n("div",D,[n("p",E,r(e.$frontmatter.footer),1)])])):c("v-if",!0)));C.render=G,C.__scopeId="data-v-df8b2502";const H=f("data-v-6e1bdf43");u("data-v-6e1bdf43");const J={class:"home","aria-labelledby":"main-title"},K={class:"home-content"};d();var M=e({expose:[],setup:e=>H(((e,a)=>{const t=k("Content");return o(),i("main",J,[n(_),h(e.$slots,"hero"),n(B),n("div",K,[n(t)]),h(e.$slots,"features"),n(C),h(e.$slots,"footer")])}))});M.__scopeId="data-v-6e1bdf43";export default M;
