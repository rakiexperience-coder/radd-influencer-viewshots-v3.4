export async function enhanceImageFile(file: File): Promise<HTMLCanvasElement> {
  const img = await fileToImage(file);
  const scale = Math.min(2, img.width < 1200 || img.height < 1200 ? 2 : 1);

  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  const ctx = c.getContext("2d", { alpha: false })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, c.width, c.height);

  // Mild auto-levels
  const id = ctx.getImageData(0, 0, c.width, c.height);
  const d = id.data;
  const hist = new Array(256).fill(0);
  for (let i = 0; i < d.length; i += 4) {
    const y = (0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2])|0;
    hist[y]++;
  }
  let cum = 0, total = d.length/4;
  const lowCut = total*0.01, highCut = total*0.99;
  let low = 0, high = 255;
  for (let i=0;i<256;i++){ cum+=hist[i]; if(cum>=lowCut){ low=i; break; } }
  cum=0; for (let i=255;i>=0;i--){ cum+=hist[i]; if(cum>=total-highCut){ high=i; break; } }
  const scaleL = 255/Math.max(1, (high-low));
  for (let i=0;i<d.length;i+=4){
    let r=(d[i]-low)*scaleL, g=(d[i+1]-low)*scaleL, b=(d[i+2]-low)*scaleL;
    d[i]=clamp(r); d[i+1]=clamp(g); d[i+2]=clamp(b);
  }
  ctx.putImageData(id,0,0);

  // Light sharpen
  const blur = document.createElement("canvas");
  blur.width=c.width; blur.height=c.height;
  const bctx = blur.getContext("2d", {alpha:false})!;
  bctx.filter = "blur(1px)";
  bctx.drawImage(c,0,0);
  const A = ctx.getImageData(0,0,c.width,c.height);
  const B = bctx.getImageData(0,0,c.width,c.height);
  const dataA=A.data, dataB=B.data;
  const amount = 0.3;
  for (let i=0;i<dataA.length;i+=4){
    dataA[i]   = clamp(dataA[i]   + (dataA[i]   - dataB[i])   * amount);
    dataA[i+1] = clamp(dataA[i+1] + (dataA[i+1] - dataB[i+1]) * amount);
    dataA[i+2] = clamp(dataA[i+2] + (dataA[i+2] - dataB[i+2]) * amount);
  }
  ctx.putImageData(A,0,0);
  return c;
}

function fileToImage(file: File): Promise<HTMLImageElement>{
  return new Promise((res,rej)=>{
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload=()=>{ URL.revokeObjectURL(url); res(img); };
    img.onerror=rej;
    img.src=url;
  });
}
function clamp(v:number){ return v<0?0:v>255?255:v; }
