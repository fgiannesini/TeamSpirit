import './style.scss';
document
  .querySelector<HTMLButtonElement>('button')!
  .addEventListener('click', () => {
    window.location.href = '/render/flow.html';
  });
