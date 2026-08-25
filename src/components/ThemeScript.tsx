import Script from "next/script";

const BOOT = `(function(){var k='anna-skin';var ok={beige:1,white:1,black:1};var legacy={dark:'beige',gray:'beige'};var q=new URLSearchParams(location.search).get('theme');if(q&&legacy[q])q=legacy[q];var stored=(function(){try{return localStorage.getItem(k)}catch(e){return null}})();if(stored&&legacy[stored])stored=legacy[stored];var t=(q&&ok[q]?q:null)||(stored&&ok[stored]?stored:null)||'beige';if(!ok[t])t='beige';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t==='black'?'dark':'light';if(q&&ok[q])try{localStorage.setItem(k,q)}catch(e){}})();`;

export function ThemeScript() {
  return (
    <Script id="anna-skin" strategy="beforeInteractive">
      {BOOT}
    </Script>
  );
}
