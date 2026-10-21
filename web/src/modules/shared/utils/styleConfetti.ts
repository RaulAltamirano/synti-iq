const CONFETTI_COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];

function unitRandom(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] / 2 ** 32;
}

export function styleConfettiElements(root: ParentNode = document): void {
  root.querySelectorAll('.confetti').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;

    const left = `${unitRandom() * 100}%`;
    const width = `${unitRandom() * 8 + 5}px`;
    const bgColor = CONFETTI_COLORS[Math.floor(unitRandom() * CONFETTI_COLORS.length)];
    const fallDuration = `${unitRandom() * 3 + 2}s`;
    const fallDelay = `${unitRandom() * 1.5}s`;
    const swayAmount = `${unitRandom() * 50 - 25}px`;
    const swayDuration = `${unitRandom() * 2 + 2}s`;
    const swayDelay = `${unitRandom() * 1}s`;

    node.style.width = width;
    node.style.height = width;
    node.style.left = left;
    node.style.backgroundColor = bgColor;
    node.style.opacity = '0';
    node.style.borderRadius = unitRandom() > 0.5 ? '50%' : '0';
    node.style.setProperty('--fall-duration', fallDuration);
    node.style.setProperty('--fall-delay', fallDelay);
    node.style.setProperty('--sway-amount', swayAmount);
    node.style.setProperty('--sway-duration', swayDuration);
    node.style.setProperty('--sway-delay', swayDelay);
  });
}
