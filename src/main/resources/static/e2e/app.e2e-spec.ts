import { SiglaPage } from './app.po';

describe('sigla App', () => {
  let page: SiglaPage;

  beforeEach(() => {
    page = new SiglaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
