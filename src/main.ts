import './style.scss';
document
  .querySelector<HTMLButtonElement>('button')!
  .addEventListener('click', () => {
    window.location.href = '/flow/flow.html';
  });
