class DblTimestampHelper {
  static timestampEncoding = ['B','C','D','E','F','G','H','J','K','M','N','P','Q','R','S','T'];

  static createDblTimestamp() {
    let creationDate = Date.now().toString(16);
    let encodedTimestamp = '';

    for (let i = 0; i < creationDate.length; i++) {
      encodedTimestamp += DblTimestampHelper.timestampEncoding[parseInt(creationDate[i], 16)];
    }

    return encodedTimestamp;
  }

  static decodeDblTimestamp(timestampString) {
    let decodedDblTimestamp = '';

    for (let i = 0; i < timestampString.length; i++) {
      decodedDblTimestamp += DblTimestampHelper.timestampEncoding.indexOf(timestampString[i]).toString(16);
    }

    return decodedDblTimestamp;
  }
}

function getSelectedGenerationmethod() {
  return document.querySelector('[name="qr-method"]:checked')?.value;
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

function downloadCanvasAsImage(container, filename) {
  const canvas = container.querySelector('canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `HotCoffeGenerator_Imágenes/${filename}.png`;
  link.click();
}

document.addEventListener("DOMContentLoaded", () => {
  const dblRegexPattern = new RegExp('^4,[a-zA-Z0-9]{8}');

  const methodFieldset = document.querySelector('.qr-method');
  const formElement = document.querySelector('#dbl-qr');
  const fileField = document.querySelector('#qrcode');
  const qrField = document.querySelector('#qrcode_b64');

  const friendInput1 = document.querySelector('[name="dbl-qr-1"]');
  const friendInput2 = document.querySelector('[name="dbl-qr-2"]');
  const friendInput3 = document.querySelector('[name="dbl-qr-3"]');

  const qrDisplay1 = document.querySelector('#qr-display-1');
  const qrDisplay2 = document.querySelector('#qr-display-2');
  const qrDisplay3 = document.querySelector('#qr-display-3');

  const friendList = [
    { input: friendInput1, display: qrDisplay1 },
    { input: friendInput2, display: qrDisplay2 },
    { input: friendInput3, display: qrDisplay3 },
  ];

  // Persistencia local de los códigos de amigo
  friendList.forEach(({ input }, i) => {
    const stored = localStorage.getItem(`friend-code-${i + 1}`);
    if (stored) input.value = stored;

    input.addEventListener("input", () => {
      localStorage.setItem(`friend-code-${i + 1}`, input.value);
    });
  });

  fileField.addEventListener("change", async function({ target }) {
    if (target.files && target.files.length) {
      try {
        const uploadedImageBase64 = await convertFileToBase64(target.files[0]);
        qrField.value = uploadedImageBase64;
      } catch (err) {
        alert("Error leyendo la imagen.");
      }
    }
  });

  methodFieldset?.addEventListener('change', () => {
    fileField.toggleAttribute('required', getSelectedGenerationmethod() === 'manual');
  });

  function decodeImageFromBase64(data, callback) {
    qrcode.callback = callback;
    qrcode.decode(data);
  }

  formElement.addEventListener('submit', (event) => {
    event.preventDefault();

    if (getSelectedGenerationmethod() === 'auto') {
      friendList.forEach(friend => {
        if (!friend.input.value.length) return;

        const newQr = '4,' + friend.input.value + DblTimestampHelper.createDblTimestamp();
        friend.display.innerHTML = '';

        new QRCode(friend.display, {
          text: newQr,
          width: 180,
          height: 180,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });

        setTimeout(() => {
          downloadCanvasAsImage(friend.display, `${friend.input.value}_${Date.now()}`);
        }, 500);
      });
      return;
    }

    decodeImageFromBase64(qrField.value, (decodedInformation) => {
      if (!decodedInformation.match(dblRegexPattern)) {
        alert('No se pudo leer el QR. Recorta la imagen si es necesario.');
        return;
      }

      friendList.forEach(friend => {
        if (!friend.input.value.length) return;

        const newQr = decodedInformation.replace(dblRegexPattern, '4,' + friend.input.value);
        friend.display.innerHTML = '';

        new QRCode(friend.display, {
          text: newQr,
          width: 180,
          height: 180,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });

        setTimeout(() => {
          downloadCanvasAsImage(friend.display, `${friend.input.value}_${Date.now()}`);
        }, 500);
      });
    });
  });
});
