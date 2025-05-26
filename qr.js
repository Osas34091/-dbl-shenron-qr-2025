class DblTimestampHelper {
  static timestampEncoding = ['B','C','D','E','F','G','H','J','K','M','N','P','Q','R','S','T'];

  static createDblTimestamp() {
    const creationDate = Date.now().toString(16);
    return [...creationDate]
      .map(char => this.timestampEncoding[parseInt(char, 16)])
      .join('');
  }

  static decodeDblTimestamp(timestampString) {
    return [...timestampString]
      .map(char => this.timestampEncoding.indexOf(char).toString(16))
      .join('');
  }
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
  const formElement = document.querySelector('#dbl-qr');

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

  // Load saved friend codes
  friendList.forEach(({ input }, i) => {
    const stored = localStorage.getItem(`friend-code-${i + 1}`);
    if (stored) input.value = stored;

    input.addEventListener("input", () => {
      localStorage.setItem(`friend-code-${i + 1}`, input.value);
    });
  });

  formElement.addEventListener('submit', (event) => {
    event.preventDefault();

    friendList.forEach(friend => {
      const code = friend.input.value.trim();
      if (!code) return;

      const timestamp = DblTimestampHelper.createDblTimestamp();
      const qrData = `4,${code}${timestamp}`;

      friend.display.innerHTML = '';

      new QRCode(friend.display, {
        text: qrData,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });

      setTimeout(() => {
        downloadCanvasAsImage(friend.display, `${code}_${Date.now()}`);
      }, 500);
    });
  });
});
