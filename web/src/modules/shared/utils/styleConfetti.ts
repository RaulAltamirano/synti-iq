const CONFETTI_COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];

export function styleConfettiElements(root: ParentNode = document): void {
  root.querySelectorAll('.confetti').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;

    const left = `${Math.random() * 100}%`;
    const width = `${Math.random() * 8 + 5}px`;
    const bgColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const fallDuration = `${Math.random() * 3 + 2}s`;
    const fallDelay = `${Math.random() * 1.5}s`;
    const swayAmount = `${Math.random() * 50 - 25}px`;
    const swayDuration = `${Math.random() * 2 + 2}s`;
    const swayDelay = `${Math.random() * 1}s`;

    node.style.width = width;
    node.style.height = width;
    node.style.left = left;
    node.style.backgroundColor = bgColor;
    node.style.opacity = '0';
    node.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    node.style.setProperty('--fall-duration', fallDuration);
    node.style.setProperty('--fall-delay', fallDelay);
    node.style.setProperty('--sway-amount', swayAmount);
    node.style.setProperty('--sway-duration', swayDuration);
    node.style.setProperty('--sway-delay', swayDelay);
  });
}
