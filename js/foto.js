// Reduz a foto no próprio aparelho antes de salvar (JPEG, lado maior limitado, tamanho máximo).
function carregarImagem(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("ilegivel")); };
    img.src = url;
  });
}

// bytes aproximados de um dataURL base64
const tamanho = dataURL => Math.ceil((dataURL.length - dataURL.indexOf(",") - 1) * 3 / 4);

export async function comprimirImagem(file, ladoMax, bytesMax) {
  const img = await carregarImagem(file);
  if (!img.naturalWidth || !img.naturalHeight) throw new Error("ilegivel");
  let escala = Math.min(1, ladoMax / Math.max(img.naturalWidth, img.naturalHeight));
  for (let tentativa = 0; tentativa < 6; tentativa++) {
    const largura = Math.max(1, Math.round(img.naturalWidth * escala));
    const altura = Math.max(1, Math.round(img.naturalHeight * escala));
    const canvas = document.createElement("canvas");
    canvas.width = largura; canvas.height = altura;
    canvas.getContext("2d").drawImage(img, 0, 0, largura, altura);
    for (let q = 0.85; q >= 0.45; q -= 0.1) {
      const dados = canvas.toDataURL("image/jpeg", q);
      if (tamanho(dados) <= bytesMax) return { dados, largura, altura };
    }
    escala *= 0.8; // ainda grande: diminui a imagem e tenta de novo
  }
  throw new Error("grande");
}
