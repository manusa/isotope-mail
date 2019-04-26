
const dataUrlToBlob = dataUrl => {
  const dataUrlParts = dataUrl.split(',');
  const mime = dataUrlParts[0].match(/:(.*?);/)[1];
  const binStr = atob(dataUrlParts[1]);
  const len = binStr.length;
  const u8arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8arr[i] = binStr.charCodeAt(i);
  }
  return new Blob([u8arr], {type: mime});
};

export const compressImage = (imageBlob, type = 'image/jpeg', quality = 0.85) => new Promise(resolve => {
  const imageUrl = URL.createObjectURL(imageBlob);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.imageSmoothingEnabled = true;
    ctx.mozImageSmoothingEnabled = true;
    ctx.oImageSmoothingEnabled = true;
    ctx.webkitImageSmoothingEnabled = true;
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(imageUrl);
    resolve(dataUrlToBlob(canvas.toDataURL(type, quality)));
  };
  image.src = imageUrl;
});

